
import React from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css'; // Reusing login page styles

const LoginFailedPage = () => {
    return (
        <div className="login-page-container">
            <div className="login-card card">
                <div className="venti-logo">
                    <span className="ven-solid">VEN</span><span className="ti-stroke">TI</span>
                </div>
                <h2>Login Failed</h2>
                <p className="subtitle">There was an error logging you in. Please try again.</p>
                <Link to="/login" className="btn btn-primary">Back to Login</Link>
            </div>
        </div>
    );
};

export default LoginFailedPage;
