import { AnalyticsData } from '@/types/dashboard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Props = {
  analytics: AnalyticsData | null;
};

export function AnalyticsView({ analytics }: Props) {
  if (!analytics) return null;

  return (
    <div className="space-y-8">
      <div className="bg-white/80 shadow-lg rounded-xl p-6 md:p-8 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800">Total Goals</h3>
        <p className="text-5xl font-extrabold text-indigo-600 mt-2">{analytics.totalPlays}</p>
      </div>

      <div className="bg-white/80 shadow-lg rounded-xl p-6 md:p-8 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Hourly Activity (Last 24h)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.graphData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" tick={{fontSize: 14}} />
              <YAxis allowDecimals={false} tick={{fontSize: 14}} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
