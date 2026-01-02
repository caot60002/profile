export interface SocialLink {
  id: string;
  platform: 'discord' | 'twitter' | 'instagram' | 'youtube' | 'github' | 'twitch' | 'telegram';
  url: string;
}

export interface Profile {
  username: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  backgroundUrl: string;
  accentColor: string; // Hex code
  links: SocialLink[];
  showBadges: boolean;
  views: number;
  verified: boolean;
  musicUrl?: string; // Optional music
}

export interface ServerConfig {
  binId: string;
  apiKey: string;
}

export enum GenerationTone {
  EDGY = 'edgy',
  AESTHETIC = 'aesthetic',
  MYSTERIOUS = 'mysterious',
  SAD = 'sad',
  HYPE = 'hype'
}
