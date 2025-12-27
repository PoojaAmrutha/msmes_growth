require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cors());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Mock DB Message
console.log('Running in MOCK API mode (No MongoDB connection required)');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/schemes', require('./routes/schemes'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/marketing', require('./routes/marketing'));
app.use('/api/ai', require('./routes/ai'));

app.get('/', (req, res) => {
    res.send('MSME Business Intelligence Dashboard API is running (Mock Mode)');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
