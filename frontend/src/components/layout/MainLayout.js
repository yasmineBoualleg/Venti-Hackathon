// frontend/src/components/layout/MainLayout.js
import React from 'react';
import Sidebar from './Sidebar';
import Background from './Background';

const MainLayout = ({ children }) => {
    return (
        <>
            <Background />
            <div className="page-layout">
                <Sidebar />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </>
    );
};

export default MainLayout;