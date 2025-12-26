import React, { useEffect, useState } from 'react';
import { User, Briefcase, Mail, MapPin, Award } from 'lucide-react';

const ProfileView = () => {
    const [user, setUser] = useState(null);
    const userId = localStorage.getItem('userId');
    const name = localStorage.getItem('userName');
    const businessName = localStorage.getItem('businessName');
    const email = localStorage.getItem('userEmail') || 'Not Provided';
    const businessType = localStorage.getItem('businessType') || 'Not Specified';
    const location = localStorage.getItem('userLocation') || 'Bangalore, India';
    // We might need to fetch fresh user data to get the category if it updated

    // In a real app we'd trigger a fetch to /api/auth/profile or similar. 
    // Since we don't have a dedicated profile endpoint, we'll assume the login response
    // updated localStorage or we can fetch a user-specific endpoint if we made one.
    // For now, let's assume we rely on what was stored during login, or update it here.

    // Actually, to ensure we show the dynamic category, we should probably add a 
    // simple "get user info" route or rely on the category stored in localStorage 
    // (requires login to update). 
    // Let's rely on localStorage 'userCategory' which we should ensure is saved on login.
    const userCategory = localStorage.getItem('userCategory') || 'Micro';

    return (
        <div className="view-container">
            <h2>Your Profile</h2>

            <div className="profile-card">
                <div className="profile-header">
                    <div className="avatar">
                        <User size={48} color="#fff" />
                    </div>
                    <div className="header-info">
                        <h3>{name}</h3>
                        <p>{businessName}</p>
                    </div>
                </div>

                <div className="profile-details">
                    <div className="detail-item">
                        <Mail className="icon" size={20} />
                        <div>
                            <label>Email</label>
                            <label>Email</label>
                            <p>{email}</p>
                        </div>
                    </div>

                    <div className="detail-item">
                        <Briefcase className="icon" size={20} />
                        <div>
                            <label>Business Type</label>
                            <p>{businessType}</p>
                        </div>
                    </div>

                    <div className="detail-item">
                        <Award className="icon" size={20} />
                        <div>
                            <label>Business Category (MSME)</label>
                            <p className="highlight-badge">{userCategory}</p>
                            <small>Based on your last 3 months turnover</small>
                        </div>
                    </div>

                    <div className="detail-item">
                        <MapPin className="icon" size={20} />
                        <div>
                            <label>Location</label>
                            <p>{location}</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .profile-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    max-width: 600px;
                    margin: 2rem auto;
                    overflow: hidden;
                }
                .profile-header {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    padding: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    color: white;
                }
                .avatar {
                    width: 80px;
                    height: 80px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .header-info h3 {
                    margin: 0;
                    font-size: 1.5rem;
                }
                .header-info p {
                    opacity: 0.9;
                    margin: 0;
                }
                .profile-details {
                    padding: 2rem;
                    display: grid;
                    gap: 1.5rem;
                }
                .detail-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .detail-item:last-child {
                    border-bottom: none;
                }
                .detail-item .icon {
                    color: #6366f1;
                    margin-top: 2px;
                }
                .detail-item label {
                    display: block;
                    font-size: 0.85rem;
                    color: #64748b;
                    margin-bottom: 0.25rem;
                }
                .detail-item p {
                    margin: 0;
                    font-weight: 500;
                    color: #1e293b;
                }
                .highlight-badge {
                    background: #e0e7ff;
                    color: #4338ca;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.9rem !important;
                    display: inline-block;
                }
            `}</style>
        </div>
    );
};

export default ProfileView;
