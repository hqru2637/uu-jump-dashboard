import { RankingItem } from '@/types/dashboard';

type Props = {
  ranking: Record<string, RankingItem[]>;
};

export function RankingView({ ranking }: Props) {
  if (Object.keys(ranking).length === 0) {
    return <div className="w-full text-center py-10 text-gray-500">No ranking data available</div>;
  }

  return (
    <div className="flex flex-row gap-4 overflow-x-auto pb-6">
      {Object.entries(ranking).map(([mapName, items]) => (
        <div key={mapName} className="min-w-[400px] flex-1 bg-white/80 shadow-lg rounded-xl overflow-hidden border border-gray-100">
          <div className="bg-gray-100/90 px-8 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">{mapName}</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/90">
              <tr>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">順位</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">クリアタイム</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">合計ジャンプ数</th>
              </tr>
            </thead>
            <tbody className="bg-white/80 divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={item.id} className="hover:bg-white/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900 text-center">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">{item.clearTime.toFixed(1)}秒</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">{item.jumpCount}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-base text-gray-500">No records yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
