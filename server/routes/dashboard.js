const express = require('express');
const router = express.router && express.Router ? express.Router() : express();
const db = require('../utils/db');

// Helper to format dates
const formatDate = (date) => date.toISOString().split('T')[0];

// Get Dashboard Summary
router.get('/summary/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get Data
        const transactions = db.filter('transactions', t => t.userId === userId);

        // Calculate Sales
        // Calculate Sales (Income) & Expenses
        const sales = transactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + (t.amount || 0), 0);
        const expenses = transactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + (t.amount || 0), 0);

        // Inventory
        const userProducts = db.filter('products', p => p.userId === userId || p.userId === 'SYSTEM');
        const lowStockCount = userProducts.filter(p => p.stock <= (p.reorderLevel || 10)).length;

        // IF no data, return 0 instead of fake 25000
        const finalSales = sales || 0;
        const finalExpenses = expenses || 0;

        // Advanced Metrics
        const avgDailySales = Math.round(finalSales / 30); // Simple avg
        const moneyFlow = finalSales - finalExpenses;

        res.json({
            todaySales: finalSales * 0.05, // Mock daily approx
            monthlySales: finalSales,
            totalExpenses: finalExpenses,
            lowStockCount: lowStockCount,
            profit: moneyFlow,
            avgDailySales: avgDailySales,
            moneyFlow: moneyFlow
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get Sales Data for Chart with Timeframe
router.get('/sales-chart/:userId', async (req, res) => {
    const { userId } = req.params;
    const { timeframe } = req.query; // daily, weekly, monthly

    const transactions = db.filter('transactions', t => t.userId === userId && t.type === 'Income');

    let labels = [];
    let data = [];
    const now = new Date();

    if (timeframe === 'weekly') {
        // Last 4 Weeks
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - (i * 7));
            const weekLabel = `Week ${4 - i}`;
            labels.push(weekLabel);

            // Simple logic: filter transactions in this 7-day window
            const weekSum = transactions.filter(t => {
                const tDate = new Date(t.date);
                const diffTime = Math.abs(now - tDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays > (i * 7) && diffDays <= ((i + 1) * 7);
            }).reduce((sum, t) => sum + t.amount, 0);

            data.push(weekSum);
        }

    } else if (timeframe === 'daily') {
        // Last 7 Days
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const dateStr = formatDate(d);
            labels.push(dateStr); // e.g., 2025-12-25

            const daySum = transactions
                .filter(t => t.date === dateStr)
                .reduce((sum, t) => sum + t.amount, 0);
            data.push(daySum);
        }

    } else {
        // Monthly (Last 6 Months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now);
            d.setMonth(now.getMonth() - i);
            const monthName = months[d.getMonth()];
            labels.push(monthName);

            const monthSum = transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
            }).reduce((sum, t) => sum + t.amount, 0);

            data.push(monthSum);
        }
    }

    res.json({ labels, data });
});

module.exports = router;
