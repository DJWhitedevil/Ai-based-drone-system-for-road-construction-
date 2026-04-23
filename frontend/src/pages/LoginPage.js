import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { authAPI } from '../services/api';

export default function LoginPage({ setIsAuthenticated, setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'engineer',
  });
  const navigate = useNavigate();
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const loginBackgroundVideo = '/8b9b8d120d59232d819feba746ba4228_720w.mp4';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await authAPI.login({ email: formData.email, password: formData.password });
      } else {
        response = await authAPI.register(formData);
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setIsAuthenticated(true);
      setUser(response.data.user);
      toast.success(isLogin ? 'Login successful!' : 'Registration successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    if (!googleClientId) {
      toast.error('Google auth is not configured. Add REACT_APP_GOOGLE_CLIENT_ID.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const response = await authAPI.googleAuth({ credential: credentialResponse.credential });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setIsAuthenticated(true);
      setUser(response.data.user);
      toast.success('Google authentication successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-dark-900 flex items-center justify-center px-4 py-8">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={loginBackgroundVideo} type="video/mp4" />
      </video>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute top-[-120px] left-[-120px] h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-80px] h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold tracking-wide uppercase mb-4">
            Smart Inspection Platform
          </div>
          <h1 className="text-4xl font-bold text-blue-400 mb-2 drop-shadow-sm">DroneAI</h1>
          <p className="text-dark-300">AI-Powered Road Analysis System</p>
        </div>

        {/* Form Card */}
        <div className="bg-dark-800/90 backdrop-blur-sm rounded-2xl border border-dark-700 shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-dark-50 mb-6 text-center">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-dark-700/90 border border-dark-600 rounded-lg text-dark-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-dark-700/90 border border-dark-600 rounded-lg text-dark-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                  >
                    <option value="engineer">Engineer</option>
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-dark-700/90 border border-dark-600 rounded-lg text-dark-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-dark-700/90 border border-dark-600 rounded-lg text-dark-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-800 disabled:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-900/30"
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-dark-600" />
              <span className="text-xs uppercase tracking-wide text-dark-400">or</span>
              <div className="h-px flex-1 bg-dark-600" />
            </div>

            {googleClientId ? (
              <div className="flex justify-center py-1">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google sign-in popup failed')}
                  text={isLogin ? 'signin_with' : 'signup_with'}
                  theme="outline"
                  size="large"
                  width="320"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg font-medium transition-colors border border-slate-200 flex items-center justify-center gap-2"
              >
                <span className="text-base leading-none">G</span>
                {isLogin ? 'Continue with Google' : 'Sign up with Google'}
              </button>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-400 text-sm">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
