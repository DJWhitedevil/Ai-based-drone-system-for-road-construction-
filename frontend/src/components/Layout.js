import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Video, Map as MapIcon, FileText, Gamepad2, Search, Bell } from 'lucide-react';

export default function Layout({ user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    { name: 'Live Feed', path: '/live-feed', icon: <Video size={18} /> },
    { name: 'Map View', path: '/map', icon: <MapIcon size={18} /> },
    { name: 'Reports', path: '/reports', icon: <FileText size={18} /> },
    { name: 'Control', path: '/drone-control', icon: <Gamepad2 size={18} /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-800/60 bg-[#0B0F19]/80 backdrop-blur-xl">
        <div className="px-4 lg:px-8 flex items-center justify-between h-20">

          {/* Logo & Main Nav (Left/Center) */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center shrink-0">
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 tracking-tight">DroneAI</h1>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${isActive(item.path)
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                    }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search, User, Actions (Right) */}
          <div className="hidden lg:flex items-center gap-6 flex-1 justify-end ml-8">
            {/* Search Bar */}
            <div className="relative group max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search telemetry..."
                className="w-full bg-gray-900/50 border border-gray-800 rounded-xl pl-11 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
              />
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              <div className="h-6 w-px bg-gray-800"></div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-bold uppercase text-sm">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="text-left hidden xl:block">
                  <p className="text-sm font-bold text-gray-200 leading-tight">{user?.name || 'Admin User'}</p>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-dark-800 border-t border-gray-700 absolute w-full left-0 z-50 shadow-2xl">
            <nav className="px-4 pt-4 pb-6 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-700">
                <button
                  onClick={onLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 lg:p-8 w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
