import { Feed, parseFeed } from 'rss';

import { utils } from '../../utils/index.ts';
import { feedutils } from './index.ts';
import { ISource } from '../../models/source.ts';

export const getAndParseFeed = async (
  requestUrl: string,
  source: ISource,
  feedData: string | undefined,
  requestOptions?: RequestInit,
): Promise<Feed> => {
  if (feedData) {
    return await _parseFeedData(source, feedData);
  }

  try {
    utils.log('debug', 'Get and parse feed', {
      sourceType: source.type,
      requestUrl: requestUrl,
    });
    const response = await utils.fetchWithTimeout(
      requestUrl,
      requestOptions
        ? {
          ...requestOptions,
          method: 'get',
        }
        : { method: 'get' },
      5000,
    );

    return await _parseFeed(requestUrl, source, response);
  } catch (err) {
    if (err instanceof feedutils.FeedValidationError) {
      throw err;
    } else {
      utils.log('error', 'Failed to get feed', {
        source: source,
        error: err.toString(),
      });
      throw new feedutils.FeedGetAndParseError('Failed to get feed');
    }
  }
};

const _parseFeed = async (
  requestUrl: string,
  source: ISource,
  response: Response,
): Promise<Feed> => {
  const feedData = await response.text();

  try {
    const feed = await parseFeed(feedData);
    return feed;
  } catch (err) {
    utils.log('error', 'Failed to parse feed', {
      source: source,
      requestUrl: requestUrl,
      responseStatus: response.status,
      responseBody: feedData,
      responseHeaders: Object.fromEntries(response.headers.entries()),
      error: err.toString(),
    });
    throw new feedutils.FeedGetAndParseError('Failed to parse feed');
  }
};

const _parseFeedData = async (
  source: ISource,
  feedData: string,
): Promise<Feed> => {
  try {
    const feed = await parseFeed(feedData);
    return feed;
  } catch (err) {
    utils.log('error', 'Failed to parse feed', {
      source: source,
      xml: feedData,
      error: err.toString(),
    });
    throw new feedutils.FeedGetAndParseError('Failed to parse feed');
  }
};
