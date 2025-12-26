const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    businessName: { type: String, required: true },
    businessType: { type: String, enum: ['retail', 'manufacturing', 'service'], required: true },
    sector: { type: String }, // e.g., Textile, Food
    location: { type: String },
    size: { type: String, enum: ['micro', 'small', 'medium'] },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
