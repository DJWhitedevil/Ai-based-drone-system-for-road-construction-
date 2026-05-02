import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import LiveFeed from './pages/LiveFeed';
import MapView from './pages/MapView';
import Reports from './pages/Reports';
import DroneControl from './pages/DroneControl';
import SessionDetail from './pages/SessionDetail';
import UploadDetect from './pages/UploadDetect';
import PrivacyPolicy from './pages/PrivacyPolicy';
import EULA from './pages/EULA';
import SecurityAudit from './pages/SecurityAudit';
import LandingPage from './pages/LandingPage';
import socketService from './services/socket';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const cursorRef = useRef(null);

  useEffect(() => {
    // Custom Cursor Logic
    const moveCursor = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    const handleHover = (e) => {
      const target = e.target;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
        cursorRef.current?.classList.add('cursor-hover');
      } else {
        cursorRef.current?.classList.remove('cursor-hover');
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleHover);

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      socketService.connect();
    }
    
    setLoading(false);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleHover);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    socketService.disconnect();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#020617]">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div id="custom-cursor" ref={cursorRef} className="hidden lg:block"></div>
      
      {/* Extreme Background FX */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#020617]">
        {/* Subtle Cyber Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20"></div>

        {/* 3D Scanning Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-[60vh] scanning-grid opacity-40 origin-bottom"></div>

        {/* Global CRT Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_51%,transparent_51%)] bg-[length:100%_4px] pointer-events-none z-10 mix-blend-overlay"></div>
        
        {/* Animated Scanning Laser */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-sky-400/50 shadow-[0_0_30px_rgba(56,189,248,1)] animate-[scan_6s_linear_infinite] z-20 opacity-60"></div>

        {/* Floating Glowing Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-600/10 rounded-full blur-[150px] animate-float" style={{ animationDuration: '15s' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] animate-float" style={{ animationDuration: '20s', animationDelay: '-5s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[120px] animate-float" style={{ animationDuration: '18s', animationDelay: '-10s' }}></div>
        <div className="absolute bottom-[20%] left-[20%] w-[20%] h-[20%] bg-blue-500/10 rounded-full blur-[100px] animate-float" style={{ animationDuration: '25s', animationDelay: '-2s' }}></div>
        
        {/* Data Nodes (Animated Pings) */}
        <div className="absolute top-[30%] left-[15%] w-1.5 h-1.5 bg-sky-400 rounded-full shadow-[0_0_10px_rgba(56,189,248,1)]"><div className="absolute inset-0 bg-sky-400 rounded-full animate-ping opacity-75"></div></div>
        <div className="absolute top-[60%] right-[25%] w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(192,132,252,1)]"><div className="absolute inset-0 bg-purple-400 rounded-full animate-ping opacity-75" style={{ animationDuration: '2s' }}></div></div>
        <div className="absolute bottom-[25%] left-[40%] w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,1)]"><div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75" style={{ animationDuration: '3s' }}></div></div>
        <div className="absolute top-[15%] right-[40%] w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)]"><div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" style={{ animationDuration: '4s' }}></div></div>
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '16px',
          }
        }}
      />

      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage setIsAuthenticated={setIsAuthenticated} setUser={setUser} /> : <Navigate to="/" />} 
        />
        
        {!isAuthenticated ? (
          <>
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
            <Route index element={<Dashboard />} />
            <Route path="live-feed" element={<LiveFeed />} />
            <Route path="map" element={<MapView />} />
            <Route path="reports" element={<Reports />} />
            <Route path="drone-control" element={<DroneControl />} />
            <Route path="session/:id" element={<SessionDetail />} />
            <Route path="upload-detect" element={<UploadDetect />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="end-user-license" element={<EULA />} />
            <Route path="security-audit" element={<SecurityAudit />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
}

export default App;
