import React, { useEffect, useRef, useState } from 'react';
import socketService from '../services/socket';
import toast from 'react-hot-toast';
import { liveAPI, sessionsAPI, reportsAPI } from '../services/api';
import { Camera, Video, Navigation, MapPin, Battery, Zap, ShieldAlert, X, UploadCloud, Radio, Mic, MicOff } from 'lucide-react';
import voiceService from '../services/voice';

export default function LiveFeed() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const frameIntervalRef = useRef(null);
  const watchIdRef = useRef(null);

  const [droneData, setDroneData] = useState({
    battery: 0,
    altitude: 0,
    speed: 0,
    connectionStatus: 'disconnected',
    latitude: 0,
    longitude: 0,
    heading: 0,
    accuracy: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [cameraFacingMode, setCameraFacingMode] = useState('environment');
  const [gps, setGps] = useState({ latitude: 0, longitude: 0 });
  const [cameraLoading, setCameraLoading] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Toggle Voice
  const toggleVoice = () => {
    const newState = voiceService.toggle();
    setVoiceEnabled(newState);
    toast.success(newState ? 'Voice Intelligence Active' : 'Voice Link Suspended', { icon: '🎙️' });
  };

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
      toast.loading('Initializing Neural Link...', { id: 'camera-toast' });
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: cameraFacingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = mediaStream;
      setCameraReady(true);
      toast.success('Optical Sensor Linked', { id: 'camera-toast' });
    } catch (error) {
      toast.error('Sensor Access Denied', { id: 'camera-toast' });
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

  const startLocationTracking = () => {
    if (!navigator.geolocation) return;
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, heading, accuracy } = position.coords;
        setGps({ latitude, longitude });
        setDroneData(prev => ({ 
          ...prev, 
          latitude, 
          longitude, 
          heading: heading || 0,
          accuracy: accuracy || 0
        }));
      },
      (error) => console.warn('GPS Error:', error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
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
    formData.append('frame', blob, 'hud-frame.jpg');
    formData.append('sessionId', activeSessionId);
    formData.append('latitude', String(gps.latitude || 0));
    formData.append('longitude', String(gps.longitude || 0));
    formData.append('altitude', String(droneData.altitude || 12.5));
    formData.append('battery', String(droneData.battery || 88));
    formData.append('speed', String(droneData.speed || 4.2));

    await liveAPI.sendFrame(formData);
  };

  const startStreaming = async () => {
    if (!cameraReady) return toast.error('Initialize sensor link first');
    if (!activeSessionId) return toast.error('No active mission profile found');

    try {
      setStreamLoading(true);
      startLocationTracking();
      frameIntervalRef.current = setInterval(async () => {
        try { await sendFrameToBackend(); } catch (e) {}
      }, 2000);
      setIsStreaming(true);
      voiceService.speak("Neural Stream Established. Live AI mapping initialized.", "high");
      toast.success('Live AI Stream: ONLINE');
    } finally {
      setStreamLoading(false);
    }
  };

  const stopStreaming = () => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    stopLocationTracking();
    setIsStreaming(false);
    voiceService.speak("Stream terminated. Drone returning to standby.");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('location', JSON.stringify({ lat: gps.latitude || 28, lng: gps.longitude || 77 }));
    if (activeSessionId) formData.append('session', activeSessionId);

    try {
      toast.loading('Analyzing Static Image...', { id: 'upload' });
      await reportsAPI.create(formData);
      toast.success('Detection Complete', { id: 'upload' });
    } catch (e) {
      toast.error('Neural Analysis Failed', { id: 'upload' });
    } finally { e.target.value = ''; }
  };

  const drawDetectionBoxes = (boxes) => {
    const canvas = canvasRef.current;
    if (!canvas || !videoRef.current) return;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    boxes.forEach(box => {
      let x1, y1, x2, y2;
      if (Array.isArray(box)) [x1, y1, x2, y2] = box;
      else if (box.bbox) [x1, y1, x2, y2] = box.bbox;
      else return;
      
      x1 *= scaleX; y1 *= scaleY; x2 *= scaleX; y2 *= scaleY;
      const w = x2 - x1; const h = y2 - y1;
      
      // HUD-style box
      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, w, h);
      
      // Corners
      const cs = 10;
      ctx.beginPath();
      ctx.moveTo(x1-2, y1-2+cs); ctx.lineTo(x1-2, y1-2); ctx.lineTo(x1-2+cs, y1-2);
      ctx.moveTo(x2+2-cs, y1-2); ctx.lineTo(x2+2, y1-2); ctx.lineTo(x2+2, y1-2+cs);
      ctx.moveTo(x2+2, y2+2-cs); ctx.lineTo(x2+2, y2+2); ctx.lineTo(x2+2-cs, y2+2);
      ctx.moveTo(x1-2+cs, y2+2); ctx.lineTo(x1-2, y2+2); ctx.lineTo(x1-2, y2+2-cs);
      ctx.stroke();

      ctx.fillStyle = '#F43F5E';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillText('ANOMALY_DETECTED', x1, y1 > 15 ? y1 - 5 : y1 + 15);
    });
    setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 2000);
  };

  useEffect(() => {
    if (cameraReady && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraReady]);

  useEffect(() => {
    loadActiveSession();
    socketService.on('telemetry-update', (data) => setDroneData(prev => ({ ...prev, ...data })));
    socketService.on('damage-alert', (alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 20));
      if (alert.boxes) drawDetectionBoxes(alert.boxes);
      
      // TRIGGER VOICE ANNOUNCEMENT
      voiceService.announceDetection(alert.damageType, alert.severity, { lat: gps.latitude, lng: gps.longitude });
    });
    return () => {
      socketService.off('telemetry-update');
      socketService.off('damage-alert');
      stopStreaming(); stopCamera(); stopLocationTracking();
    };
  }, [gps]);

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-6 animate-enter">
      {/* Header HUD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-1">
             <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-rose-500 animate-pulse shadow-[0_0_10px_#f43f5e]' : 'bg-white/20'}`}></div>
             <h1 className="text-3xl font-black text-white tracking-tighter uppercase">HUD_<span className="text-blue-500">CONTROL</span></h1>
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Quantum Neural Optical Link</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-8 border-white/5">
              <div className="flex flex-col">
                 <p className="text-[9px] text-gray-500 font-bold uppercase">Signal</p>
                 <div className="flex gap-0.5 mt-1">
                    {[1,2,3,4].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i <= 3 ? 'bg-blue-500' : 'bg-white/10'}`}></div>)}
                 </div>
              </div>
              <div className="flex flex-col">
                 <p className="text-[9px] text-gray-500 font-bold uppercase">Link</p>
                 <span className="text-xs font-black text-blue-500 font-mono mt-1">SECURE</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Optical Sensor (Video) */}
        <div className="lg:col-span-9 glass-card rounded-[2.5rem] overflow-hidden border-white/5 relative bg-black shadow-2xl flex flex-col">
           {cameraReady ? (
             <div className="relative flex-1">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]" />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
                
                {/* HUD Overlays */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none z-20">
                   {/* Top HUD */}
                   <div className="flex justify-between items-start">
                      <div className="space-y-4">
                         <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3">
                            <Radio size={14} className={isStreaming ? 'text-rose-500 animate-pulse' : 'text-gray-500'} />
                            <span className="text-[10px] font-black font-mono text-white tracking-widest">{isStreaming ? 'TRANS_ENCODING_01' : 'STANDBY_MODE'}</span>
                         </div>
                         <div className="glass-panel px-4 py-2 rounded-xl flex flex-col">
                            <span className="text-[9px] text-blue-400 font-bold mb-1">COORDINATES</span>
                            <span className="text-xs font-black font-mono text-white">{gps.latitude.toFixed(6)} N / {gps.longitude.toFixed(6)} E</span>
                         </div>
                      </div>
                      
                      <div className="text-right space-y-4">
                         <div className="glass-panel px-4 py-2 rounded-xl flex flex-col items-end">
                            <span className="text-[9px] text-emerald-400 font-bold mb-1">MISSIONTIME</span>
                            <span className="text-xs font-black font-mono text-white">00:14:22:04</span>
                         </div>
                      </div>
                   </div>

                   {/* Center Reticle */}
                   <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      <div className="w-32 h-32 border border-blue-500/30 rounded-full relative">
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-blue-500"></div>
                         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-blue-500"></div>
                         <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-blue-500"></div>
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-blue-500"></div>
                      </div>
                   </div>

                   {/* Bottom HUD & Controls */}
                   <div className="flex items-end justify-between pointer-events-auto">
                      <div className="flex flex-col gap-4">
                         <button onClick={stopCamera} className="p-4 glass-panel rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all">
                            <X size={20} />
                         </button>
                      </div>

                      <div className="flex flex-col items-center gap-4">
                         <button 
                            onClick={isStreaming ? stopStreaming : startStreaming}
                            className={`w-24 h-24 rounded-full border-2 border-white/20 p-2 transition-all duration-500 ${isStreaming ? 'shadow-[0_0_30px_rgba(244,63,94,0.4)]' : 'hover:scale-110'}`}
                         >
                            <div className={`w-full h-full rounded-full flex items-center justify-center transition-all ${isStreaming ? 'bg-rose-500' : 'bg-white'}`}>
                               {isStreaming ? <Zap size={32} className="text-white fill-white" /> : <Video size={32} className="text-black" />}
                            </div>
                         </button>
                         <p className="text-[10px] font-black text-white uppercase tracking-[0.5em]">{isStreaming ? 'END_INTEL' : 'INIT_INTEL'}</p>
                      </div>

                      <div className="relative">
                         <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                         <button className="p-4 glass-panel rounded-2xl text-blue-500 hover:bg-blue-500/10 transition-all">
                            <UploadCloud size={20} />
                         </button>
                      </div>
                   </div>
                </div>

                {/* Holographic Scanning Grid */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
                   <div className="scanning-grid absolute inset-0"></div>
                </div>
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-8 pulse-glow border border-blue-500/20 hud-glitch">
                   <Camera size={40} className="text-blue-500" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4 scramble-text" data-text="Awaiting Optical Link">Awaiting Optical Link</h2>
                <p className="text-gray-500 max-w-sm mb-10 leading-relaxed font-medium">Link your tactical camera sensor to begin real-time neural mapping of the terrain.</p>
                <button onClick={startCamera} className="btn-primary shimmer">
                   ESTABLISH LINK
                </button>
             </div>
           )}
        </div>

        {/* Tactical Info (Sidebar) */}
        <div className="lg:col-span-3 flex flex-col gap-6 overflow-hidden">
           {/* Telemetry */}
           <div className="glass-card rounded-[2rem] p-8 space-y-6 border-white/5">
               <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                     <Navigation size={14} /> Telemetry_V4
                  </h3>
                  <button 
                    onClick={toggleVoice}
                    className={`p-2 rounded-xl border transition-all ${voiceEnabled ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-white/5 border-white/5 text-gray-500'}`}
                  >
                    {voiceEnabled ? <Mic size={14} /> : <MicOff size={14} />}
                  </button>
               </div>
               
               <div className="space-y-6">
                  <TelemetryPoint 
                    icon={<Zap size={16} />} 
                    label="ALTITUDE" 
                    value={`${droneData.altitude.toFixed(1)}m`} 
                    history={[12, 14, 13, 15, 14, 16, 15, 17]}
                  />
                  <TelemetryPoint 
                    icon={<Navigation size={16} />} 
                    label="VELOCITY" 
                    value={`${droneData.speed.toFixed(1)}m/s`} 
                    history={[4.1, 4.3, 4.2, 4.5, 4.4, 4.6, 4.5, 4.7]}
                  />
                  <div className="space-y-2">
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase">
                           <Battery size={14} className={droneData.battery < 20 ? 'text-rose-500 animate-pulse' : ''} /> Energy_Core
                        </div>
                        <span className="text-xs font-black font-mono text-white">{droneData.battery}%</span>
                     </div>
                     <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${droneData.battery < 20 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{width: `${droneData.battery}%`}}></div>
                     </div>
                  </div>
               </div>
            </div>

           {/* Live Intel Logs */}
           <div className="glass-card rounded-[2rem] p-8 flex-1 border-white/5 flex flex-col overflow-hidden">
              <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                 <ShieldAlert size={14} /> Intelligence_Feed
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                 {alerts.length > 0 ? (
                   alerts.map((alert, idx) => (
                     <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 border-l-2 border-rose-500 animate-enter">
                        <p className="text-[9px] text-gray-500 font-black mb-1 uppercase tracking-tighter">Event_Log_{alert.timestamp.slice(-4)}</p>
                        <p className="text-xs font-black text-white uppercase">{alert.damageType}</p>
                        <div className="flex justify-between items-center mt-2">
                           <span className="text-[9px] font-black text-rose-500 uppercase">{alert.severity} THREAT</span>
                           <span className="text-[9px] font-mono text-gray-600">CONF: {Math.round(alert.confidence * 100)}%</span>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                      <Radio size={32} className="mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Scanning Terrain...</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function NeuralSparkline({ data }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  return (
    <div className="flex items-end gap-1 h-6 w-16 neural-sparkline">
      {data.map((val, i) => (
        <div 
          key={i} 
          className="w-1.5 bg-blue-500/40 rounded-full transition-all duration-500" 
          style={{ height: `${((val - min) / range) * 100 + 10}%` }}
        ></div>
      ))}
    </div>
  );
}

function TelemetryPoint({ icon, label, value, history = [] }) {
  return (
    <div className="flex flex-col border-b border-white/5 pb-4">
       <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/5 rounded-xl text-gray-400">{icon}</div>
             <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{label}</span>
          </div>
          <span className="text-xl font-black text-white font-mono">{value}</span>
       </div>
       <div className="flex justify-end">
          <NeuralSparkline data={history} />
       </div>
    </div>
  );
}
