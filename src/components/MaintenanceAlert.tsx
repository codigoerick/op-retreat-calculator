"use client";

import { useState, useEffect } from 'react';

const MaintenanceAlert = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenAlert = localStorage.getItem('maintenance_alert_seen');
    if (!hasSeenAlert) {
      setIsVisible(true);
    }
  }, []);

  const closeAlert = () => {
    localStorage.setItem('maintenance_alert_seen', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="maintenance-overlay">
      <div className="maintenance-card">
        <div className="maintenance-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div className="maintenance-content">
          <h3>Aviso de Mantenimiento</h3>
          <p>
            Estamos optimizando la calculadora para ofrecerte cálculos más precisos. 
            Es posible que experimentes algunos errores temporales mientras trabajamos en la nueva versión.
          </p>
          <button onClick={closeAlert} className="maintenance-button">
            Entendido
          </button>
        </div>
      </div>

      <style jsx>{`
        .maintenance-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.4s ease-out;
        }

        .maintenance-card {
          background: linear-gradient(145deg, #1a1a1a, #0d0d0d);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
          width: 90%;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          transform: translateY(0);
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .maintenance-icon {
          color: #facc15;
          margin-bottom: 20px;
          display: inline-flex;
          padding: 15px;
          background: rgba(250, 204, 21, 0.1);
          border-radius: 50%;
        }

        .maintenance-content h3 {
          color: #fff;
          font-size: 1.5rem;
          margin-bottom: 12px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .maintenance-content p {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .maintenance-button {
          background: #facc15;
          color: #000;
          border: none;
          padding: 12px 32px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .maintenance-button:hover {
          background: #eab308;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px rgba(234, 179, 8, 0.5);
        }

        .maintenance-button:active {
          transform: translateY(0);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MaintenanceAlert;
