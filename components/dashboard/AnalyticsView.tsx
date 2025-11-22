import { AnalyticsData } from '@/types/dashboard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Props = {
  analytics: AnalyticsData | null;
};

export function AnalyticsView({ analytics }: Props) {
  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white/80 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900">Total Plays</h3>
        <p className="text-3xl font-bold text-indigo-600">{analytics.totalPlays}</p>
      </div>

      <div className="bg-white/80 shadow rounded-lg p-6">
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
  );
}
