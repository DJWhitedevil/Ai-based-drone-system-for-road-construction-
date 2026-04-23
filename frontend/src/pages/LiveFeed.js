import React, { useEffect, useRef, useState } from 'react';
import socketService from '../services/socket';
import toast from 'react-hot-toast';
import { liveAPI, sessionsAPI } from '../services/api';

export default function LiveFeed() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const frameIntervalRef = useRef(null);

  const [droneData, setDroneData] = useState({
    battery: 0,
    altitude: 0,
    speed: 0,
    connectionStatus: 'disconnected',
    latitude: 0,
    longitude: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState('environment');
  const [gps, setGps] = useState({ latitude: 0, longitude: 0 });
  const [cameraLoading, setCameraLoading] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false);

  useEffect(() => {
    loadActiveSession();

    // Listen for telemetry updates
    socketService.on('telemetry-update', (data) => {
      setDroneData(prev => ({ ...prev, ...data }));
    });

    // Listen for damage alerts
    socketService.on('damage-alert', (data) => {
      setAlerts(prev => [data, ...prev.slice(0, 9)]);
      toast.custom((t) => (
        <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg">
          <p className="font-bold">🚨 Damage Detected!</p>
          <p className="text-sm mt-1">{data.damageType} - {data.severity} severity</p>
        </div>
      ));
    });

    return () => {
      socketService.off('telemetry-update');
      socketService.off('damage-alert');
      stopStreaming();
      stopCamera();
    };
  }, []);

  const loadActiveSession = async () => {
    try {
      const response = await sessionsAPI.getAll();
      const activeSession = response.data?.find((session) => session.status === 'active');
      if (activeSession?._id) {
        setActiveSessionId(activeSession._id);
        socketService.joinDroneFeed(activeSession._id);
      }
    } catch (error) {
      console.error('Failed to load active session:', error);
    }
  };

  const startCamera = async () => {
    try {
      setCameraLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacingMode },
        audio: false
      });

      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraReady(true);
      toast.success('Phone camera connected');
    } catch (error) {
      toast.error('Camera access denied. Allow camera permission in browser.');
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  };

  const updatePhoneLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGps({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => {
        // Location is optional for testing.
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  };

  const sendFrameToBackend = async () => {
    if (!videoRef.current || !canvasRef.current || !activeSessionId) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.videoWidth || !video.videoHeight) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
    if (!blob) return;

    const formData = new FormData();
    formData.append('frame', blob, 'phone-frame.jpg');
    formData.append('sessionId', activeSessionId);
    formData.append('latitude', String(gps.latitude || 0));
    formData.append('longitude', String(gps.longitude || 0));
    formData.append('altitude', String(droneData.altitude || 12));
    formData.append('battery', String(droneData.battery || 85));
    formData.append('speed', String(droneData.speed || 3));

    await liveAPI.sendFrame(formData);
  };

  const startStreaming = async () => {
    if (!cameraReady) {
      toast.error('Start camera first');
      return;
    }
    if (!activeSessionId) {
      toast.error('Start a mission in Drone Control first');
      return;
    }

    try {
      setStreamLoading(true);
      updatePhoneLocation();
      frameIntervalRef.current = setInterval(async () => {
        updatePhoneLocation();
        try {
          await sendFrameToBackend();
        } catch (error) {
          console.error('Frame send failed:', error);
        }
      }, 2000);
      setIsStreaming(true);
      toast.success('Phone camera streaming started');
    } finally {
      setStreamLoading(false);
    }
  };

  const stopStreaming = () => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    setIsStreaming(false);
  };

  const getConnectionColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'weak':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-50">Live Drone Feed</h1>
        <p className="text-dark-400 mt-2">Real-time drone telemetry and video stream</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Feed Area */}
        <div className="lg:col-span-2">
          <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
            <div className="bg-black aspect-video flex items-center justify-center">
              {cameraReady ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center px-4">
                  <p className="text-dark-300 text-lg">Use Phone Camera for Testing</p>
                  <p className="text-dark-500 text-sm mt-2">
                    Start camera and stream frames to backend AI detection
                  </p>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Connection Status Bar */}
            <div className="bg-dark-700 border-t border-dark-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${getConnectionColor(droneData.connectionStatus)}`}></div>
                <span className="text-dark-50 font-medium capitalize">{droneData.connectionStatus}</span>
              </div>
              <p className="text-dark-400 text-sm">
                {droneData.latitude.toFixed(4)}, {droneData.longitude.toFixed(4)}
              </p>
            </div>
          </div>

          <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 mt-4">
            <p className="text-dark-50 font-semibold mb-3">Phone Camera Test Controls</p>
            <p className="text-xs text-dark-400 mb-4">
              For best results on mobile, run in Chrome and allow Camera + Location permissions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <button
                onClick={startCamera}
                disabled={cameraLoading || cameraReady}
                className="py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white rounded-lg text-sm font-medium"
              >
                {cameraLoading ? 'Opening...' : 'Start Camera'}
              </button>
              <button
                onClick={stopCamera}
                disabled={!cameraReady}
                className="py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white rounded-lg text-sm font-medium"
              >
                Stop Camera
              </button>
              <button
                onClick={startStreaming}
                disabled={streamLoading || isStreaming || !cameraReady}
                className="py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-900 text-white rounded-lg text-sm font-medium"
              >
                {streamLoading ? 'Starting...' : 'Start Sending Frames'}
              </button>
              <button
                onClick={stopStreaming}
                disabled={!isStreaming}
                className="py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white rounded-lg text-sm font-medium"
              >
                Stop Sending Frames
              </button>
            </div>
            <div className="text-xs text-dark-400 space-y-1">
              <p>Active Session: {activeSessionId || 'No active mission'}</p>
              <p>Camera: {cameraReady ? 'Ready' : 'Off'} | Stream: {isStreaming ? 'Sending frames every 2s' : 'Stopped'}</p>
              <p>Phone GPS: {gps.latitude.toFixed(4)}, {gps.longitude.toFixed(4)}</p>
            </div>
          </div>
        </div>

        {/* Telemetry Panel */}
        <div className="space-y-4">
          {/* Altitude */}
          <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-dark-400 text-sm">Altitude</span>
              <span className="text-2xl">📏</span>
            </div>
            <p className="text-3xl font-bold text-blue-400">{droneData.altitude.toFixed(1)}</p>
            <p className="text-dark-400 text-sm mt-1">meters</p>
          </div>

          {/* Speed */}
          <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-dark-400 text-sm">Speed</span>
              <span className="text-2xl">💨</span>
            </div>
            <p className="text-3xl font-bold text-green-400">{droneData.speed.toFixed(1)}</p>
            <p className="text-dark-400 text-sm mt-1">m/s</p>
          </div>

          {/* Battery */}
          <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-dark-400 text-sm">Battery</span>
              <span className="text-2xl">🔋</span>
            </div>
            <p className="text-3xl font-bold text-orange-400">{droneData.battery.toFixed(0)}%</p>
            <div className="mt-3 bg-dark-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  droneData.battery > 50 ? 'bg-green-500' :
                  droneData.battery > 20 ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${droneData.battery}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-dark-50 mb-4">Recent Damage Alerts</h2>
        <div className="space-y-3">
          {alerts.length > 0 ? (
            alerts.map((alert, idx) => (
              <div key={idx} className="bg-dark-800 rounded-lg border border-red-600 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-dark-50">🚨 {alert.damageType}</p>
                    <p className={`text-sm mt-1 ${
                      alert.severity === 'high' ? 'text-red-400' :
                      alert.severity === 'medium' ? 'text-orange-400' :
                      'text-green-400'
                    }`}>
                      {alert.severity.toUpperCase()} - {(alert.confidence * 100).toFixed(1)}% confidence
                    </p>
                  </div>
                  <p className="text-dark-400 text-sm">
                    {alert.location?.lat?.toFixed(4)}, {alert.location?.lng?.toFixed(4)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-dark-400 text-center py-4">No alerts yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
