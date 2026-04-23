import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { sessionsAPI } from '../services/api';

export default function DroneControl() {
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('manual');
  const [formData, setFormData] = useState({
    area: '',
    droneId: 'DRONE-001'
  });

  useEffect(() => {
    // Load active session on mount
    loadActiveSessions();
  }, []);

  const loadActiveSessions = async () => {
    try {
      const res = await sessionsAPI.getAll();
      const active = res.data?.find(s => s.status === 'active');
      if (active) setActiveSession(active);
    } catch (error) {
      console.error('Failed to load sessions');
    }
  };

  const handleStartMission = async () => {
    if (!formData.area) {
      toast.error('Please enter an area name');
      return;
    }

    setLoading(true);
    try {
      const res = await sessionsAPI.start(formData);
      setActiveSession(res.data);
      toast.success('Mission started successfully!');
      setFormData({ area: '', droneId: 'DRONE-001' });
    } catch (error) {
      toast.error('Failed to start mission');
    } finally {
      setLoading(false);
    }
  };

  const handleStopMission = async () => {
    if (!activeSession) return;

    setLoading(true);
    try {
      const res = await sessionsAPI.end(activeSession._id);
      setActiveSession(null);
      toast.success('Mission ended successfully!');
    } catch (error) {
      toast.error('Failed to end mission');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseMission = async () => {
    if (!activeSession) return;

    setLoading(true);
    try {
      const res = await sessionsAPI.pause(activeSession._id);
      setActiveSession(res.data);
      toast.success('Mission paused');
    } catch (error) {
      toast.error('Failed to pause mission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-50">Drone Control Panel</h1>
        <p className="text-dark-400 mt-2">Manage and control drone missions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission Control */}
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
          <h2 className="text-xl font-bold text-dark-50 mb-6">Mission Control</h2>

          {!activeSession ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Inspection Area</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g., Highway Route 66"
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50 placeholder-dark-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Drone ID</label>
                <input
                  type="text"
                  value={formData.droneId}
                  onChange={(e) => setFormData({ ...formData, droneId: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleStartMission}
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                🚀 Start Mission
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-dark-700 rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-sm text-dark-400">Active Mission</p>
                <p className="text-lg font-bold text-green-400 mt-1">{activeSession.area}</p>
                <p className="text-xs text-dark-400 mt-2">
                  Started: {new Date(activeSession.startTime).toLocaleTimeString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-dark-700 rounded-lg p-3">
                  <p className="text-xs text-dark-400">Total Distance</p>
                  <p className="text-xl font-bold text-dark-50">{activeSession.totalDistance} km</p>
                </div>
                <div className="bg-dark-700 rounded-lg p-3">
                  <p className="text-xs text-dark-400">Damages Found</p>
                  <p className="text-xl font-bold text-red-400">{activeSession.totalDamages}</p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handlePauseMission}
                  disabled={loading}
                  className="w-full py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white rounded-lg font-bold transition-colors"
                >
                  ⏸️ {activeSession.status === 'paused' ? 'Resume' : 'Pause'} Mission
                </button>
                <button
                  onClick={handleStopMission}
                  disabled={loading}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg font-bold transition-colors"
                >
                  ⏹️ Stop Mission
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Flight Mode & Settings */}
        <div className="space-y-6">
          {/* Flight Mode */}
          <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
            <h2 className="text-xl font-bold text-dark-50 mb-4">Flight Mode</h2>
            <div className="space-y-2">
              <button
                onClick={() => setMode('manual')}
                className={`w-full py-3 rounded-lg font-bold transition-colors ${
                  mode === 'manual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                }`}
              >
                👤 Manual Control
              </button>
              <button
                onClick={() => setMode('auto')}
                className={`w-full py-3 rounded-lg font-bold transition-colors ${
                  mode === 'auto'
                    ? 'bg-blue-600 text-white'
                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                }`}
              >
                🤖 Autonomous Mode
              </button>
            </div>
            <p className="text-xs text-dark-400 mt-4">
              {mode === 'manual'
                ? 'Direct control of drone movements and camera'
                : 'AI-guided autonomous inspection along preset routes'}
            </p>
          </div>

          {/* System Status */}
          <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
            <h2 className="text-xl font-bold text-dark-50 mb-4">System Status</h2>
            <div className="space-y-3">
              <StatusItem label="Drone Connection" status="connected" />
              <StatusItem label="GPS Signal" status="connected" />
              <StatusItem label="Camera System" status="connected" />
              <StatusItem label="AI Model" status="connected" />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
            <h2 className="text-xl font-bold text-dark-50 mb-4">Quick Stats</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Today's Missions:</span>
                <span className="font-semibold text-dark-50">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Total Coverage:</span>
                <span className="font-semibold text-dark-50">45 km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Damages Detected:</span>
                <span className="font-semibold text-red-400">12</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Control Grid (if in manual mode) */}
      {mode === 'manual' && activeSession && (
        <div className="mt-8 bg-dark-800 rounded-lg border border-dark-700 p-6">
          <h2 className="text-xl font-bold text-dark-50 mb-6">Manual Flight Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Movement */}
            <div>
              <p className="text-dark-300 text-sm font-medium mb-3">Movement</p>
              <div className="grid grid-cols-3 gap-2 w-32 h-32 auto-rows-fr">
                <div></div>
                <button className="bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold">↑</button>
                <div></div>
                <button className="bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold">←</button>
                <button className="bg-gray-600 rounded-lg text-white font-bold">●</button>
                <button className="bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold">→</button>
                <div></div>
                <button className="bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold">↓</button>
                <div></div>
              </div>
            </div>

            {/* Altitude */}
            <div>
              <p className="text-dark-300 text-sm font-medium mb-3">Altitude</p>
              <div className="space-y-2">
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">
                  ↑ Up
                </button>
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">
                  ↓ Down
                </button>
              </div>
            </div>

            {/* Rotation */}
            <div>
              <p className="text-dark-300 text-sm font-medium mb-3">Rotation</p>
              <div className="space-y-2">
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">
                  ↻ CW
                </button>
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">
                  ↺ CCW
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusItem({ label, status }) {
  const isConnected = status === 'connected';
  return (
    <div className="flex items-center justify-between p-2 bg-dark-700 rounded">
      <span className="text-dark-300 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className={`text-xs font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
          {isConnected ? 'Connected' : 'Offline'}
        </span>
      </div>
    </div>
  );
}
