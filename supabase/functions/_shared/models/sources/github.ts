export type TSourceGithubType =
  | "notifications"
  | "repositorynotifications"
  | "searchissuesandpullrequests"
  | "useractivities"
  | "repositoryactivities"
  | "organizationactivitiespublic"
  | "organizationactivitiesprivate";

export interface ISourceOptionsGithub {
  type?: TSourceGithubType;
  participating?: boolean;
  repository?: string;
  user?: string;
  organization?: string;
  queryName?: string;
  query?: string;
}
