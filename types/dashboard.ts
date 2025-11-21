export type RankingItem = {
  id: number;
  displayName: string;
  mapName: string;
  clearTime: number;
  jumpCount: number;
  createdAt: string;
};

export type HistoryItem = RankingItem;

export type AnalyticsData = {
  totalPlays: number;
  graphData: { hour: string; count: number; fullDate: string }[];
};
