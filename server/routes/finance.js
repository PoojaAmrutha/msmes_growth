const express = require('express');
const router = express.router && express.Router ? express.Router() : express();
const db = require('../utils/db');

// Get all transactions for a user
router.get('/:userId', (req, res) => {
    const { userId } = req.params;
    // Sort by date desc (simple reverse for now as new are added to end)
    const transactions = db.filter('transactions', t => t.userId === userId).reverse();
    res.json(transactions);
});

// Add new transaction
router.post('/add', (req, res) => {
    const { userId, date, desc, type, amount } = req.body;

    const newTransaction = {
        userId,
        date: date || new Date().toISOString().split('T')[0],
        desc,
        type, // 'Income' or 'Expense'
        amount: parseFloat(amount)
    };

    const saved = db.add('transactions', newTransaction);
    res.json({ msg: 'Transaction added', transaction: saved });
});

module.exports = router;
