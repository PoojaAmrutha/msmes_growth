import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { LayoutDashboard, TrendingUp, Package, Wallet, Megaphone, Lightbulb, LogOut, Calendar, User } from 'lucide-react';
import InventoryView from '../components/InventoryView';
import FinanceView from '../components/FinanceView';
import MarketingView from '../components/MarketingView';
import SchemesView from '../components/SchemesView';
import ProfileView from '../components/ProfileView';
import '../features.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [salesData, setSalesData] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [timeframe, setTimeframe] = useState('monthly'); // daily, weekly, monthly
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            navigate('/');
            return;
        }

        // Fetch Summary
        fetch(`http://localhost:5000/api/dashboard/summary/${userId}`)
            .then(res => res.json())
            .then(data => setSummary(data))
            .catch(err => console.error(err));
    }, [userId, navigate]);

    useEffect(() => {
        if (!userId) return;
        // Fetch Chart Data specific to timeframe
        fetch(`http://localhost:5000/api/dashboard/sales-chart/${userId}?timeframe=${timeframe}`)
            .then(res => res.json())
            .then(data => {
                setSalesData({
                    labels: data.labels,
                    datasets: [
                        {
                            label: `Sales (${timeframe})`,
                            data: data.data,
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        }
                    ]
                });
            })
            .catch(err => console.error(err));
    }, [userId, timeframe]);

    if (!summary) return <div className="loading">Loading Dashboard...</div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'inventory': return <InventoryView />;
            case 'finance': return <FinanceView />;
            case 'marketing': return <MarketingView />;
            case 'schemes': return <SchemesView />;
            case 'profile': return <ProfileView />;
            case 'dashboard':
            default:
                return (
                    <>
                        <header>
                            <h1>Welcome back, {userName}</h1>
                            <p>Here is your business health snapshot.</p>
                        </header>

                        <section className="summary-cards">
                            <div className="card">
                                <h3>Today's Sales</h3>
                                <p className="value">₹{Math.round(summary.todaySales)}</p>
                            </div>
                            <div className="card">
                                <h3>Total Sales</h3>
                                <p className="value">₹{summary.monthlySales}</p>
                            </div>
                            <div className="card">
                                <h3>Avg Daily</h3>
                                <p className="value" style={{ color: '#6366f1' }}>₹{summary.avgDailySales}</p>
                            </div>
                            <div className="card">
                                <h3>Net Money Flow</h3>
                                <p className={`value ${summary.moneyFlow >= 0 ? 'success' : 'error'}`}>₹{summary.moneyFlow}</p>
                            </div>
                            <div className="card alert">
                                <h3>Low Stock</h3>
                                <p className="value warning">{summary.lowStockCount}</p>
                            </div>
                        </section>

                        <div className="analytics-grid">
                            <div className="chart-container">
                                <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3>Sales Trend</h3>
                                    <div className="time-toggles">
                                        <button className={timeframe === 'daily' ? 'active' : ''} onClick={() => setTimeframe('daily')}>Day</button>
                                        <button className={timeframe === 'weekly' ? 'active' : ''} onClick={() => setTimeframe('weekly')}>Week</button>
                                        <button className={timeframe === 'monthly' ? 'active' : ''} onClick={() => setTimeframe('monthly')}>Month</button>
                                    </div>
                                </div>
                                {salesData && <Bar data={salesData} />}
                                <div className="chart-legend" style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem' }}>
                                    <p style={{ margin: 0, color: '#64748b' }}>
                                        <strong>📊 Chart Details:</strong> This graph displays your total revenue from sales over the selected period.
                                        <br />
                                        • <strong>Daily:</strong> Sales for the last 7 days.
                                        <br />
                                        • <strong>Weekly:</strong> Aggregated sales for the last 4 weeks.
                                        <br />
                                        • <strong>Monthly:</strong> Sales trends over the last 6 months.
                                        <br />
                                        Use this to track your business growth and identify peak selling periods.
                                    </p>
                                </div>
                            </div>
                            <div className="recommendations-box">
                                <h3>AI Recommendations</h3>
                                <ul>
                                    <li>🚀 <strong>Promote Stock:</strong> You have high stock of "Cotton Yarn", run a discount sale.</li>
                                    <li>💰 <strong>Cashflow:</strong> Upcoming payment of ₹50,000 due next week.</li>
                                    <li>🏛️ <strong>Scheme:</strong> Eligible for "PM Mudra Shishu Loan".</li>
                                </ul>
                                <button className="secondary-btn" onClick={() => setActiveTab('schemes')}>View All Schemes</button>
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="brand">
                    <h2>MSME Growth</h2>
                </div>
                <nav>
                    <a onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>
                        <LayoutDashboard size={20} /> Dashboard
                    </a>
                    <a onClick={() => setActiveTab('inventory')} className={activeTab === 'inventory' ? 'active' : ''}>
                        <Package size={20} /> Inventory
                    </a>
                    <a onClick={() => setActiveTab('finance')} className={activeTab === 'finance' ? 'active' : ''}>
                        <Wallet size={20} /> Finance
                    </a>
                    <a onClick={() => setActiveTab('marketing')} className={activeTab === 'marketing' ? 'active' : ''}>
                        <Megaphone size={20} /> AI Marketing
                    </a>
                    <a onClick={() => setActiveTab('schemes')} className={activeTab === 'schemes' ? 'active' : ''}>
                        <Lightbulb size={20} /> Schemes
                    </a>
                    <a onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>
                        <User size={20} /> Profile
                    </a>
                </nav>
                <div className="logout" onClick={() => navigate('/')}>
                    <LogOut size={20} /> Logout
                </div>
            </aside>

            <main className="main-content">
                {renderContent()}
            </main>
        </div>
    );
};

export default Dashboard;
