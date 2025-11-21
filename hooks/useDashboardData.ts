import { useState, useEffect, useCallback } from 'react';
import { client } from '@/lib/hono';
import { RankingItem, HistoryItem, AnalyticsData } from '@/types/dashboard';

export function useDashboardData() {
  const [ranking, setRanking] = useState<Record<string, RankingItem[]>>({});
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    try {
      const [rRes, hRes, aRes] = await Promise.all([
        client.api.stats.ranking.$get(),
        client.api.stats.history.$get(),
        client.api.stats.analytics.$get(),
      ]);

      if (rRes.ok) setRanking(await rRes.json());
      if (hRes.ok) setHistory(await hRes.json());
      if (aRes.ok) setAnalytics(await aRes.json());
    } catch (e) {
      console.error('Failed to fetch data', e);
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchData]);

  return {
    ranking,
    history,
    analytics,
    loading,
    refresh: () => fetchData(false),
  };
}
