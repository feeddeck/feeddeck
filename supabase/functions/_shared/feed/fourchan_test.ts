import { createClient } from '@supabase/supabase-js';
import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from 'std/testing/mock';

import { ISource } from '../models/source.ts';
import { IProfile } from '../models/profile.ts';
import { getFourChanFeed } from './fourchan.ts';
import { utils } from '../utils/index.ts';
import { feedutils } from './utils/index.ts';

const supabaseClient = createClient('http://localhost:54321', 'test123');
const mockProfile: IProfile = {
  id: '',
  tier: 'free',
  createdAt: 0,
  updatedAt: 0,
};
const mockSource: ISource = {
  id: '',
  columnId: 'mycolumn',
  userId: 'myuser',
  type: 'medium',
  title: '',
};

const response = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0">
   <channel>
      <title>/v/ - Video Games</title>
      <link>http://boards.4chan.org/v/./</link>
      <description>Threads on /v/ - Video Games at 4chan.org.</description>
      <atom:link href="http://boards.4chan.org/v/index.rss" rel="self" type="application/rss+xml" />
      <item>
         <title>Will the Cyberpunk sequel manage to get to the level of hype...</title>
         <link>http://boards.4chan.org/v/thread/666978687#666978687</link>
         <guid>http://boards.4chan.org/v/thread/666978687</guid>
         <comments>http://boards.4chan.org/v/thread/666978687</comments>
         <pubDate>Tue, 13 Feb 2024 15:59:04 EST</pubDate>
         <dc:creator>Anonymous</dc:creator>
         <description><![CDATA[<a href='http://i.4cdn.org/v/1707857944691136.png' target=_blank><img style='float:left;margin:8px' border=0 src='http://i.4cdn.org/v/1707857944691136s.jpg'></a> Will the Cyberpunk sequel manage to get to the level of hype that 2077 did? 2077 is basically a masterpiece now, but audiences won&#039;t forget the state it launched in. That&#039;s definitely going to affect the sequel.]]></description>
      </item>
      <item>
         <title>new games can't have this feel</title>
         <link>http://boards.4chan.org/v/thread/666978663#666978663</link>
         <guid>http://boards.4chan.org/v/thread/666978663</guid>
         <comments>http://boards.4chan.org/v/thread/666978663</comments>
         <pubDate>Tue, 13 Feb 2024 15:58:46 EST</pubDate>
         <dc:creator>Anonymous</dc:creator>
         <description><![CDATA[<a href='http://i.4cdn.org/v/1707857926060804.jpg' target=_blank><img style='float:left;margin:8px' border=0 src='http://i.4cdn.org/v/1707857926060804s.jpg'></a> new games can&#039;t have this feel]]></description>
      </item>
   </channel>
</rss>`;

Deno.test('getFourChanFeed', async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    'fetchWithTimeout',
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(response, { status: 200 }));
      }),
    ]),
  );

  try {
    const { source, items } = await getFourChanFeed(
      supabaseClient,
      undefined,
      mockProfile,
      { ...mockSource, options: { fourchan: 'v' } },
      undefined,
    );
    feedutils.assertEqualsSource(source, {
      'id': 'fourchan-myuser-mycolumn-9e3669d19b675bd57058fd4664205d2a',
      'columnId': 'mycolumn',
      'userId': 'myuser',
      'type': 'fourchan',
      'title': '/v/ - Video Games',
      'options': {
        'fourchan': 'v',
      },
      'link': 'http://boards.4chan.org/v/./',
    });
    feedutils.assertEqualsItems(items, [
      {
        'id':
          'fourchan-myuser-mycolumn-9e3669d19b675bd57058fd4664205d2a-4cedc3982b91056cf239c4a546aceca7',
        'userId': 'myuser',
        'columnId': 'mycolumn',
        'sourceId': 'fourchan-myuser-mycolumn-9e3669d19b675bd57058fd4664205d2a',
        'title':
          'Will the Cyberpunk sequel manage to get to the level of hype...',
        'link': 'http://boards.4chan.org/v/thread/666978687#666978687',
        'media': 'http://i.4cdn.org/v/1707857944691136s.jpg',
        'description':
          "<a href='http://i.4cdn.org/v/1707857944691136.png' target=_blank><img style='float:left;margin:8px' border=0 src='http://i.4cdn.org/v/1707857944691136s.jpg'></a> Will the Cyberpunk sequel manage to get to the level of hype that 2077 did? 2077 is basically a masterpiece now, but audiences won&#039;t forget the state it launched in. That&#039;s definitely going to affect the sequel.",
        'author': 'Anonymous',
        'publishedAt': 1707857944,
      },
      {
        'id':
          'fourchan-myuser-mycolumn-9e3669d19b675bd57058fd4664205d2a-2d682afe971ddf86fb31f588bbc9b808',
        'userId': 'myuser',
        'columnId': 'mycolumn',
        'sourceId': 'fourchan-myuser-mycolumn-9e3669d19b675bd57058fd4664205d2a',
        'title': "new games can't have this feel",
        'link': 'http://boards.4chan.org/v/thread/666978663#666978663',
        'media': 'http://i.4cdn.org/v/1707857926060804s.jpg',
        'description':
          "<a href='http://i.4cdn.org/v/1707857926060804.jpg' target=_blank><img style='float:left;margin:8px' border=0 src='http://i.4cdn.org/v/1707857926060804s.jpg'></a> new games can&#039;t have this feel",
        'author': 'Anonymous',
        'publishedAt': 1707857926,
      },
    ]);
  } finally {
    fetchWithTimeoutSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      'https://boards.4chan.org/v/index.rss',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(response, { status: 200 }));
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
});
