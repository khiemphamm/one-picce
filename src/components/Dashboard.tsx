import React, { useState, useEffect } from 'react';
import type { StatsUpdate } from '../types';

interface DashboardProps {
  onStatsUpdate?: (stats: StatsUpdate) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStatsUpdate }) => {
  const [livestreamUrl, setLivestreamUrl] = useState('');
  const [viewerCount, setViewerCount] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<StatsUpdate['session'] | null>(null);
  const [proxyStats, setProxyStats] = useState<StatsUpdate['proxies'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Listen for stats updates from main process
  useEffect(() => {
    if (window.electron && !hasLoaded) {
      window.electron.onStatsUpdate((update: StatsUpdate) => {
        setStats(update.session);
        setProxyStats(update.proxies);
        setIsRunning(update.session.isRunning);
        setIsLoadingStats(false);
        setHasLoaded(true);
        
        if (onStatsUpdate) {
          onStatsUpdate(update);
        }
      });

      // Request initial stats after a short delay
      const timer = setTimeout(() => {
        setIsLoadingStats(false);
        setHasLoaded(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartSession = async () => {
    if (!livestreamUrl.trim()) {
      setError('Please enter a livestream URL');
      return;
    }

    try {
      setError(null);
      const result = await window.electron.startSession(livestreamUrl, viewerCount);
      
      if (!result.success) {
        setError(result.error || 'Failed to start session');
      } else {
        setIsRunning(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleStopSession = async () => {
    try {
      setError(null);
      const result = await window.electron.stopSession();
      
      if (!result.success) {
        setError(result.error || 'Failed to stop session');
      } else {
        setIsRunning(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleForceStop = async () => {
    try {
      setError(null);
      const result = await window.electron.forceStopSession();
      
      if (!result.success) {
        setError(result.error || 'Failed to force stop');
      } else {
        setIsRunning(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoadingStats ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-600">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching latest stats</p>
        </div>
      ) : (
        <>
          {/* Stats Overview với Modern Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-sm rounded-2xl p-6 border border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-xl hover:shadow-green-200/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Viewers</h3>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">👥</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-green-600 group-hover:scale-105 transition-transform">
                {stats?.activeViewers ?? 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Currently watching</p>
            </div>
            
            <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-sm rounded-2xl p-6 border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Sessions</h3>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-blue-600 group-hover:scale-105 transition-transform">
                {stats?.totalViewers ?? 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">All time viewers</p>
        </div>
        
        <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-sm rounded-2xl p-6 border border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl hover:shadow-purple-200/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Proxies</h3>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">🌐</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-purple-600 group-hover:scale-105 transition-transform">
            {proxyStats?.active ?? 0} <span className="text-2xl text-gray-400">/ {proxyStats?.total ?? 0}</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">Active connections</p>
        </div>
      </div>

      {/* Quick Start với Modern Design */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-lg">🚀</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Quick Start</h3>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-shake">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                🔗
              </div>
              <input
                type="text"
                placeholder="https://youtube.com/watch?v=..."
                value={livestreamUrl}
                onChange={(e) => setLivestreamUrl(e.target.value)}
                disabled={isRunning}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:bg-gray-100 transition-all placeholder:text-gray-400 text-gray-900"
              />
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                👥
              </div>
              <input
                type="number"
                min="1"
                max="30"
                value={viewerCount}
                onChange={(e) => setViewerCount(parseInt(e.target.value) || 10)}
                disabled={isRunning}
                className="w-24 bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-center focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:bg-gray-100 transition-all text-gray-900"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleStartSession}
              disabled={isRunning}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isRunning ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Session Running...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  ▶️ Start Session
                </span>
              )}
            </button>
            <button 
              onClick={handleStopSession}
              disabled={!isRunning}
              className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 hover:scale-[1.02] active:scale-[0.98]"
            >
              ⏹️ Stop
            </button>
            <button 
              onClick={handleForceStop}
              disabled={!isRunning}
              className="px-4 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 hover:text-orange-700 text-sm"
              title="Force stop if normal stop fails"
            >
              ⚠️
            </button>
          </div>
        </div>
      </div>

      {/* Resource Usage với Modern Progress Bars */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">CPU Usage</h3>
              <span className="text-lg font-bold text-blue-600">{stats.cpuUsage.toFixed(1)}%</span>
            </div>
            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.cpuUsage > 80 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                  stats.cpuUsage > 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}
                style={{ width: `${Math.min(stats.cpuUsage, 100)}%` }}
              >
                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Memory Usage</h3>
              <span className="text-lg font-bold text-purple-600">{stats.memoryUsage.toFixed(1)}%</span>
            </div>
            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.memoryUsage > 80 ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                  stats.memoryUsage > 50 ? 'bg-gradient-to-r from-yellow-500 to-pink-500' :
                  'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}
                style={{ width: `${Math.min(stats.memoryUsage, 100)}%` }}
              >
                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator với Animation */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-gray-200 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`relative w-4 h-4 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-400'}`}>
              {isRunning && (
                <>
                  <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
                  <div className="absolute inset-0 rounded-full bg-green-400 animate-pulse"></div>
                </>
              )}
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900">
                {isRunning ? 'Session Active' : 'Ready to Start'}
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                {isRunning ? 'Viewers are currently watching' : 'Configure settings and start session'}
              </p>
            </div>
          </div>
          {isRunning && stats && (
            <div className="flex items-center gap-4 text-sm">
              <div className="text-right">
                <div className="text-gray-600">Uptime</div>
                <div className="font-mono text-green-600">00:00:00</div>
              </div>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
