import React, { useState, useEffect } from 'react';

/**
 * 3D Exploded UI/UX — Shahrokh
 * Skill: Layer Separation (Z:0/50/100), Isometric 30°, Shadows, 0.6s ease-out
 */

interface ExplodedUIProps {
  children: React.ReactNode;
}

const ExplodedUI: React.FC<ExplodedUIProps> = ({ children }) => {
  const [exploded, setExploded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="relative">
      {/* Toggle */}
      <button
        onClick={() => setExploded(!exploded)}
        className="fixed bottom-20 right-6 z-[110] bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl hover:scale-105 transition"
        title="3D Exploded View — 0.6s ease-out"
      >
        {exploded ? '✓ Exploded' : '💥 Explode 3D'}
      </button>

      {/* Exploded Container — Isometric 30° */}
      <div
        className={`transition-all duration-700 ${exploded ? 'ease-out' : 'ease-in'}`}
        style={
          exploded
            ? {
                transform: 'perspective(1200px) rotateX(12deg) rotateY(-12deg) rotateZ(2deg) scale(0.92)',
                transformOrigin: 'center top',
                transition: 'transform 0.6s ease-out',
              }
            : {
                transform: 'perspective(1200px) rotateX(0) rotateY(0) scale(1)',
                transition: 'transform 0.6s ease-out',
              }
        }
      >
        {/* LAYERS */}
        {/* Z:0 Background — already in Hero3D, but we add exploded offset */}
        <div
          className="relative"
          style={{
            transform: exploded ? 'translateZ(0px)' : 'translateZ(0)',
            filter: exploded ? 'blur(0px)' : 'none',
            transition: 'all 0.6s ease-out',
          }}
        >
          {/* Z:50 Main Content — cards */}
          <div
            className="relative"
            style={{
              transform: exploded ? 'translateZ(50px)' : 'translateZ(0)',
              transition: 'all 0.6s ease-out 0.1s',
            }}
          >
            {/* Z:100 Modals/Buttons — will be handled by their own z-[100] */}
            <div
              style={{
                transform: exploded ? 'translateZ(100px)' : 'translateZ(0)',
                transition: 'all 0.6s ease-out 0.2s',
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Design Tokens Panel — shown when exploded */}
      {exploded && mounted && (
        <div className="fixed top-20 left-4 z-[110] bg-gray-900/90 backdrop-blur border border-white/10 rounded-2xl p-4 text-xs max-w-xs">
          <h4 className="font-bold text-cyan-300 mb-2">Layer Breakdown (Z)</h4>
          <div className="space-y-1 font-mono">
            <div className="flex justify-between"><span>Background</span><span className="text-cyan-400">Z: 0</span></div>
            <div className="flex justify-between"><span>Main Cards</span><span className="text-violet-400">Z: 50</span></div>
            <div className="flex justify-between"><span>Modals/Popups</span><span className="text-amber-400">Z: 100</span></div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="font-bold text-white">Shadows</p>
            <code className="text-gray-400 text-[10px]">box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.08)</code>
          </div>
          <div className="mt-2">
            <p className="font-bold text-white">Isometric</p>
            <code className="text-gray-400 text-[10px]">perspective(1200px) rotateX(12°) rotateY(-12°)</code>
          </div>
          <div className="mt-2">
            <p className="font-bold text-white">Timing</p>
            <code className="text-gray-400 text-[10px]">0.6s ease-out (exploded)</code>
          </div>
        </div>
      )}

      {/* Global Styles for Exploded Shadows */}
      <style>{`
        ${exploded ? `
        [data-tilt] {
          box-shadow: 0 20px 40px rgba(0,0,0,0.15), 0 12px 24px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.08) !important;
          transition: box-shadow 0.6s ease-out, transform 0.6s ease-out !important;
        }
        ` : ''}
      `}</style>
    </div>
  );
};

export default ExplodedUI;
