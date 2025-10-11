// frontend/src/pages/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import Background from '../components/layout/Background';
import './LandingPage.css';

const LandingPage = () => {
    const googleLoginUrl = `${process.env.REACT_APP_API_URL.replace('/api', '')}/accounts/google/login/`;

    return (
        <>
            <Background />
            <div className="landing-container">
                <div className="hero">
                    <h1>
                        <span className="ven-solid">VEN</span>
                        <span className="ti-stroke">TI</span>
                    </h1>
                    <p>Easy Access. Smooth Flow.</p>
                    <p className="subtitle">One click, and your academic and social life is set up.</p>
                    <div className="actions">
                        <a href={googleLoginUrl} className="btn btn-primary">
                            <span className="material-icons">login</span>
                            Sign in with Google
                        </a>
                        <Link to="/login" className="btn-secondary btn">
                            Sign in with Email
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LandingPage;