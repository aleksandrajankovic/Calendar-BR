// src/components/SnowOverlay.jsx
"use client";

import { useMemo } from "react";

const FLAKE_COUNT = 45; 

export default function SnowOverlay() {
  const flakes = useMemo(
    () =>
      Array.from({ length: FLAKE_COUNT }, (_, i) => {
        // nasumični parametri za svaku pahulju
        const size = 6 + Math.random() * 18; 
        return {
          id: i,
          left: Math.random() * 100, 
          delay: Math.random() * 10,
          duration: 12 + Math.random() * 12,
          size,
          opacity: 0.35 + Math.random() * 0.5, 
          drift: -20 + Math.random() * 40, 
        };
      }),
    []
  );

  return (
    <div
      className="
        pointer-events-none
        fixed inset-0
        z-20            
        overflow-hidden
      "
    >
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
            // prosleđujemo horizontalni pomeraj kao CSS varijablu
            "--drift": `${flake.drift}px`,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
}
