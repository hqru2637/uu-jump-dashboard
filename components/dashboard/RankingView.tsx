import { RankingItem } from '@/types/dashboard';

type Props = {
  ranking: Record<string, RankingItem[]>;
};

export function RankingView({ ranking }: Props) {
  if (Object.keys(ranking).length === 0) {
    return <div className="w-full text-center py-10 text-gray-500">No ranking data available</div>;
  }

  return (
    <div className="flex flex-row gap-6 overflow-x-auto pb-4">
      {Object.entries(ranking).map(([mapName, items]) => (
        <div key={mapName} className="min-w-[400px] flex-1 bg-white/80 shadow rounded-lg overflow-hidden">
          <div className="bg-gray-100/80 px-6 py-3 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">{mapName}</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">順位</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">クリアタイム</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">合計ジャンプ数</th>
              </tr>
            </thead>
            <tbody className="bg-white/80 divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.clearTime.toFixed(1)}秒</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.jumpCount}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">No records yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
