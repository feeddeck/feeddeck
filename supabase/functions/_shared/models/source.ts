import { ISourceOptionsGithub } from './sources/github.ts';
import { ISourceOptionsGoogleNews } from './sources/googlenews.ts';
import { ISourceOptionsStackOverflow } from './sources/stackoverflow.ts';

export type TSourceType =
  | 'github'
  | 'googlenews'
  | 'mastodon'
  | 'medium'
  | 'nitter'
  | 'pinterest'
  | 'podcast'
  | 'reddit'
  | 'rss'
  | 'stackoverflow'
  | 'tumblr'
  | 'x'
  | 'youtube'
  | 'none';

export interface ISource {
  id: string;
  columnId: string;
  userId: string;
  type: TSourceType;
  title: string;
  options?: ISourceOptions;
  link?: string;
  icon?: string;
  updatedAt?: number;
}

export interface ISourceOptions {
  github?: ISourceOptionsGithub;
  googlenews?: ISourceOptionsGoogleNews;
  mastodon?: string;
  medium?: string;
  nitter?: string;
  pinterest?: string;
  podcast?: string;
  reddit?: string;
  rss?: string;
  stackoverflow?: ISourceOptionsStackOverflow;
  tumblr?: string;
  x?: string;
  youtube?: string;
}
