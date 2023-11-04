export type TSourceGoogleNewsType = 'url' | 'search';

export interface ISourceOptionsGoogleNews {
  type?: TSourceGoogleNewsType;
  url?: string;
  search?: string;
  ceid?: string;
  gl?: string;
  hl?: string;
}
