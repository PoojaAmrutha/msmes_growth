import React, { useState, useEffect } from 'react';
import { Megaphone, Copy, BarChart2, Globe, Share2 } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MarketingView = () => {
    const [productName, setProductName] = useState('');
    const [discount, setDiscount] = useState('');
    const [offerBasis, setOfferBasis] = useState('General');
    const [businessType, setBusinessType] = useState('General');
    const [generatedContent, setGeneratedContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [posterTheme, setPosterTheme] = useState('default');
    const [reachData, setReachData] = useState(null);
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName'); // In real app, fetch business name

    // Community Ads
    const [communityAds, setCommunityAds] = useState([]);

    const fetchAds = () => {
        fetch('http://localhost:5000/api/marketing/community')
            .then(res => res.json())
            .then(data => setCommunityAds(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const generateContent = () => {
        setLoading(true);
        setReachData(null);

        // Simple logic to choose theme
        if (discount > 30) setPosterTheme('mega-sale');
        else if (productName.toLowerCase().includes('new')) setPosterTheme('new-arrival');
        else setPosterTheme('default');

        setTimeout(() => {
            const content = `🔥 MEGA SALE! Get flat ${discount}% OFF on our premium ${productName}. Limited stock available! Hurry up and visit us today! 🛍️ #Sale #Offer #${productName.replace(/\s/g, '')}`;
            setGeneratedContent(content);

            // Mock Reach Data
            setReachData({
                labels: ['WhatsApp', 'Instagram', 'Facebook', 'SMS'],
                datasets: [
                    {
                        label: 'Predicted Reach (Users)',
                        data: [1500, 2300, 1800, 4500],
                        backgroundColor: ['#25D366', '#E1306C', '#1877F2', '#F59E0B'],
                    }
                ]
            });

            setLoading(false);
        }, 1500);
    };

    const handlePublish = () => {
        const adData = {
            userId,
            businessName: userName || 'My Business',
            offer: `${discount}% OFF on ${productName}`,
            posterTheme,
            offerBasis,
            businessType
        };

        fetch('http://localhost:5000/api/marketing/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adData)
        })
            .then(res => res.json())
            .then(data => {
                alert('Ad Published to Community Network! 🌍');
                fetchAds(); // Refresh
            });
    };

    return (
        <div className="view-container">
            <h2>AI Marketing & Ad Network</h2>

            <div className="marketing-layout">
                <div className="creation-column">
                    <div className="marketing-tool">
                        <h3>Create Campaign</h3>
                        <div className="input-section">
                            <label>Product / Service Name</label>
                            <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Silk Sarees" />

                            <label>Discount / Offer (%)</label>
                            <input type="text" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="e.g. 20" />

                            <label>Offer Basis</label>
                            <select value={offerBasis} onChange={(e) => setOfferBasis(e.target.value)} className="input-select">
                                <option value="General">General</option>
                                <option value="Festive">Festive / Holiday</option>
                                <option value="Clearance">Stock Clearance</option>
                                <option value="New Arrival">New Arrival</option>
                            </select>

                            <label>Target Audience (Business Type)</label>
                            <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="input-select">
                                <option value="General">General Public</option>
                                <option value="B2B">Business to Business (Wholesale)</option>
                                <option value="Local">Local Community</option>
                            </select>

                            <button className="primary-btn" onClick={generateContent} disabled={loading || !productName}>
                                {loading ? 'Generating...' : 'Generate Assets ✨'}
                            </button>
                        </div>
                    </div>

                    {generatedContent && (
                        <div className="marketing-results">
                            <div className={`poster-preview ${posterTheme}`}>
                                <div className="poster-content">
                                    <h4>{posterTheme === 'mega-sale' ? '🔥 SUPER SALE 🔥' : '✨ SPECIAL OFFER ✨'}</h4>
                                    <h1>{discount}% OFF</h1>
                                    <p>On Premium {productName}</p>
                                    <button>Shop Now</button>
                                </div>
                            </div>

                            <div className="actions-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <button className="action-btn" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 5 }} onClick={handlePublish}>
                                    <Globe size={18} /> Publish to Network
                                </button>
                                <button className="secondary-btn" style={{ flex: 1, marginTop: 0 }}>
                                    <Share2 size={18} /> Share Social
                                </button>
                            </div>

                            <div className="output-section">
                                <h3>Generated Caption:</h3>
                                <div className="message-box">
                                    <p>{generatedContent}</p>
                                    <button className="icon-btn"><Copy size={16} /> Copy</button>
                                </div>
                            </div>

                            {reachData && (
                                <div className="reach-chart">
                                    <h3>📊 Predicted Reach</h3>
                                    <Bar data={reachData} options={{ responsive: true }} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="community-column">
                    <h3>🌍 Community Ad Network (Live)</h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>See what other businesses are promoting.</p>

                    <div className="ads-feed">
                        {communityAds.length === 0 && <p>No active ads. Be the first!</p>}
                        {communityAds.map((ad, idx) => (
                            <div className={`ad-card ${ad.posterTheme}`} key={idx}>
                                <div className="ad-header">
                                    <span className="business-name">{ad.businessName}</span>
                                    <span className="time">{new Date(ad.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div className="ad-body">
                                    <h4>{ad.offer}</h4>
                                </div>
                                <button className="ad-cta">View Offer</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketingView;
