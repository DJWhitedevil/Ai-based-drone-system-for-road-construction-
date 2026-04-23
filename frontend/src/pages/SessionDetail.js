import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { sessionsAPI } from '../services/api';

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await sessionsAPI.getById(id);
        setSession(res.data);
      } catch (error) {
        toast.error('Failed to load session');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6">
        <p className="text-dark-400">Session not found</p>
      </div>
    );
  }

  const duration = session.endTime
    ? Math.round((new Date(session.endTime) - new Date(session.startTime)) / 60000) + ' minutes'
    : 'Ongoing';

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/')}
        className="mb-6 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-dark-300 rounded-lg transition-colors"
      >
        ← Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-50">Session Detail</h1>
        <p className="text-dark-400 mt-2">{session.area}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <InfoCard label="Status" value={session.status} />
        <InfoCard label="Duration" value={duration} />
        <InfoCard label="Total Distance" value={`${session.totalDistance} km`} />
        <InfoCard label="Damages Found" value={session.totalDamages} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Summary */}
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
          <h2 className="text-xl font-bold text-dark-50 mb-4">Session Summary</h2>
          <div className="space-y-4">
            <DetailRow label="Start Time" value={new Date(session.startTime).toLocaleString()} />
            <DetailRow
              label="End Time"
              value={session.endTime ? new Date(session.endTime).toLocaleString() : 'N/A'}
            />
            <DetailRow label="Drone ID" value={session.droneId} />
            <DetailRow label="Operator" value={session.operator?.name || 'Unknown'} />
            <DetailRow label="Area" value={session.area} />
          </div>
        </div>

        {/* Damage Summary */}
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
          <h2 className="text-xl font-bold text-dark-50 mb-4">Damage Summary</h2>
          <div className="space-y-3">
            <div className="bg-dark-700 rounded-lg p-4">
              <p className="text-dark-400 text-sm">By Type</p>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-dark-50">{session.damageSummary?.cracks || 0}</p>
                  <p className="text-xs text-dark-400 mt-1">Cracks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-dark-50">{session.damageSummary?.potholes || 0}</p>
                  <p className="text-xs text-dark-400 mt-1">Potholes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-dark-50">{session.damageSummary?.undamaged || 0}</p>
                  <p className="text-xs text-dark-400 mt-1">Undamaged</p>
                </div>
              </div>
            </div>

            <div className="bg-dark-700 rounded-lg p-4">
              <p className="text-dark-400 text-sm">By Severity</p>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{session.severitySummary?.high || 0}</p>
                  <p className="text-xs text-dark-400 mt-1">High</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-400">{session.severitySummary?.medium || 0}</p>
                  <p className="text-xs text-dark-400 mt-1">Medium</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{session.severitySummary?.low || 0}</p>
                  <p className="text-xs text-dark-400 mt-1">Low</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Position */}
      {session.latitude && session.longitude && (
        <div className="mt-6 bg-dark-800 rounded-lg border border-dark-700 p-6">
          <h2 className="text-xl font-bold text-dark-50 mb-4">Latest Position</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailRow label="Latitude" value={session.latitude.toFixed(6)} />
            <DetailRow label="Longitude" value={session.longitude.toFixed(6)} />
            <DetailRow label="Altitude" value={`${session.altitude || 0} m`} />
            <DetailRow label="Speed" value={`${session.speed || 0} m/s`} />
          </div>
        </div>
      )}

      {/* Reports in this session */}
      {session.reports && session.reports.length > 0 && (
        <div className="mt-6 bg-dark-800 rounded-lg border border-dark-700 p-6">
          <h2 className="text-xl font-bold text-dark-50 mb-4">Detected Damages ({session.reports.length})</h2>
          <div className="space-y-3">
            {session.reports.map((report, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                <div>
                  <p className="font-medium text-dark-50 capitalize">{report.damageType}</p>
                  <p className="text-xs text-dark-400 mt-1">
                    {report.location?.lat?.toFixed(4)}, {report.location?.lng?.toFixed(4)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-semibold ${
                  report.severity === 'high' ? 'bg-red-500 text-white' :
                  report.severity === 'medium' ? 'bg-orange-500 text-white' :
                  'bg-green-500 text-white'
                }`}>
                  {report.severity.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-dark-800 rounded-lg border border-dark-700 p-4">
      <p className="text-dark-400 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold text-dark-50 mt-2 capitalize">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0">
      <span className="text-dark-400 text-sm">{label}</span>
      <span className="font-medium text-dark-50">{value}</span>
    </div>
  );
}
