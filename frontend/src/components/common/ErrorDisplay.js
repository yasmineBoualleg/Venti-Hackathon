// frontend/src/components/common/ErrorDisplay.js
import React from 'react';

const ErrorDisplay = ({ message }) => {
    return (
        <div className="error-display">
            <p>{message || "An error occurred."}</p>
        </div>
    );
};

export default ErrorDisplay;