const express = require('express');
const router = express.router && express.Router ? express.Router() : express();
const db = require('../utils/db');

// Get all products (User specific)
router.get('/:userId', (req, res) => {
    const { userId } = req.params;
    // Strictly filter by userId. Do NOT show system products to keep it personalized.
    const products = db.filter('products', p => p.userId === userId);
    res.json(products);
});

// Restock
router.post('/restock', (req, res) => {
    const { productId, quantity } = req.body;

    const products = db.get('products');
    const productIndex = products.findIndex(p => p._id === productId);

    if (productIndex === -1) {
        return res.status(404).json({ msg: 'Product not found' });
    }

    // Update stock
    products[productIndex].stock += parseInt(quantity);

    // Save DB
    db.save();

    res.json({ msg: 'Stock updated', product: products[productIndex] });
});

// Add New Product
router.post('/add', (req, res) => {
    const { name, stock, reorderLevel, price, userId } = req.body;

    // Auto-generate ID in db.add
    const newProduct = {
        userId: userId || 'SYSTEM', // Assign to user if real, else system
        name,
        stock: parseInt(stock),
        reorderLevel: parseInt(reorderLevel),
        price: parseFloat(price),
        status: parseInt(stock) <= parseInt(reorderLevel) ? 'Low' : 'Good'
    };

    const saved = db.add('products', newProduct);
    res.json({ msg: 'Product added', product: saved });
});

// Get High Demand / Trending Products (Market Alerts)
router.get('/market/alerts', (req, res) => {
    // In a real app, this would aggregate sales data.
    // Here we simulate "High Demand" as products with Low Stock from ANY user.
    const allProducts = db.get('products') || [];

    // Find products with low stock from other sellers (anonymized or specific)
    const highDemand = allProducts.filter(p => p.status === 'Low').map(p => ({
        productName: p.name,
        price: p.price,
        status: 'High Demand (Low Stock)',
        sellerId: p.userId // In real app, maybe hide this or show store name
    }));

    res.json(highDemand);
});

// Get Suppliers based on Business Type
router.get('/suppliers/list', (req, res) => {
    const { type } = req.query; // e.g., 'Distribution', 'Wholesale', 'Retail'

    // Mock Suppliers Database
    const suppliers = [
        { id: 1, name: 'Global Distributors Ltd', type: 'Distribution', rating: 4.5 },
        { id: 2, name: 'Local Farm Fresh', type: 'Wholesale', rating: 4.8 },
        { id: 3, name: 'City Retail Supplies', type: 'Retail', rating: 4.2 },
        { id: 4, name: 'Tech Components Inc', type: 'Distribution', rating: 4.7 }
    ];

    if (type) {
        return res.json(suppliers.filter(s => s.type.toLowerCase() === type.toLowerCase()));
    }

    res.json(suppliers);
});

module.exports = router;
