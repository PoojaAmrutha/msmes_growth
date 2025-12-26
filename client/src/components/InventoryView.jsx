import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

const InventoryView = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const userId = localStorage.getItem('userId');

    // New Product Form
    const [newProd, setNewProd] = useState({ name: '', stock: '', price: '', reorderLevel: '' });

    const fetchProducts = () => {
        fetch(`http://localhost:5000/api/inventory/${userId}`)
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const [alerts, setAlerts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    // Fetch Products, Alerts and Suppliers
    const fetchAllData = () => {
        // Products
        fetch(`http://localhost:5000/api/inventory/${userId}`)
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

        // Market Alerts
        fetch('http://localhost:5000/api/inventory/market/alerts')
            .then(res => res.json())
            .then(data => setAlerts(data))
            .catch(err => console.error(err));

        // Suppliers (Based on type - mock type distribution)
        fetch('http://localhost:5000/api/inventory/suppliers/list?type=Distribution')
            .then(res => res.json())
            .then(data => setSuppliers(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleRestock = (productId) => {
        const qty = prompt("Enter quantity to restock:", "10");
        if (qty && !isNaN(qty)) {
            fetch('http://localhost:5000/api/inventory/restock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity: parseInt(qty) })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.msg === 'Stock updated') {
                        alert(`Restocked successfully! New Stock: ${data.product.stock}`);
                        fetchAllData(); // Refresh list
                    }
                })
                .catch(err => console.error(err));
        }
    };

    const handleAddProduct = (e) => {
        e.preventDefault();
        fetch('http://localhost:5000/api/inventory/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newProd, userId })
        })
            .then(res => res.json())
            .then(data => {
                if (data.product) {
                    alert('Product Removed!'); // Just kidding, Added
                    alert('Product Added Successfully!');
                    setShowModal(false);
                    setNewProd({ name: '', stock: '', price: '', reorderLevel: '' });
                    fetchAllData();
                }
            })
            .catch(err => console.error(err));
    };

    if (loading) return <div className="loading">Loading Inventory...</div>;

    return (
        <div className="view-container">
            <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Inventory Management</h2>
                <button className="primary-btn" style={{ width: 'auto' }} onClick={() => setShowModal(true)}>
                    <Plus size={18} style={{ marginRight: 5 }} /> Add Product
                </button>
            </div>

            <div className="inventory-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Current Stock</th>
                            <th>Price</th>
                            <th>Reorder Level</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => {
                            let status = 'Good';
                            let statusClass = 'good';
                            if (p.stock <= p.reorderLevel) {
                                status = 'Low';
                                statusClass = 'low';
                            }
                            if (p.stock <= 5) {
                                status = 'Critical';
                                statusClass = 'critical';
                            }

                            return (
                                <tr key={p._id}>
                                    <td>{p.name}</td>
                                    <td>{p.stock}</td>
                                    <td>₹{p.price}</td>
                                    <td>{p.reorderLevel}</td>
                                    <td>
                                        <span className={`status-badge ${statusClass}`}>{status}</span>
                                    </td>
                                    <td>
                                        <button className="action-btn" onClick={() => handleRestock(p._id)}>Restock</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h3>Add New Product</h3>
                            <X style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
                        </div>
                        <form onSubmit={handleAddProduct}>
                            <div className="form-group">
                                <label>Product Name</label>
                                <input required type="text" value={newProd.name} onChange={e => setNewProd({ ...newProd, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Initial Stock</label>
                                <input required type="number" value={newProd.stock} onChange={e => setNewProd({ ...newProd, stock: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Price per Unit (₹)</label>
                                <input required type="number" value={newProd.price} onChange={e => setNewProd({ ...newProd, price: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Reorder Level (Alert Threshold)</label>
                                <input required type="number" value={newProd.reorderLevel} onChange={e => setNewProd({ ...newProd, reorderLevel: e.target.value })} />
                            </div>
                            <button type="submit" className="primary-btn">Save Product</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="inventory-extras" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                <div className="alerts-section">
                    <h3 style={{ color: '#dc2626' }}>🔥 High Demand Alerts (Market)</h3>
                    <p className="subtitle">Products running low across the network.</p>
                    <ul className="alert-list">
                        {alerts.length === 0 ? <p>No market alerts.</p> : alerts.map((a, i) => (
                            <li key={i} className="alert-item">
                                <strong>{a.productName}</strong> is in high demand!
                                <span className="tag">Low System Stock</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="suppliers-section">
                    <h3 style={{ color: '#4f46e5' }}>🚛 Recommended Suppliers</h3>
                    <p className="subtitle">Based on your business type.</p>
                    <ul className="supplier-list">
                        {suppliers.map((s) => (
                            <li key={s.id} className="supplier-item">
                                <div>
                                    <strong>{s.name}</strong>
                                    <br />
                                    <small>{s.type}</small>
                                </div>
                                <span className="rating">★ {s.rating}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <style>{`
                .alert-list, .supplier-list { list-style: none; padding: 0; }
                .alert-item, .supplier-item { 
                    background: white; padding: 1rem; margin-bottom: 0.5rem; 
                    border-radius: 8px; border: 1px solid #e2e8f0;
                    display: flex; justify-content: space-between; align-items: center;
                }
                .alert-item { border-left: 4px solid #dc2626; }
                .supplier-item { border-left: 4px solid #4f46e5; }
                .tag { background: #fecaca; color: #b91c1c; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
                .rating { background: #fef3c7; color: #d97706; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
                .subtitle { color: #64748b; font-size: 0.9rem; margin-bottom: 1rem; }
            `}</style>
        </div>
    );
};

export default InventoryView;
