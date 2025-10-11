// frontend/src/components/dashboard/StatCard.js
import React from 'react';
import './StatCard.css';

const StatCard = ({ label, value, icon }) => {
    return (
        <div className="stat-card card">
            <div className="stat-icon"><span className="material-icons">{icon}</span></div>
            <div className="stat-info">
                <span className="stat-value">{value}</span>
                <span className="stat-label">{label}</span>
            </div>
        </div>
    );
};
export default StatCard;