const db = require('./db');

const seedUser = () => {
    const email = 'spa@hmail.com';
    const existing = db.find('users', u => u.email === email);

    let userId;

    if (existing) {
        console.log('User already exists:', existing.name);
        userId = existing._id;
    } else {
        const newUser = {
            name: 'Pooja',
            email: email,
            password: 'password', // As requested
            businessName: 'Pooja Groceries',
            type: 'Groceries',
            sector: 'Retail',
            location: 'Bangalore',
            size: 'Micro' // Initial default
        };
        const saved = db.add('users', newUser);
        userId = saved._id;
        console.log('Created User:', saved.name);
    }

    // Generate 3 Months of Data
    const transactions = [];
    const now = new Date();

    // Clear existing transactions for this user to avoid duplicates if re-run
    db.data.transactions = db.data.transactions.filter(t => t.userId !== userId);

    for (let i = 0; i < 90; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Random Income (Daily Sales)
        // Fluctuate between 2000 and 10000
        const income = Math.floor(Math.random() * (10000 - 2000 + 1)) + 2000;

        transactions.push({
            userId,
            date: dateStr,
            desc: `Daily Sales - ${dateStr}`,
            type: 'Income',
            amount: income
        });

        // Random Expenses (Every few days)
        if (i % 3 === 0) {
            const expense = Math.floor(Math.random() * (3000 - 500 + 1)) + 500;
            transactions.push({
                userId,
                date: dateStr,
                desc: `Stock Refill / Utilities - ${dateStr}`,
                type: 'Expense',
                amount: expense
            });
        }
    }

    // Add to DB
    transactions.forEach(t => db.add('transactions', t));
    console.log(`Seeded ${transactions.length} transactions for ${email}`);
};

seedUser();
