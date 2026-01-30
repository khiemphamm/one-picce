import React from 'react';
import type { Proxy } from '../types';

interface ProxyTableProps {
  proxies: Proxy[];
}

export const ProxyTable: React.FC<ProxyTableProps> = ({ proxies }) => {
  const getStatusBadge = (status: Proxy['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Active
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <span className="text-sm">⚠️</span>
            Failed
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            Pending
          </span>
        );
    }
  };

  const extractIP = (proxyUrl: string): string => {
    try {
      // Remove protocol
      const withoutProtocol = proxyUrl.replace(/^(https?|socks5?):\/\//, '');
      // Remove auth if present (user:pass@)
      const withoutAuth = withoutProtocol.replace(/^[^@]+@/, '');
      // Extract IP:port
      return withoutAuth;
    } catch {
      return proxyUrl;
    }
  };

  const getUtilization = (proxy: Proxy): string => {
    const percentage = (proxy.current_viewers / proxy.max_viewers_per_proxy) * 100;
    return `${proxy.current_viewers}/${proxy.max_viewers_per_proxy} (${percentage.toFixed(0)}%)`;
  };

  if (proxies.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🌐</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Proxies Available</h3>
          <p className="text-sm text-gray-500">Add proxies to start managing viewer connections</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-lg">🌐</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Proxy Status</h3>
          <span className="ml-auto text-sm text-gray-500">{proxies.length} total</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proxy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Success Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {proxies.map((proxy) => (
              <tr key={proxy.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-gray-900">{extractIP(proxy.proxy_url)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600 uppercase">{proxy.type}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(proxy.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 max-w-[100px]">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{
                            width: `${(proxy.current_viewers / proxy.max_viewers_per_proxy) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-600">{getUtilization(proxy)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {proxy.success_count + proxy.fail_count > 0
                      ? `${((proxy.success_count / (proxy.success_count + proxy.fail_count)) * 100).toFixed(1)}%`
                      : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {proxy.success_count}✓ / {proxy.fail_count}✗
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
