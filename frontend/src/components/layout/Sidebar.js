// frontend/src/components/layout/Sidebar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="venti-logo">
                    <span className="ven-solid">VEN</span>
                    <span className="ti-stroke">TI</span>
                </div>
            </div>

            <div className="profile-section">
                <div className="profile-avatar">
                    {user?.username.charAt(0).toUpperCase()}
                </div>
                <h3>@{user?.username}</h3>
                <p>{user?.xp_points} XP</p>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className="nav-item">
                    <span className="material-icons">home</span>
                    <span className="nav-text">Dashboard</span>
                </NavLink>
                <NavLink to="/clubs" className="nav-item">
                    <span className="material-icons">group</span>
                    <span className="nav-text">Clubs</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="btn btn-logout">
                    <span className="material-icons">logout</span>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;