const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['sale', 'expense'], required: true },
    amount: { type: Number, required: true },
    category: { type: String }, // e.g., 'Raw Material' for expense, or Product Name for sale
    description: { type: String },
    date: { type: Date, default: Date.now },
    paymentMethod: { type: String, enum: ['cash', 'online', 'credit'], default: 'cash' },
    status: { type: String, enum: ['completed', 'pending'], default: 'completed' }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
