// frontend/src/pages/CompleteSignupPage.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { useAuth } from '../contexts/AuthContext';
import './CompleteSignupPage.css';

const CompleteSignupPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { initializeAuth } = useAuth();

    const { socialAccount } = location.state || {};
    const suggestedUsername = socialAccount?.extra_data?.given_name || socialAccount?.extra_data?.name || '';
    
    const [username, setUsername] = useState(suggestedUsername.toLowerCase().replace(/[^a-z0-9_]+/g, '').slice(0, 20));
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await apiClient.client.patch('/auth/user/', { username });
            await initializeAuth();
            navigate('/dashboard');
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData && errorData.username) {
                setError(errorData.username[0]);
            } else {
                setError('An error occurred. Please try a different username.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUseSuggestion = () => {
        setUsername(suggestedUsername.toLowerCase().replace(/[^a-z0-9_]+/g, '').slice(0, 20));
    };

    return (
        <div className="signup-page-container">
            <div className="signup-card card">
                <div className="venti-logo">
                    <span className="ven-solid">VEN</span><span className="ti-stroke">TI</span>
                </div>
                <h2>Complete Your Profile</h2>
                <p className="subtitle">We pulled some details from your social account.</p>

                {socialAccount && (
                    <div className="profile-preview">
                        <div className="avatar">
                            <img src={socialAccount.extra_data.picture} alt="Avatar" />
                        </div>
                        <div className="profile-text">
                            <div className="name-line">{socialAccount.extra_data.name}</div>
                            <div className="email-line">{socialAccount.extra_data.email}</div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <button type="button" className="btn-ghost" onClick={handleUseSuggestion}>
                            Use Google suggestion
                        </button>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Complete Signup'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteSignupPage;