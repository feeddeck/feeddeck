import * as cheerio from 'cheerio';

import { fetchWithTimeout } from '../../utils/fetchWithTimeout.ts';

export interface Favicon {
  url: string;
  size: number;
  extension: 'ico' | 'png' | 'gif' | 'jpg' | 'jpeg' | 'svg';
}

const rels = [
  'shortcut icon',
  'icon shortcut',
  'icon',
  'apple-touch-icon',
  'apple-touch-icon-precomposed',
];

/**
 * `getFavicon` takes a `url` and returns a `Favicon` if the url returns a
 * favicon icon for the provided url. If we are not able to get a valid favicon,
 * we return `undefined`.
 *
 * See: https://github.com/andresmarpz/favicons
 */
export async function getFavicon(
  url: string,
  filter?: (favicons: Favicon[]) => Favicon[],
): Promise<Favicon | undefined> {
  try {
    url = processURL(url, true);
    if (isRelativeURL(url)) {
      return undefined;
    }

    /**
     * Get the html content from the provided `url` and extrace all favicons
     * from it.
     */
    const response = await fetchWithTimeout(url, { method: 'get' }, 3000);
    if (!response || !response.ok) {
      return undefined;
    }
    const html = await response.text();
    const hrefs = extractFavicons(html);

    /**
     * Based on the returned hrefs we try to get all the icons. The returned
     * icons are then sorted by their size so that we always use the icon with
     * the best quality.
     */
    const favicons = await getFaviconsFrom(hrefs, url);
    favicons.sort((a, b) => b.size - a.size);

    /**
     * If a `filter` was provided the icons are filtered based on this `filter`
     * before an icon is returned.
     */
    if (filter) {
      const customFilteredFavicons = filter(favicons);
      if (customFilteredFavicons.length === 0) {
        return undefined;
      }
      return customFilteredFavicons[0];
    }

    return favicons[0];
  } catch (_) {
    return undefined;
  }
}

/**
 * `extractFavicons` extracts all icons from the provided `html` string via
 * `cheerio`. It returns a list of links to all the favicons.
 */
const extractFavicons = (html: string): string[] => {
  const $ = cheerio.load(html);
  const hrefs = rels
    .map((rel) => {
      return $(`link[rel="${rel}"]`)
        .map((_, el) => $(el).attr('href'))
        .get();
    })
    .flat();

  return hrefs;
};

/**
 * `getFaviconsFrom` takes a list of links (`hrefs`) and returns a list of
 * `Favicon`s. The `url` parameter is required to create an absolute url from
 * relative urls in the `hrefs` array. The list of `hrefs` is filtered based on
 * our defined paths before they are processed.
 */
const getFaviconsFrom = async (
  hrefs: string[],
  url?: string,
): Promise<Favicon[]> => {
  const favicons = await Promise.all([
    ...hrefs
      .filter((href) => (isRelativeURL(href) && !url ? false : true))
      .map((href) =>
        getFaviconFrom(
          processURL(isRelativeURL(href) ? url + href : href, false),
        )
      ),
  ]);
  return favicons.filter((x): x is Favicon => x !== undefined).filter((
    favicon,
  ) =>
    favicon.extension === 'png' || favicon.extension === 'jpg' ||
    favicon.extension === 'jpeg' || favicon.extension === 'gif'
  );
};

/**
 * `getFaviconFrom` takes a `url` and returns a `Favicon` if the url returns a
 * valid icon. A url is considered as valid if the returned response code is ok
 * and if the content type is an image.
 */
const getFaviconFrom = async (url: string): Promise<Favicon | undefined> => {
  const response = await fetchWithTimeout(url, { method: 'get' }, 1000);
  if (!response || !response.ok) return undefined;

  const contentType = response.headers.get('content-type') ?? '';
  if (!response.ok || !contentType || !contentType.startsWith('image/')) {
    return undefined;
  }

  const size = (await response.blob()).size;
  const extension = url.split('.').pop() as Favicon['extension'];

  return { url, size, extension } as Favicon;
};

/**
 * `processURL` takes a url and returns a url that is guaranteed to be absolute
 * and without any query parameters when the `removeParams` parameter is set to
 * `true`.
 */
const processURL = (url: string, removeParams: boolean): string => {
  if (isRelativeURL(url)) return url;
  if (url.startsWith('//')) url = 'https:' + url;
  if (!url.startsWith('http')) url = 'https://' + url;
  const parsed = new URL(url);
  return removeParams ? parsed.origin : parsed.toString();
};

/**
 * `processURL` checks if the provided `url` is a relative url. If this is the
 * case the function returns `true`, if the url is absolute it returns `false`.
 */
const isRelativeURL = (url: string): boolean => {
  return url.startsWith('/') && !url.startsWith('//') &&
    !url.startsWith('http');
};
