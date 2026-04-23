import React, { useEffect, useState } from 'react';
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
import socketService from './services/socket';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      socketService.connect();
    }
    
    setLoading(false);
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
      <div className="flex items-center justify-center h-screen bg-dark-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage setIsAuthenticated={setIsAuthenticated} setUser={setUser} /> : <Navigate to="/" />} 
        />
        
        {isAuthenticated ? (
          <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
            <Route index element={<Dashboard />} />
            <Route path="live-feed" element={<LiveFeed />} />
            <Route path="map" element={<MapView />} />
            <Route path="reports" element={<Reports />} />
            <Route path="drone-control" element={<DroneControl />} />
            <Route path="session/:id" element={<SessionDetail />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
