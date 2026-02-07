
export interface Episode {
  id: string;
  number: number;
  title: string;
  description: string;
  sourceUrl: string; // URL or Local Path string
  duration: string;
  isCompleted: boolean;
  thumbnail?: string; // Optional thumbnail for tooltips
}

export interface Series {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  episodes: Episode[];
  lastWatchedEpisodeId?: string;
  createdAt: number;
}

export type ViewState = 'dashboard' | 'series-detail' | 'add-series';
