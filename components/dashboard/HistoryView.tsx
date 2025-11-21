'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { HistoryItem } from '@/types/dashboard';

type Props = {
  history: HistoryItem[];
};

type SortConfig = {
  key: keyof HistoryItem;
  direction: 'asc' | 'desc';
};

export function HistoryView({ history }: Props) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });

  const sortedHistory = useMemo(() => {
    const sorted = [...history];
    sorted.sort((a, b) => {
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
    return sorted;
  }, [history, sortConfig]);

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

  const columns: { key: keyof HistoryItem; label: string }[] = [
    { key: 'id', label: 'ID' },
    { key: 'displayName', label: 'Player' },
    { key: 'mapName', label: 'Map' },
    { key: 'clearTime', label: 'Clear Time' },
    { key: 'jumpCount', label: 'Jumps' },
    { key: 'createdAt', label: 'Date' },
  ];

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => requestSort(col.key)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group select-none"
              >
                <div className="flex items-center">
                  {col.label}
                  {getSortIcon(col.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedHistory.map((item) => (
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
  );
}
