const express = require('express');
const router = express.router && express.Router ? express.Router() : express();
const db = require('../utils/db');

// Get All Community Ads (Simulating Network)
router.get('/community', (req, res) => {
    // Return all ads (newest first)
    const ads = db.get('ads') || [];
    res.json(ads.reverse());
});

// Publish User Ad
router.post('/publish', (req, res) => {
    const { userId, businessName, offer, posterTheme, offerBasis, businessType } = req.body;

    // Create Ad Object
    const newAd = {
        userId,
        businessName: businessName || 'Unknown Business',
        offer,
        posterTheme,
        offerBasis: offerBasis || 'General',
        businessType: businessType || 'General',
        timestamp: new Date().toISOString()
    };

    // Save to global ads collection (Create if not exists)
    if (!db.get('ads')) {
        db.data.ads = [];
    }

    const saved = db.add('ads', newAd);
    res.json({ msg: 'Ad Published to Network', ad: saved });
});

module.exports = router;
