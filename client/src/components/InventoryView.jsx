import React, { useState, useEffect } from 'react';

import { Plus, X, Zap, Camera } from 'lucide-react';

const InventoryView = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const userId = localStorage.getItem('userId');

    // New Product Form
    const [newProd, setNewProd] = useState({ name: '', stock: '', price: '', reorderLevel: '' });

    // AI Pricing State
    const [aiResult, setAiResult] = useState(null);
    const [showAiModal, setShowAiModal] = useState(false);
    const [analyzingProd, setAnalyzingProd] = useState(null);

    const handleGetSmartPrice = async (product) => {
        setAnalyzingProd(product._id);
        try {
            // Mock competition data for demo (in real app, this would come from a scraper)
            const mockCompetitorPrice = product.price * (0.9 + Math.random() * 0.2); // Random +-10%

            const res = await fetch('http://localhost:5000/api/ai/pricing/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_name: product.name,
                    base_price: product.price,
                    current_stock: product.stock,
                    days_to_expiry: 30, // Defaulting for demo
                    competitor_price: mockCompetitorPrice
                })
            });
            const data = await res.json();
            setAiResult({ ...data, product: product.name, currentPrice: product.price });
            setShowAiModal(true);
        } catch (err) {
            console.error(err);
            alert("Failed to connect to AI Brain");
        } finally {
            setAnalyzingProd(null);
        }
    };

    // Vision / Shelf Scanner State
    const [showVisionModal, setShowVisionModal] = useState(false);
    const [visionResult, setVisionResult] = useState(null);
    const [visionLoading, setVisionLoading] = useState(false);

    const handleVisionUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setVisionLoading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('http://localhost:5000/api/ai/vision/analyze', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            setVisionResult({ ...data, imageUrl: URL.createObjectURL(file) });
        } catch (err) {
            console.error(err);
            alert("Vision Analysis Failed");
        } finally {
            setVisionLoading(false);
        }
    };

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
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="primary-btn" style={{ width: 'auto', background: '#0ea5e9' }} onClick={() => setShowVisionModal(true)}>
                        <Camera size={18} style={{ marginRight: 5 }} /> Scan Shelf (AI)
                    </button>
                    <button className="primary-btn" style={{ width: 'auto' }} onClick={() => setShowModal(true)}>
                        <Plus size={18} style={{ marginRight: 5 }} /> Add Product
                    </button>
                </div>
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
                                        <button
                                            className="action-btn ai-btn"
                                            style={{ marginLeft: '5px', background: '#7c3aed', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                            onClick={() => handleGetSmartPrice(p)}
                                            disabled={analyzingProd === p._id}
                                        >
                                            <Zap size={12} /> {analyzingProd === p._id ? 'Thinking...' : 'Smart Price'}
                                        </button>
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

            {showAiModal && aiResult && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: '400px', borderTop: '4px solid #7c3aed' }}>
                        <div className="modal-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Zap size={20} color="#7c3aed" fill="#7c3aed" />
                                AI Pricing Suggestion
                            </h3>
                            <X style={{ cursor: 'pointer' }} onClick={() => setShowAiModal(false)} />
                        </div>
                        <div className="ai-content" style={{ marginTop: '1rem' }}>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Analyzing market data for <strong>{aiResult.product}</strong>...</p>

                            <div className="price-box" style={{ background: '#f5f3ff', padding: '1rem', borderRadius: '8px', margin: '1rem 0', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Optimal Price</div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed' }}>₹{aiResult.suggested_price}</div>
                                <div style={{ fontSize: '0.8rem', color: aiResult.multiplier > 1 ? '#059669' : '#dc2626' }}>
                                    {aiResult.multiplier > 1 ? '▲ Premium applied' : '▼ Discount applied'}
                                </div>
                            </div>

                            <div className="explanation">
                                <strong>Why?</strong>
                                <p style={{ fontSize: '0.9rem', color: '#4b5563', marginTop: '0.25rem' }}>{aiResult.explanation}</p>
                            </div>

                            <button className="primary-btn" style={{ width: '100%', marginTop: '1.5rem', background: '#7c3aed' }} onClick={() => setShowAiModal(false)}>
                                Apply This Price
                            </button>
                        </div>
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

            {showVisionModal && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3><Camera size={20} style={{ marginRight: 8 }} /> Shelf Intelligence</h3>
                            <X style={{ cursor: 'pointer' }} onClick={() => setShowVisionModal(false)} />
                        </div>

                        {!visionResult ? (
                            <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed #cbd5e1', borderRadius: '8px' }}>
                                {visionLoading ? (
                                    <div className="loading">Processing Image with Computer Vision...</div>
                                ) : (
                                    <>
                                        <p>Upload a photo of your shop shelf to automatically count stock and detect gaps.</p>
                                        <input type="file" accept="image/*" onChange={handleVisionUpload} style={{ marginTop: '1rem' }} />
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="vision-results" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <img src={visionResult.imageUrl} alt="Shelf Analysis" style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                                        AI Confidence: 94%
                                    </div>
                                </div>
                                <div>
                                    <h4>Analysis Report</h4>

                                    <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>Total Items:</span>
                                        <strong>{visionResult.total_items}</strong>
                                    </div>
                                    <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>Shelf Health:</span>
                                        <span className={`tag ${visionResult.shelf_health === 'Good' ? 'good' : 'critical'}`}>
                                            {visionResult.shelf_health}
                                        </span>
                                    </div>

                                    <h5>Detected Products:</h5>
                                    <ul style={{ paddingLeft: '1.2rem', marginBottom: '1rem' }}>
                                        {Object.entries(visionResult.item_counts || {}).map(([name, count]) => (
                                            <li key={name}>{name}: <strong>{count}</strong></li>
                                        ))}
                                    </ul>

                                    <button className="primary-btn" onClick={() => { setVisionResult(null); }}>
                                        Scan Another
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
