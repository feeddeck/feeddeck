import { SupabaseClient } from '@supabase/supabase-js';
import { parseFeed } from 'rss';
import { Md5 } from 'std/md5';
import { FeedEntry } from 'rss/types';
import { Redis } from 'redis';
import { unescape } from 'lodash';

import { IItem } from '../models/item.ts';
import { ISource } from '../models/source.ts';
import { IProfile } from '../models/profile.ts';
import { utils } from '../utils/index.ts';

/**
 * `instances` contains a list of known Lemmy instances. This list is used to
 * determin if a provided url is related to a Lemmy instance or not. The list
 * is based on the list of instances from https://join-lemmy.org/instances.
 */
const instances = [
  'lemmy.world',
  'lemm.ee',
  'programming.dev',
  'sh.itjust.works',
  'hexbear.net',
  'feddit.de',
  'lemmy.ca',
  'beehaw.org',
  'lemmy.dbzer0.com',
  'lemmy.blahaj.zone',
  'discuss.tchncs.de',
  'lemmygrad.ml',
  'sopuli.xyz',
  'aussie.zone',
  'lemmy.one',
  'feddit.nl',
  'feddit.uk',
  'lemmy.zip',
  'midwest.social',
  'infosec.pub',
  'jlai.lu',
  'slrpnk.net',
  'startrek.website',
  'feddit.it',
  'pawb.social',
  'ttrpg.network',
  'lemmings.world',
  'lemmy.eco.br',
  'mander.xyz',
  'lemmy.today',
  'lemdro.id',
  'lemmy.nz',
  'monero.town',
  'feddit.dk',
  'szmer.info',
  'feddit.ch',
  'yiffit.net',
  'iusearchlinux.fyi',
  'lemmus.org',
  'lemmy.whynotdrs.org',
  'ani.social',
  'awful.systems',
  'monyet.cc',
  'feddit.cl',
  'feddit.nu',
  'mujico.org',
  'lemmy.wtf',
  'leminal.space',
  'thelemmy.club',
  'literature.cafe',
  'fanaticus.social',
  'r.nf',
  'dormi.zone',
  'pornlemmy.com',
  'lemmy.cafe',
  'lemmy.studio',
  'lemmy.myserv.one',
  'lemmy.kde.social',
  'bookwormstory.social',
  'sub.wetshaving.social',
  'endlesstalk.org',
  'lemmy.my.id',
  'yall.theatl.social',
  'toast.ooo',
  'links.hackliberty.org',
  'eviltoast.org',
  'futurology.today',
  'dmv.social',
  'lemmy.fmhy.net',
  'eslemmy.es',
  'suppo.fi',
  'lemmy.frozeninferno.xyz',
  'lemmyf.uk',
  'mtgzone.com',
  'linux.community',
  'lemmy.pt',
  'lemmy.radio',
  'feddit.ro',
  'kyberpunk.social',
  'alien.top',
  'sffa.community',
  'lemmy.tf',
  'blendit.bsd.cafe',
  'lemmy.cat',
  'rblind.com',
  'bbs.9tail.net',
  'communick.news',
  'talk.macstack.net',
];

/**
 * `isLemmyUrl` checks if the provided `url` is related to a known Lemmy
 * instance.
 */
export const isLemmyUrl = (url: string): boolean => {
  const parsedUrl = new URL(url);
  return instances.includes(parsedUrl.hostname);
};

