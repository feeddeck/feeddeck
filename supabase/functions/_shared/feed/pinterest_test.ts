import { assertEquals, assertThrows } from 'std/assert';
import { createClient } from '@supabase/supabase-js';
import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from 'std/testing/mock';

import { ISource } from '../models/source.ts';
import { IProfile } from '../models/profile.ts';
import {
  getPinterestFeed,
  isPinterestUrl,
  parsePinterestOption,
} from './pinterest.ts';
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

const responseUser = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
   <channel>
      <title>Pinterest Deutschland</title>
      <link>https://www.pinterest.com/pinterestde/</link>
      <description>Pinterest ist deine App voller Ideen zum Entdecken, Selbermachen, Ausprobieren.</description>
      <atom:link href="https://www.pinterest.de/pinterestde/feed.rss" rel="self" />
      <language>en-us</language>
      <lastBuildDate>Sun, 10 Dec 2023 16:33:00 GMT</lastBuildDate>
      <item>
         <title>Willy Wonka und die Schokoladenfabril Warner Kinofilm Photo Edit | Photshop #DezemberChallenge</title>
         <link>https://www.pinterest.de/pin/458452437083858830/</link>
         <description>&lt;a href="https://www.pinterest.de/pin/458452437083858830/"&gt;&lt;img src="https://i.pinimg.com/236x/38/ec/d5/38ecd5a70f26b7aed5a03d5d3d202a90.jpg"&gt;&lt;/a&gt;Willy Wonka und die Schokoladenfabril Warner Kinofilm Photo Edit | Photshop #DezemberChallenge</description>
         <pubDate>Thu, 07 Dec 2023 17:28:35 GMT</pubDate>
         <guid>https://www.pinterest.de/pin/458452437083858830/</guid>
      </item>
      <item>
         <title />
         <link>https://www.pinterest.de/pin/458452437083858826/</link>
         <description>&lt;a href="https://www.pinterest.de/pin/458452437083858826/"&gt;&lt;img src="https://i.pinimg.com/236x/bd/fe/c1/bdfec1ee5d5342c250460e7065cb037f.jpg"&gt;&lt;/a&gt;</description>
         <pubDate>Thu, 07 Dec 2023 17:28:01 GMT</pubDate>
         <guid>https://www.pinterest.de/pin/458452437083858826/</guid>
      </item>
      <item>
         <title />
         <link>https://www.pinterest.de/pin/458452437083858815/</link>
         <description>&lt;a href="https://www.pinterest.de/pin/458452437083858815/"&gt;&lt;img src="https://i.pinimg.com/236x/bb/b6/8b/bbb68be1c4069ba9c1facdcf66063849.jpg"&gt;&lt;/a&gt;</description>
         <pubDate>Thu, 07 Dec 2023 17:26:56 GMT</pubDate>
         <guid>https://www.pinterest.de/pin/458452437083858815/</guid>
      </item>
   </channel>
