const express = require('express');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const AI_SERVICE_URL = 'http://127.0.0.1:8000';

// Middleware to check if AI service is running
const checkAIService = async (req, res, next) => {
    try {
        await axios.get(`${AI_SERVICE_URL}/`);
        next();
    } catch (error) {
        console.error('AI Service Validation Error:', error.message);
        res.status(503).json({
            error: 'AI Service Unavailable',
            details: 'The Python AI Brain is not responding. Please ensure the AI service is running.'
        });
    }
};

// Route: Get Optimized Price
router.post('/pricing/optimize', checkAIService, async (req, res) => {
    try {
        const { product_name, base_price, current_stock, days_to_expiry, competitor_price } = req.body;

        // Forward to Python Service
        const response = await axios.post(`${AI_SERVICE_URL}/pricing/optimize`, {
            product_name,
            base_price,
            current_stock,
            days_to_expiry,
            competitor_price
        });

        res.json(response.data);
    } catch (error) {
        console.error('AI Pricing Error:', error.message);
        res.status(500).json({ error: 'Failed to get pricing suggestion' });
    }
});

// Route: Analyze Shelf Image
router.post('/vision/analyze', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const formData = new FormData();
        formData.append('file', req.file.buffer, req.file.originalname);

        const response = await axios.post(`${AI_SERVICE_URL}/vision/analyze`, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('AI Vision Error:', error.message);
        res.status(500).json({ error: 'Failed to analyze shelf image' });
    }
});

module.exports = router;