export const getLemmyFeed = async (
  _supabaseClient: SupabaseClient,
  _redisClient: Redis | undefined,
  _profile: IProfile,
  source: ISource,
): Promise<{ source: ISource; items: IItem[] }> => {
  if (!source.options?.lemmy) {
    throw new Error('Invalid source options');
  }

  const parsedUrl = new URL(source.options.lemmy);
  if (
    parsedUrl.pathname.startsWith('/feeds/') &&
    parsedUrl.pathname.endsWith('.xml')
  ) {
    source.options.lemmy = `${parsedUrl.origin}${parsedUrl.pathname}?sort=New`;
  } else if (
    parsedUrl.pathname.startsWith('/c/') || parsedUrl.pathname.startsWith('/u/')
  ) {
    source.options.lemmy =
      `${parsedUrl.origin}/feeds${parsedUrl.pathname}.xml?sort=New`;
  } else if (parsedUrl.pathname === '/feeds/all.xml') {
    source.options.lemmy = `${parsedUrl.origin}/feeds/all.xml?sort=New`;
  } else if (parsedUrl.pathname === '' || parsedUrl.pathname === '/') {
    source.options.lemmy = `${parsedUrl.origin}/feeds/all.xml?sort=New`;
  } else {
    throw new Error('Invalid source options');
  }

  /**
   * Get the RSS for the provided `lemmy` url and parse it. If a feed doesn't
   * contains an item we return an error.
   */
  const response = await utils.fetchWithTimeout(source.options.lemmy, {
    method: 'get',
  }, 5000);
  const xml = await response.text();
  utils.log('debug', 'Add source', {
    sourceType: 'lemmy',
    requestUrl: source.options.lemmy,
    responseStatus: response.status,
  });
  const feed = await parseFeed(xml);

  if (!feed.title.value) {
    throw new Error('Invalid feed');
  }

  /**
   * Generate a source id based on the user id, column id and the normalized
   * `lemmy` url. Besides that we also set the source type to `lemmy` and
   * set the title and link for the source.
   */
  if (source.id === '') {
    source.id = generateSourceId(
      source.userId,
      source.columnId,
      source.options.lemmy,
    );
  }
  source.type = 'lemmy';
  source.title = feed.title.value;
  if (feed.links.length > 0) {
    source.link = feed.links[0];
  }

  /**
   * Now that the source does contain all the required information we can start
   * to generate the items for the source, by looping over all the feed entries.
   */
  const items: IItem[] = [];

  for (const [index, entry] of feed.entries.entries()) {
    if (skipEntry(index, entry, source.updatedAt || 0)) {
      continue;
    }

    /**
     * Each item need a unique id which is generated using the `generateItemId`
     * function. The id is a combination of the source id and the id of the
     * entry.
     */
    const itemId = generateItemId(source.id, entry.id);

    /**
     * Create the item object and add it to the `items` array.
     */
    items.push({
      id: itemId,
      userId: source.userId,
      columnId: source.columnId,
      sourceId: source.id,
      title: entry.title!.value!,
      link: entry.id,
      media: getMedia(entry),
      description: getDescription(entry),
      author: entry.author?.name,
      publishedAt: Math.floor(entry.published!.getTime() / 1000),
    });
  }

  return { source, items };
};

/**
 * `skipEntry` is used to determin if an entry should be skipped or not. When a
 * entry in the RSS feed is skipped it will not be added to the database. An
 * entry will be skipped when
 * - it is not within the first 50 entries of the feed, because we only keep the
 *   last 50 items of each source in our delete logic.
 * - the entry does not contain a title, a link or a published date.
 * - the published date of the entry is older than the last update date of the
 *   source minus 10 seconds.
 */
const skipEntry = (
  index: number,
  entry: FeedEntry,
  sourceUpdatedAt: number,
): boolean => {
  if (index === 50) {
    return true;
  }

  if (
    !entry.id || !entry.title?.value ||
    (entry.links.length === 0 || !entry.links[0].href) || !entry.published
  ) {
    return true;
  }

  if (Math.floor(entry.published.getTime() / 1000) <= (sourceUpdatedAt - 10)) {
    return true;
  }

  return false;
};

/**
 * `generateSourceId` generates a unique source id based on the user id, column
 * id and the link of the RSS feed. We use the MD5 algorithm for the link to
 * generate the id.
 */
const generateSourceId = (
  userId: string,
  columnId: string,
  link: string,
): string => {
  return `lemmy-${userId}-${columnId}-${new Md5().update(link).toString()}`;
};

/**
 * `generateItemId` generates a unique item id based on the source id and the
 * identifier of the item. We use the MD5 algorithm for the identifier, which
 * can be the link of the item or the id of the item.
 */
const generateItemId = (sourceId: string, identifier: string): string => {
  return `${sourceId}-${new Md5().update(identifier).toString()}`;
};

/**
 * `getDescription` returns the description for a feed entry. If the entry does
 * not contain a description we return `undefined`.
 */
const getDescription = (entry: FeedEntry): string | undefined => {
  if (entry.description?.value) {
    return unescape(entry.description.value);
  }

  return undefined;
};

/**
 * `getMedia` returns the media for a feed entry. If the link of an entry ends
 * with a image or video extension it is considered as media file. This is not
 * always the case, since the link could also be a link to a website which is
 * then not used as media.
 */
const getMedia = (entry: FeedEntry): string | undefined => {
  if (entry.links && entry.links.length > 0 && entry.links[0].href) {
    const parsedUrl = new URL(entry.links[0].href);
    if (
      /**
       * Images
       */
      parsedUrl.pathname.endsWith('.jpg') ||
      parsedUrl.pathname.endsWith('.jpeg') ||
      parsedUrl.pathname.endsWith('.png') ||
      parsedUrl.pathname.endsWith('.gif') ||
      /**
       * Videos
       */
      parsedUrl.pathname.endsWith('.mp4') ||
      /**
       * YouTube
       */
      entry.links[0].href.startsWith('https://youtu.be/') ||
      entry.links[0].href.startsWith('https://www.youtube.com/watch?') ||
      entry.links[0].href.startsWith('https://m.youtube.com/watch?')
    ) {
      return entry.links[0].href;
    }
  }

  return undefined;
};
