import React, { useState, useEffect } from 'react';
import type { Proxy, ProxyStats, IPCResponse } from '../types';

const ProxyManager: React.FC = () => {
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [proxyStats, setProxyStats] = useState<ProxyStats | null>(null);
  const [newProxies, setNewProxies] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProxies, setIsLoadingProxies] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load proxies on mount
  useEffect(() => {
    loadProxies();
  }, []);

  const loadProxies = async () => {
    if (!window.electron) return;
    
    setIsLoadingProxies(true);
    try {
      const result: IPCResponse<{ proxies: Proxy[]; stats: ProxyStats }> = await window.electron.getProxies();
      if (result.success && result.data) {
        setProxies(result.data.proxies);
        setProxyStats(result.data.stats);
      }
    } catch (error) {
      console.error('Failed to load proxies:', error);
    } finally {
      setIsLoadingProxies(false);
    }
  };

  const handleAddProxies = async () => {
    if (!newProxies.trim()) {
      showMessage('error', 'Please enter at least one proxy');
      return;
    }

    setIsLoading(true);
    try {
      const proxyList = newProxies
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const result = await window.electron.addProxies(proxyList);
      
      if (result.success) {
        showMessage('success', `Added ${proxyList.length} proxies successfully!`);
        setNewProxies('');
        await loadProxies();
      } else {
        showMessage('error', result.error || 'Failed to add proxies');
      }
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveProxy = async (proxyId: number) => {
    if (!confirm('Are you sure you want to remove this proxy?')) return;

    try {
      const result = await window.electron.removeProxy(proxyId);
      
      if (result.success) {
        showMessage('success', 'Proxy removed successfully');
        await loadProxies();
      } else {
        showMessage('error', result.error || 'Failed to remove proxy');
      }
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-600 border-green-200';
      case 'failed': return 'bg-red-50 text-red-600 border-red-200';
      case 'pending': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoadingProxies ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-600">Loading proxies...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching proxy list</p>
        </div>
      ) : (
        <>
          {/* Stats Overview với Modern Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Proxies</h3>
                <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🌐</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-600 group-hover:scale-105 transition-transform">{proxyStats?.total ?? 0}</p>
            </div>
            <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Active</h3>
                <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">
                  <span className="text-lg">✅</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600 group-hover:scale-105 transition-transform">{proxyStats?.active ?? 0}</p>
            </div>
            <div className="group bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200 hover:border-red-300 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Failed</h3>
                <div className="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center">
                  <span className="text-lg">❌</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600 group-hover:scale-105 transition-transform">{proxyStats?.failed ?? 0}</p>
        </div>
        <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Capacity</h3>
            <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-600 group-hover:scale-105 transition-transform">
            {proxyStats?.availableCapacity ?? 0}
          </p>
        </div>
      </div>

      {/* Add Proxies Section với Modern Design */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-lg">➕</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Add Proxies</h2>
        </div>
        
        {message && (
          <div className={`mb-4 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <span className="text-xl">{message.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📋 Proxy List <span className="text-gray-500">(one per line)</span>
            </label>
            <textarea
              value={newProxies}
              onChange={(e) => setNewProxies(e.target.value)}
              placeholder="http://proxy1.com:8080&#10;socks5://user:pass@proxy2.com:1080&#10;http://123.45.67.89:3128"
              rows={8}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono text-sm placeholder:text-gray-400 transition-all text-gray-900"
            />
            <div className="mt-2 flex items-start gap-2 text-xs text-gray-600">
              <span>💡</span>
              <span>Supported: http://host:port, https://host:port, socks5://host:port, or with auth: protocol://user:pass@host:port</span>
            </div>
          </div>
          
          <button 
            onClick={handleAddProxies}
            disabled={isLoading || !newProxies.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Adding Proxies...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                ➕ Add Proxies
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Proxy List với Modern Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-lg">📋</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Proxy List</h2>
              <p className="text-xs text-gray-500">{proxies.length} total proxies</p>
            </div>
          </div>
          <button 
            onClick={loadProxies}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-all hover:scale-105 active:scale-95"
          >
            <span>🔄</span>
            <span className="text-sm font-medium text-gray-700">Refresh</span>
          </button>
        </div>

        {proxies.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">🌐</span>
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-2">No proxies yet</p>
            <p className="text-sm text-gray-500 mb-6">Add proxies above to get started</p>
            <div className="inline-flex items-center gap-2 text-xs text-gray-600">
              <span>💡</span>
              <span>Tip: You need proxies to run viewer sessions</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Proxy URL</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Usage</th>
                  <th className="px-6 py-4 font-semibold">Performance</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {proxies.map((proxy) => (
                  <tr key={proxy.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-500">#{proxy.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-700 group-hover:text-blue-600 transition-colors">
                        {proxy.proxy_url.length > 40 ? proxy.proxy_url.substring(0, 40) + '...' : proxy.proxy_url}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                        {proxy.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusBadge(proxy.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          proxy.status === 'active' ? 'bg-green-500 animate-pulse' :
                          proxy.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></span>
                        {proxy.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[100px]">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                proxy.current_viewers >= proxy.max_viewers_per_proxy ? 'bg-red-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${(proxy.current_viewers / proxy.max_viewers_per_proxy) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className={`text-sm font-mono ${
                          proxy.current_viewers >= proxy.max_viewers_per_proxy ? 'text-red-600' : 'text-gray-700'
                        }`}>
                          {proxy.current_viewers}/{proxy.max_viewers_per_proxy}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-mono">
                        <span className="text-green-600 flex items-center gap-1">
                          <span className="text-xs">✓</span>
                          {proxy.success_count}
                        </span>
                        <span className="text-gray-400">/</span>
                        <span className="text-red-600 flex items-center gap-1">
                          <span className="text-xs">✗</span>
                          {proxy.fail_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleRemoveProxy(proxy.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 transition-all hover:scale-105 active:scale-95"
                      >
                        🗑️ Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};

export default ProxyManager;
