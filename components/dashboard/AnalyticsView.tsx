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
        <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Activity (Last 12h)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.recentActivity} >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{fontSize: 12}} />
              <YAxis allowDecimals={false} tick={{fontSize: 14}} width={20} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Plays" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/80 shadow-lg rounded-xl p-6 md:p-8 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Activity 2 days</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.activityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{fontSize: 12}} />
              <YAxis allowDecimals={false} tick={{fontSize: 14}} width={20} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="count" fill="#3ec73eff" radius={[4, 4, 0, 0]} name="Plays" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Clear Time Distribution per Map */}
      {analytics.histograms && analytics.histograms.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 px-1">Clear Time Distribution</h3>
          <div className="flex flex-col md:flex-row gap-4 md:overflow-x-auto items-start pb-6 px-1">
            {analytics.histograms.map((histogram) => (
              <div key={histogram.mapName} className="w-full md:w-auto md:min-w-[450px] flex-1 bg-white/80 shadow-lg rounded-xl overflow-hidden border border-gray-100 flex flex-col h-fit p-4 md:p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">{histogram.mapName}</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={histogram.data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="range" tick={{fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={60} />
                      <YAxis allowDecimals={false} tick={{fontSize: 12}} width={40} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Clears" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
