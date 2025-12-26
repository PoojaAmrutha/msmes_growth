const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'db.json');

// Initialize DB with default data if not exists
const defaults = {
    users: [],
    transactions: [],
    products: [
        { _id: 'prod1', userId: 'SYSTEM', name: 'Cotton Yarn', stock: 120, reorderLevel: 50, price: 500 },
        { _id: 'prod2', userId: 'SYSTEM', name: 'Polyester Thread', stock: 20, reorderLevel: 30, price: 200 },
        { _id: 'prod3', userId: 'SYSTEM', name: 'Silk Fabric', stock: 5, reorderLevel: 10, price: 1500 }
    ]
};

class JSONDB {
    constructor() {
        this.data = { ...defaults };
        this.load();
    }

    load() {
        try {
            if (fs.existsSync(DB_FILE)) {
                const raw = fs.readFileSync(DB_FILE, 'utf-8');
                this.data = JSON.parse(raw);
            } else {
                this.save();
            }
        } catch (err) {
            console.error('Error loading DB:', err);
            // If error, keep defaults
        }
    }

    save() {
        try {
            fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2));
        } catch (err) {
            console.error('Error saving DB:', err);
        }
    }

    // Generic Helpers
    get(collection) {
        return this.data[collection] || [];
    }

    add(collection, item) {
        if (!this.data[collection]) this.data[collection] = [];
        // Auto ID
        if (!item._id) item._id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        this.data[collection].push(item);
        this.save();
        return item;
    }

    find(collection, predicate) {
        return this.data[collection].find(predicate);
    }

    filter(collection, predicate) {
        return this.data[collection].filter(predicate);
    }
}

const db = new JSONDB();
module.exports = db;