</rss>`;

Deno.test('isPinterestUrl', () => {
  assertEquals(
    isPinterestUrl('https://www.pinterest.de/pinterestde/essen-und-trinken/'),
    true,
  );
  assertEquals(isPinterestUrl('https://www.google.de/'), false);
});

Deno.test('parsePinterestOption', () => {
  assertEquals(
    parsePinterestOption('https://www.pinterest.de/pinterestde'),
    'https://www.pinterest.com/pinterestde/feed.rss',
  );
  assertEquals(
    parsePinterestOption('https://www.pinterest.de/aurelianstoian/math/'),
    'https://www.pinterest.com/aurelianstoian/math.rss',
  );
  assertEquals(
    parsePinterestOption('@pinterestde'),
    'https://www.pinterest.com/pinterestde/feed.rss',
  );
  assertEquals(
    parsePinterestOption('@aurelianstoian/math'),
    'https://www.pinterest.com/aurelianstoian/math.rss',
  );
  assertThrows(() => parsePinterestOption(undefined));
  assertThrows(() => parsePinterestOption(''));
});

Deno.test('getPinterestFeed - User', async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    'fetchWithTimeout',
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responseUser, { status: 200 }));
      }),
    ]),
  );

  try {
    const { source, items } = await getPinterestFeed(
      supabaseClient,
      undefined,
      mockProfile,
      {
        ...mockSource,
        options: { pinterest: 'https://www.pinterest.de/pinterestde' },
      },
      undefined,
    );
    feedutils.assertEqualsSource(source, {
      'id': 'pinterest-myuser-mycolumn-18a73e1c3eb363440dbd64cfa9dfd1ab',
      'columnId': 'mycolumn',
      'userId': 'myuser',
      'type': 'pinterest',
      'title': 'Pinterest Deutschland',
      'options': {
        'pinterest': 'https://www.pinterest.com/pinterestde/feed.rss',
      },
      'link': 'https://www.pinterest.com/pinterestde/',
    });
    feedutils.assertEqualsItems(items, [{
      'id':
        'pinterest-myuser-mycolumn-18a73e1c3eb363440dbd64cfa9dfd1ab-b943f6a54297d4cab0bb47da53a3966a',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'pinterest-myuser-mycolumn-18a73e1c3eb363440dbd64cfa9dfd1ab',
      'title':
        'Willy Wonka und die Schokoladenfabril Warner Kinofilm Photo Edit | Photshop #DezemberChallenge',
      'link': 'https://www.pinterest.de/pin/458452437083858830/',
      'media':
        'https://i.pinimg.com/236x/38/ec/d5/38ecd5a70f26b7aed5a03d5d3d202a90.jpg',
      'description':
        '<a href="https://www.pinterest.de/pin/458452437083858830/"><img src="https://i.pinimg.com/236x/38/ec/d5/38ecd5a70f26b7aed5a03d5d3d202a90.jpg"></a>Willy Wonka und die Schokoladenfabril Warner Kinofilm Photo Edit | Photshop #DezemberChallenge',
      'author': '@pinterestde',
      'publishedAt': 1701970115,
    }, {
      'id':
        'pinterest-myuser-mycolumn-18a73e1c3eb363440dbd64cfa9dfd1ab-3bf66585db7320d3182510e8a691350c',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'pinterest-myuser-mycolumn-18a73e1c3eb363440dbd64cfa9dfd1ab',
      'title': '',
      'link': 'https://www.pinterest.de/pin/458452437083858826/',
      'media':
        'https://i.pinimg.com/236x/bd/fe/c1/bdfec1ee5d5342c250460e7065cb037f.jpg',
      'description':
        '<a href="https://www.pinterest.de/pin/458452437083858826/"><img src="https://i.pinimg.com/236x/bd/fe/c1/bdfec1ee5d5342c250460e7065cb037f.jpg"></a>',
      'author': '@pinterestde',
      'publishedAt': 1701970081,
    }, {
      'id':
        'pinterest-myuser-mycolumn-18a73e1c3eb363440dbd64cfa9dfd1ab-b604f0bd41e5f641231a99b9606854a3',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'pinterest-myuser-mycolumn-18a73e1c3eb363440dbd64cfa9dfd1ab',
      'title': '',
      'link': 'https://www.pinterest.de/pin/458452437083858815/',
      'media':
        'https://i.pinimg.com/236x/bb/b6/8b/bbb68be1c4069ba9c1facdcf66063849.jpg',
      'description':
        '<a href="https://www.pinterest.de/pin/458452437083858815/"><img src="https://i.pinimg.com/236x/bb/b6/8b/bbb68be1c4069ba9c1facdcf66063849.jpg"></a>',
      'author': '@pinterestde',
      'publishedAt': 1701970016,
    }]);
  } finally {
    fetchWithTimeoutSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      'https://www.pinterest.com/pinterestde/feed.rss',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseUser, { status: 200 }));
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
});
