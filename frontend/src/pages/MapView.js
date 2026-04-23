import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { Clock, Navigation, AlertTriangle, Layers, Crosshair, Map } from 'lucide-react';
import { reportsAPI } from '../services/api';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

// Component to dynamically update map center
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function MapView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await reportsAPI.getAll({});
        setReports(res.data || []);
      } catch (error) {
        toast.error('Failed to load map data');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();

    // Clock interval
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          toast.success('Location updated!');
        },
        (error) => {
          toast.error('Failed to access location. Please enable location services.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const getMarkerColor = (severity) => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#3b82f6';
    }
  };

  const createCustomIcon = (severity) => {
    return L.divIcon({
      className: 'damage-marker',
      html: `<div style="background: linear-gradient(135deg, ${getMarkerColor(severity)}, ${severity === 'high' ? '#b91c1c' : severity === 'medium' ? '#d97706' : '#059669'}); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 0 15px ${getMarkerColor(severity)}80;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  const currentUserIcon = L.divIcon({
    className: 'current-location-marker',
    html: `<div style="width: 24px; height: 24px; background-color: #3b82f6; border: 4px solid white; border-radius: 50%; box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);"></div><div style="position: absolute; top: -8px; left: -8px; width: 40px; height: 40px; background-color: rgba(59, 130, 246, 0.3); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const filteredReports = selectedSeverity
    ? reports.filter(r => r.severity === selectedSeverity)
    : reports;

  const center = [40.7128, -74.0060]; // Default center (NYC)
  const mapCenter = currentLocation || center;

  return (
    <div className="space-y-6">
      {/* Header Overlay */}
      <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Map className="text-blue-400" />
            Live Operations Map
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Real-time geospatial tracking of road anomalies</p>
        </div>
        
        {/* Clock & Location Info */}
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700">
            <Clock size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-gray-200" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <button 
            onClick={requestLocation}
            className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-xl border border-blue-500/30 transition-colors"
          >
            <Navigation size={16} />
            <span className="text-sm font-medium">Recenter</span>
          </button>
        </div>
      </div>

      {/* Filters & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 glass-card rounded-xl p-2 flex gap-2 overflow-x-auto">
          <FilterButton active={selectedSeverity === ''} onClick={() => setSelectedSeverity('')} label="All Markers" count={reports.length} color="blue" />
          <FilterButton active={selectedSeverity === 'high'} onClick={() => setSelectedSeverity('high')} label="High" count={reports.filter(r => r.severity === 'high').length} color="red" />
          <FilterButton active={selectedSeverity === 'medium'} onClick={() => setSelectedSeverity('medium')} label="Medium" count={reports.filter(r => r.severity === 'medium').length} color="orange" />
          <FilterButton active={selectedSeverity === 'low'} onClick={() => setSelectedSeverity('low')} label="Low" count={reports.filter(r => r.severity === 'low').length} color="green" />
        </div>
      </div>

      {/* Map Container */}
      <div className="relative glass-card rounded-2xl overflow-hidden border border-gray-800" style={{ height: '65vh', minHeight: '500px' }}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0B0F19]/80 backdrop-blur-sm z-10">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 animate-spin" style={{ animationDirection: 'reverse' }}></div>
            </div>
          </div>
        ) : null}
        
        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <MapUpdater center={currentLocation} />
          
          {currentLocation && (
            <Marker position={currentLocation} icon={currentUserIcon}>
              <Popup>
                <div className="p-1 min-w-[120px]">
                  <p className="font-bold text-gray-800">Your Location</p>
                  <p className="text-xs text-gray-500 mt-1">Live tracking active</p>
                </div>
              </Popup>
            </Marker>
          )}

          {filteredReports.map((report) => (
            <Marker
              key={report._id}
              position={[report.location?.lat || center[0], report.location?.lng || center[1]]}
              icon={createCustomIcon(report.severity)}
            >
              <Popup>
                <div className="p-1 min-w-[150px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${
                      report.severity === 'high' ? 'bg-red-500' :
                      report.severity === 'medium' ? 'bg-orange-500' :
                      'bg-emerald-500'
                    }`}>
                      {report.severity}
                    </span>
                  </div>
                  <p className="font-bold text-gray-800 capitalize mb-1">{report.damageType}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <Crosshair size={12} /> {report.location?.lat?.toFixed(5)}, {report.location?.lng?.toFixed(5)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(report.timestamp).toLocaleString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Floating Legend Overlay */}
        <div className="absolute bottom-6 right-6 z-[1000] glass-panel rounded-xl p-4 border border-gray-700 shadow-2xl backdrop-blur-md bg-[#111827]/80">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers size={14} /> Map Legend
          </h3>
          <div className="space-y-3">
            <LegendItem color="bg-blue-500" label="Current Location" pulse />
            <LegendItem color="bg-red-500" label="High Severity" />
            <LegendItem color="bg-orange-500" label="Medium Severity" />
            <LegendItem color="bg-emerald-500" label="Low Severity" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, label, count, color }) {
  const baseClasses = "flex-1 min-w-[100px] flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border";
  
  let colorClasses = "";
  if (active) {
    if (color === 'blue') colorClasses = "bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]";
    if (color === 'red') colorClasses = "bg-red-600/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
    if (color === 'orange') colorClasses = "bg-orange-600/20 text-orange-400 border-orange-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
    if (color === 'green') colorClasses = "bg-emerald-600/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
  } else {
    colorClasses = "bg-transparent text-gray-400 border-gray-700/50 hover:bg-gray-800 hover:text-gray-300";
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${colorClasses}`}>
      <span>{label}</span>
      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-900/50`}>{count}</span>
    </button>
  );
}

function LegendItem({ color, label, pulse }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`relative w-3 h-3 rounded-full ${color} shadow-[0_0_8px_currentColor]`}>
        {pulse && <div className={`absolute inset-0 rounded-full ${color} animate-ping opacity-75`}></div>}
      </div>
      <span className="text-xs text-gray-300 font-medium">{label}</span>
    </div>
  );
}
