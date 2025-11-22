export type RankingItem = {
  id: number;
  displayName: string;
  mapName: string;
  clearTime: number;
  jumpCount: number;
  createdAt: string;
};

export type HistoryItem = RankingItem;

export type HistogramData = {
  range: string;
  count: number;
  min: number;
};

export type MapHistogram = {
  mapName: string;
  data: HistogramData[];
};

export type AnalyticsData = {
  totalPlays: number;
  recentActivity: { time: string; count: number; fullDate: string }[];
  activityTrend: { time: string; count: number; fullDate: string }[];
  histograms: MapHistogram[];
};
