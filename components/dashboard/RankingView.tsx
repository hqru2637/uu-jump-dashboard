'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { RankingItem } from '@/types/dashboard';

type Props = {
  ranking: Record<string, RankingItem[]>;
};

function RankingCard({ mapName, items }: { mapName: string; items: RankingItem[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_DISPLAY_COUNT = 8;

  const displayedItems = isExpanded ? items : items.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMore = items.length > INITIAL_DISPLAY_COUNT;

  return (
    <div className="w-full md:w-auto md:min-w-[450px] flex-1 bg-white/80 shadow-lg rounded-xl overflow-hidden border border-gray-100 flex flex-col h-fit">
      <div className="bg-gray-100/90 px-4 py-3 md:px-8 md:py-3 border-b border-gray-200 text-center">
        <h3 className="text-lg md:text-xl font-bold text-gray-800">{mapName}</h3>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50/90">
          <tr>
            <th className="px-3 py-3 md:px-6 md:py-4 text-center text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider">順位</th>
            <th className="px-3 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider">クリアタイム</th>
            <th className="px-3 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider">合計ジャンプ数</th>
          </tr>
        </thead>
        <tbody className="bg-white/80 divide-y divide-gray-200">
          {displayedItems.map((item, index) => (
            <tr 
              key={item.id} 
              className="hover:bg-white/50 transition-colors group relative"
              title={`デバイス: ${item.displayName}\n日時: ${new Date(item.createdAt).toLocaleString()}`}
            >
              <td className="px-3 py-3 md:px-6 whitespace-nowrap text-base md:text-xl font-bold text-gray-900 text-center">{index + 1}</td>
              <td className="px-3 py-3 md:px-6 whitespace-nowrap text-sm md:text-base text-gray-700 text-left">{item.clearTime.toFixed(1)}秒</td>
              <td className="px-3 py-3 md:px-6 whitespace-nowrap text-sm md:text-base text-gray-700 text-left">{item.jumpCount}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={3} className="px-6 py-10 text-center text-base text-gray-500">No records yet</td>
            </tr>
          )}
        </tbody>
      </table>
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-3 bg-gray-50/80 hover:bg-gray-100/80 border-t border-gray-200 text-gray-600 font-medium flex items-center justify-center transition-colors text-sm md:text-base"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 md:w-5 md:h-5" />
          ) : (
            <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </button>
      )}
    </div>
  );
}

export function RankingView({ ranking }: Props) {
  if (Object.keys(ranking).length === 0) {
    return <div className="w-full text-center py-10 text-gray-500">No ranking data available</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 md:overflow-x-auto items-start pb-6 px-1">
      {Object.entries(ranking)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([mapName, items]) => (
          <RankingCard key={mapName} mapName={mapName} items={items} />
        ))}
    </div>
  );
}
