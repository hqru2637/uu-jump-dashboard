'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { RankingView } from '@/components/dashboard/RankingView';
import { HistoryView } from '@/components/dashboard/HistoryView';
import { AnalyticsView } from '@/components/dashboard/AnalyticsView';

type Tab = 'ランキング' | 'プレイ履歴' | '統計';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('ランキング');
  const { ranking, history, analytics, loading } = useDashboardData();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">UU-JUMP Dashboard</h1>
      
      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        {(['ランキング', 'プレイ履歴', '統計'] as const).map((tab: Tab) => (
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

      {!loading && activeTab === 'ランキング' && <RankingView ranking={ranking} />}
      {!loading && activeTab === 'プレイ履歴' && <HistoryView history={history} />}
      {!loading && activeTab === '統計' && <AnalyticsView analytics={analytics} />}
    </div>
  );
}
