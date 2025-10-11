// frontend/src/components/layout/VantaBackground.js
import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";

const VantaBackground = ({ children, isStatic = false }) => {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    let effect = null;
    if (!isStatic) {
      effect = NET({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x00d4aa, // --color-primary
        backgroundColor: 0x0a0f1e, // --color-background
        points: 12.0,
        maxDistance: 20.0,
        spacing: 18.0,
      });
      setVantaEffect(effect);
    }

    return () => {
      if (effect) effect.destroy();
    };
  }, [isStatic]);

  return (
    <div
      ref={vantaRef}
      style={{
        width: "100%",
        minHeight: "100vh",
        position: "fixed", // Make it a true background
        top: 0,
        left: 0,
        zIndex: -1, // Behind all content
        background: "var(--color-background)", // Fallback color
      }}
    >
      {/* The children will be rendered by the router, not inside this div */}
    </div>
  );
};

export default VantaBackground;
