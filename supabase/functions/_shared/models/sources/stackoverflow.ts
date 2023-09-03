export type TSourceStackOverflowType = "url" | "tag";

export type TSourceStackOverflowSort =
  | "newest"
  | "active"
  | "featured"
  | "votes";

export interface ISourceOptionsStackOverflow {
  type?: TSourceStackOverflowType;
  url?: string;
  tag?: string;
  sort?: TSourceStackOverflowSort;
}
