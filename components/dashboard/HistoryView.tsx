'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, X } from 'lucide-react';
import { HistoryItem } from '@/types/dashboard';

type Props = {
  history: HistoryItem[];
};

type SortConfig = {
  key: keyof HistoryItem;
  direction: 'asc' | 'desc';
};

const COLUMNS: { key: keyof HistoryItem; label: string }[] = [
  // { key: 'id', label: 'ID' },
  { key: 'displayName', label: 'デバイス' },
  { key: 'mapName', label: 'マップ' },
  { key: 'clearTime', label: 'タイム' },
  { key: 'jumpCount', label: 'ジャンプ数' },
  { key: 'createdAt', label: '日時' },
];

export function HistoryView({ history }: Props) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });
  const [filterDevice, setFilterDevice] = useState<string>('');
  const [filterMap, setFilterMap] = useState<string>('');

  const uniqueDevices = useMemo(() => {
    const counts = history.reduce((acc, item) => {
      acc[item.displayName] = (acc[item.displayName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(counts).sort().map(device => ({
      value: device,
      label: `${device} (${counts[device]})`
    }));
  }, [history]);

  const uniqueMaps = useMemo(() => {
    const counts = history.reduce((acc, item) => {
      acc[item.mapName] = (acc[item.mapName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(counts).sort().map(mapName => ({
      value: mapName,
      label: `${mapName} (${counts[mapName]})`
    }));
  }, [history]);

  const filteredAndSortedHistory = useMemo(() => {
    let result = [...history];

    if (filterDevice) {
      result = result.filter(item => item.displayName === filterDevice);
    }
    if (filterMap) {
      result = result.filter(item => item.mapName === filterMap);
    }

    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return result;
  }, [history, sortConfig, filterDevice, filterMap]);

  const requestSort = (key: keyof HistoryItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof HistoryItem) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400 opacity-0 group-hover:opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-4 h-4 ml-1 text-gray-600" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 text-gray-600" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/80 p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Filter className="w-6 h-6 md:w-4 md:h-4" />
          <span className="text-sm font-medium hidden md:inline">絞り込み:</span>
        </div>
        
        <select
          value={filterMap}
          onChange={(e) => setFilterMap(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="">全てのマップ</option>
          {uniqueMaps.map(map => (
            <option key={map.value} value={map.value}>{map.label}</option>
          ))}
        </select>

        <select
          value={filterDevice}
          onChange={(e) => setFilterDevice(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="">全てのデバイス</option>
          {uniqueDevices.map(device => (
            <option key={device.value} value={device.value}>{device.label}</option>
          ))}
        </select>

        {(filterDevice || filterMap) && (
          <button
            onClick={() => { setFilterDevice(''); setFilterMap(''); }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 ml-auto md:ml-0 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            <X className="w-3 h-3" />
            リセット
          </button>
        )}
      </div>

      <div className="bg-white/80 shadow-lg rounded-xl overflow-hidden border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/90">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => requestSort(col.key)}
                  className="px-4 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100/80 group select-none transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-nowrap">{col.label}</span>
                    {getSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white/80 divide-y divide-gray-200">
            {filteredAndSortedHistory.map((item) => (
              <tr key={item.id} className="hover:bg-white/50 transition-colors">
                {/* <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">{item.id}</td> */}
                <td className="px-4 py-3 whitespace-nowrap text-base font-medium text-gray-900">{item.displayName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-base text-gray-700">{item.mapName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-base text-gray-700">{item.clearTime.toFixed(1)}秒</td>
                <td className="px-4 py-3 whitespace-nowrap text-base text-gray-700">{item.jumpCount}</td>
                <td className="px-4 py-3 whitespace-nowrap text-base text-gray-500">{new Date(item.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {filteredAndSortedHistory.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-6 py-10 text-center text-gray-500">
                  該当するデータがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
