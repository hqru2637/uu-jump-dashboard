'use client';

import { useState } from 'react';
import Image from 'next/image';
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
    <div className="container mx-auto p-2 md:p-6 max-w-8xl">
      <div className="flex justify-between items-center m-4 md:m-5">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900">UU-JUMP Dashboard</h1>
        <div className="hidden md:block">
          <span className="text-sm text-gray-500 mb-2 block text-center">スマホでアクセス</span>
          <Image 
            src="/site_qr.png" 
            alt="Site QR" 
            width={100} 
            height={100} 
            className="rounded-lg shadow-sm border border-gray-200"
          />
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex space-x-4 md:space-x-6 mb-6 md:mb-8 border-b border-gray-300 overflow-x-auto">
        {(['ランキング', 'プレイ履歴', '統計'] as const).map((tab: Tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 md:py-3 md:px-6 text-base md:text-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'border-b-4 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-800 hover:border-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading && <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>}

      <div key={activeTab} className="animate-fade-in-up">
        {!loading && activeTab === 'ランキング' && <RankingView ranking={ranking} />}
        {!loading && activeTab === 'プレイ履歴' && <HistoryView history={history} />}
        {!loading && activeTab === '統計' && <AnalyticsView analytics={analytics} />}
      </div>
    </div>
  );
}
