import React, { useState, useEffect } from 'react';

const SchemesView = () => {
    const [schemes, setSchemes] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const category = localStorage.getItem('userCategory') || 'Micro'; // Default to Micro if missing

        fetch(`http://localhost:5000/api/schemes?category=${category}`)
            .then(res => res.json())
            .then(data => {
                setSchemes(data.schemes);
                setNews(data.news);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="loading">Fetching latest Government Schemes...</div>;

    return (
        <div className="view-container">
            <h2>Government Schemes & News</h2>

            {news.length > 0 && (
                <div className="news-ticker">
                    <h3>📢 Latest Updates:</h3>
                    <ul>
                        {news.map((item, idx) => (
                            <li key={idx}>
                                {item.title}
                                {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer"> (Read more)</a>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="schemes-grid">
                {schemes.map(s => (
                    <div className="scheme-card" key={s.id}>
                        <div className="badge">{s.isLive ? 'Live' : 'Cached'}</div>
                        <h3>{s.name}</h3>
                        <p><strong>Benefit:</strong> {s.benefit}</p>
                        <p><strong>Eligibility:</strong> {s.eligibility}</p>
                        <a href={s.link} target="_blank" rel="noreferrer" className="secondary-btn" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>Check Eligibility</a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SchemesView;
