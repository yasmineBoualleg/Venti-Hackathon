// frontend/src/components/layout/Background.js
import React from "react";

const Background = () => {
  return (
    <div className="background-container">
      <div className="earth-image"></div>
      <div className="orbit orbit-1"></div>
      <div className="orbit orbit-2"></div>
      <div className="orbit orbit-3"></div>
    </div>
  );
};

export default React.memo(Background);
