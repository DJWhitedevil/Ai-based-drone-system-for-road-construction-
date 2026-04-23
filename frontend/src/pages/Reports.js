import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { reportsAPI } from '../services/api';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    damageType: '',
    severity: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportsAPI.getAll(filters);
      setReports(res.data || []);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      damageType: '',
      severity: '',
      status: '',
      startDate: '',
      endDate: ''
    });
  };

  const exportToCSV = () => {
    if (reports.length === 0) {
      toast.error('No reports to export');
      return;
    }

    const headers = ['ID', 'Location', 'Damage Type', 'Severity', 'Status', 'Date'];
    const data = reports.map(r => [
      r._id,
      `${r.location?.lat}, ${r.location?.lng}`,
      r.damageType,
      r.severity,
      r.status,
      new Date(r.timestamp).toLocaleDateString()
    ]);

    const csv = [headers, ...data]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV exported successfully');
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await reportsAPI.updateStatus(id, { status: newStatus });
      toast.success('Status updated');
      fetchReports();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-50">Damage Reports</h1>
        <p className="text-dark-400 mt-2">View and manage all detected road damages</p>
      </div>

      {/* Filters */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
          <select
            name="damageType"
            value={filters.damageType}
            onChange={handleFilterChange}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
          >
            <option value="">All Damage Types</option>
            <option value="crack">Crack</option>
            <option value="pothole">Pothole</option>
          </select>

          <select
            name="severity"
            value={filters.severity}
            onChange={handleFilterChange}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
          >
            <option value="">All Severity</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
          >
            <option value="">All Status</option>
            <option value="reported">Reported</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
          />

          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
          />

          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-lg text-dark-300 transition-colors"
          >
            Reset
          </button>
        </div>

        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          📥 Export to CSV
        </button>
      </div>

      {/* Reports Table */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
          </div>
        ) : reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-700 border-b border-dark-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-50">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-50">Location</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-50">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-50">Severity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-50">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-50">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-dark-50">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-dark-700 transition-colors">
                    <td className="px-6 py-4 text-sm text-dark-50">{report._id.slice(-8)}</td>
                    <td className="px-6 py-4 text-sm text-dark-400">
                      {report.location?.lat?.toFixed(4)}, {report.location?.lng?.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-50 capitalize">{report.damageType}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        report.severity === 'high' ? 'bg-red-500 text-white' :
                        report.severity === 'medium' ? 'bg-orange-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        {report.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusUpdate(report._id, e.target.value)}
                        className="px-2 py-1 bg-dark-600 border border-dark-500 rounded text-dark-50 text-xs"
                      >
                        <option value="reported">Reported</option>
                        <option value="assigned">Assigned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-400">
                      {new Date(report.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-blue-400 hover:text-blue-300 font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className="text-dark-400">No reports found</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-dark-400">
        Showing {reports.length} report(s)
      </div>
    </div>
  );
}
