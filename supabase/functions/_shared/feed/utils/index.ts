import { getFavicon } from './getFavicon.ts';
import { uploadSourceIcon } from './uploadFile.ts';
import { assertEqualsItems, assertEqualsSource } from './test.ts';

export type { Favicon } from './getFavicon.ts';

export const feedutils = {
  getFavicon,
  uploadSourceIcon,
  assertEqualsItems,
  assertEqualsSource,
};
