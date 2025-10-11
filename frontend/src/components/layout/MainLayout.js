// frontend/src/components/layout/MainLayout.js
import React from "react";
import Sidebar from "./Sidebar";
import VantaBackground from "./VantaBackground"; // Import the new component

const MainLayout = ({ children }) => {
  return (
    <VantaBackground>
      <div className="page-layout">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </VantaBackground>
  );
};

export default MainLayout;
