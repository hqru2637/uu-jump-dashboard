'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/hono';
import { createClient } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Loader2 } from 'lucide-react';

// Types (inferred from API response usually, but defining here for state)
type RankingItem = {
  id: number;
  displayName: string;
  mapName: string;
  clearTime: number;
  jumpCount: number;
  createdAt: string;
};

type HistoryItem = RankingItem;

type AnalyticsData = {
  totalPlays: number;
  graphData: { hour: string; count: number; fullDate: string }[];
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'ranking' | 'history' | 'analytics'>('ranking');
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const rRes = await client.api.stats.ranking.$get();
      const hRes = await client.api.stats.history.$get();
      const aRes = await client.api.stats.analytics.$get();

      if (rRes.ok) setRanking(await rRes.json());
      if (hRes.ok) setHistory(await hRes.json());
      if (aRes.ok) setAnalytics(await aRes.json());
    } catch (e) {
      console.error('Failed to fetch data', e);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch only specific parts if needed, but for simplicity re-fetch all on update
  const revalidate = async () => {
     // Silent update
     const rRes = await client.api.stats.ranking.$get();
     const hRes = await client.api.stats.history.$get();
     const aRes = await client.api.stats.analytics.$get();

     if (rRes.ok) setRanking(await rRes.json());
     if (hRes.ok) setHistory(await hRes.json());
     if (aRes.ok) setAnalytics(await aRes.json());
  };

  useEffect(() => {
    fetchData();

    const supabase = createClient();
    const channel = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'results',
        },
        (payload) => {
          console.log('New result received!', payload);
          revalidate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Game Dashboard</h1>
      
      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        {(['ranking', 'history', 'analytics'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 font-medium ${
              activeTab === tab
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading && <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>}

      {!loading && activeTab === 'ranking' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Map</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clear Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumps</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ranking.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.displayName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.mapName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.clearTime.toFixed(2)}s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.jumpCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && activeTab === 'history' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Map</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clear Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumps</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.displayName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.mapName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.clearTime.toFixed(2)}s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.jumpCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Plays</h3>
            <p className="text-3xl font-bold text-indigo-600">{analytics.totalPlays}</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hourly Activity (Last 24h)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.graphData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
