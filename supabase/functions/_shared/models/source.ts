import { ISourceOptionsGithub } from "./sources/github.ts";
import { ISourceOptionsGoogleNews } from "./sources/googlenews.ts";
import { ISourceOptionsStackOverflow } from "./sources/stackoverflow.ts";

export type TSourceType =
  | "github"
  | "googlenews"
  | "mastodon"
  | "medium"
  | "nitter"
  | "podcast"
  | "reddit"
  | "rss"
  | "stackoverflow"
  | "tumblr"
  | "x"
  | "youtube"
  | "none";

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
  rss?: string;
  youtube?: string;
  mastodon?: string;
  medium?: string;
  nitter?: string;
  reddit?: string;
  podcast?: string;
  github?: ISourceOptionsGithub;
  googlenews?: ISourceOptionsGoogleNews;
  tumblr?: string;
  x?: string;
  stackoverflow?: ISourceOptionsStackOverflow;
}
