export type TwitchVod = {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string;
  view_count: number;
  duration: string;
  created_at: string;
  description: string;
};

export type TwitchClip = {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string;
  view_count: number;
  created_at: string;
  duration: number;
  creator_name: string;
};
