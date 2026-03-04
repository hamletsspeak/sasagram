export interface Vod {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string;
  view_count: number;
  duration: string;
  created_at: string;
}

export interface Clip {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string;
  view_count: number;
  created_at: string;
  duration?: number;
}

export interface TwitchData {
  user: {
    id: string;
    display_name: string;
  };
  vods: Vod[];
  clips?: Clip[];
}
