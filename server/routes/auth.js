const express = require('express');
const router = express.router && express.Router ? express.Router() : express();
const db = require('../utils/db');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, businessName, type, sector, location, size } = req.body;

        // Check if user exists
        const existing = db.find('users', u => u.email === email);
        if (existing) {
            return res.status(400).json({ msg: 'User already exists with this email' });
        }

        // Create User
        const newUser = {
            name, email, password, type,
            sector: sector || 'General',
            location: location || 'India',
            size: size || 'Micro'
        };
        const savedUser = db.add('users', newUser);

        // SEED INITIAL INVENTORY BASED ON BUSINESS TYPE
        let starterProducts = [];

        switch (type) {
            case 'Fruits & Vegetables':
                starterProducts = [
                    { name: 'Onions (kg)', stock: 50, price: 40, reorderLevel: 10, status: 'Good' },
                    { name: 'Potatoes (kg)', stock: 60, price: 30, reorderLevel: 15, status: 'Good' },
                    { name: 'Tomatoes (kg)', stock: 20, price: 25, reorderLevel: 10, status: 'Good' },
                    { name: 'Apples (kg)', stock: 15, price: 120, reorderLevel: 5, status: 'Good' },
                    { name: 'Bananas (Dozen)', stock: 25, price: 60, reorderLevel: 8, status: 'Good' }
                ];
                break;
            case 'Grocery / Kirana':
                starterProducts = [
                    { name: 'Rice (25kg Bag)', stock: 10, price: 1250, reorderLevel: 3, status: 'Good' },
                    { name: 'Sunflower Oil (1L)', stock: 30, price: 140, reorderLevel: 10, status: 'Good' },
                    { name: 'Sugar (kg)', stock: 40, price: 45, reorderLevel: 10, status: 'Good' },
                    { name: 'Toor Dal (kg)', stock: 25, price: 110, reorderLevel: 5, status: 'Good' },
                    { name: 'Tea Powder (250g)', stock: 50, price: 90, reorderLevel: 12, status: 'Good' }
                ];
                break;
            case 'Super Mart':
                starterProducts = [
                    { name: 'Biscuits (Pack)', stock: 100, price: 20, reorderLevel: 25, status: 'Good' },
                    { name: 'Soft Drinks (2L)', stock: 40, price: 90, reorderLevel: 10, status: 'Good' },
                    { name: 'Chips (L)', stock: 60, price: 30, reorderLevel: 15, status: 'Good' },
                    { name: 'Shampoo (200ml)', stock: 20, price: 180, reorderLevel: 5, status: 'Good' },
                    { name: 'Detergent (1kg)', stock: 25, price: 210, reorderLevel: 8, status: 'Good' }
                ];
                break;
            case 'Pharmacy':
                starterProducts = [
                    { name: 'Paracetamol 650', stock: 200, price: 15, reorderLevel: 50, status: 'Good' },
                    { name: 'Cough Syrup', stock: 30, price: 120, reorderLevel: 5, status: 'Good' },
                    { name: 'Vitamin C', stock: 100, price: 40, reorderLevel: 20, status: 'Good' },
                    { name: 'N95 Masks', stock: 50, price: 90, reorderLevel: 10, status: 'Good' }
                ];
                break;
            case 'Electronics':
                starterProducts = [
                    { name: 'USB-C Cable', stock: 20, price: 350, reorderLevel: 5, status: 'Good' },
                    { name: 'Screen Guard', stock: 30, price: 150, reorderLevel: 8, status: 'Good' },
                    { name: 'Power Bank', stock: 10, price: 1200, reorderLevel: 2, status: 'Good' },
                    { name: 'Earphones', stock: 15, price: 500, reorderLevel: 4, status: 'Good' }
                ];
                break;
            case 'Textiles':
                starterProducts = [
                    { name: 'Cotton Shirt', stock: 40, price: 650, reorderLevel: 10, status: 'Good' },
                    { name: 'Denim Jeans', stock: 30, price: 1200, reorderLevel: 8, status: 'Good' },
                    { name: 'Silk Saree', stock: 15, price: 2500, reorderLevel: 4, status: 'Good' }
                ];
                break;
            default:
                starterProducts = [
                    { name: 'General Item 1', stock: 10, price: 100, reorderLevel: 2, status: 'Good' }
                ];
        }

        // Add seed products to DB linked to this userId
        starterProducts.forEach(p => {
            db.add('products', { ...p, userId: savedUser._id });
        });

        res.json({ msg: 'Registration Successful', user: savedUser });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = db.find('users', u => u.email === email);
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        // Validate password
        if (user.password !== password) return res.status(400).json({ msg: 'Invalid Credentials' });

        // DYNAMIC CATEGORIZATION LOGIC
        // Calculate turnover for last 3 months
        const userTransactions = db.filter('transactions', t => t.userId === user._id && t.type === 'Income');
        const totalTurnover = userTransactions.reduce((acc, curr) => acc + curr.amount, 0);

        // Classification Criteria (Simplified for Demo)
        // Micro: < 50 Lakhs (Using smaller scale for demo: < 5 Lakhs)
        // Small: 5L - 5 Cr
        // Medium: > 5 Cr
        let newSize = 'Micro';
        if (totalTurnover > 500000 && totalTurnover <= 5000000) newSize = 'Small';
        else if (totalTurnover > 5000000) newSize = 'Medium';

        // Update User if changed
        if (user.size !== newSize) {
            user.size = newSize;
            db.save(); // Persist change
        }

        // Return user info
        res.json({
            msg: 'Login successful',
            userId: user._id,
            name: user.name,
            businessName: user.businessName,
            email: user.email,
            type: user.type,
            location: user.location,
            category: newSize
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
