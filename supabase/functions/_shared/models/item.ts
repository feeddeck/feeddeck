export interface IItem {
  id: string;
  userId: string;
  columnId: string;
  sourceId: string;
  title: string;
  link: string;
  media?: string;
  description?: string;
  author?: string;
  // deno-lint-ignore no-explicit-any
  options?: Record<string, any>;
  publishedAt: number;
  isRead?: boolean;
  isBookmarked?: boolean;
}
