import { getFavicon } from './getFavicon.ts';
import { uploadSourceIcon } from './uploadFile.ts';
import { getAndParseFeed } from './getAndParseFeed.ts';
import { assertEqualsItems, assertEqualsSource } from './test.ts';
import { FeedGetAndParseError, FeedValidationError } from './errors.ts';

export type { Favicon } from './getFavicon.ts';

export const feedutils = {
  getFavicon,
  uploadSourceIcon,
  assertEqualsItems,
  assertEqualsSource,
  getAndParseFeed,
  FeedValidationError,
  FeedGetAndParseError,
};
