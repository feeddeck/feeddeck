import { assertEquals } from 'std/assert';
import { createClient } from '@supabase/supabase-js';
import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from 'std/testing/mock';

import { ISource } from '../models/source.ts';
import { IProfile } from '../models/profile.ts';
import { getLemmyFeed, isLemmyUrl } from './lemmy.ts';
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
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0">
   <channel>
      <title>Lemmy.World - lwCET</title>
      <link>https://lemmy.world/u/lwCET</link>
      <description />
      <item>
         <title>[Weekly Community Spotlights] c/forgottenweapons and aneurysmposting@sopuli.xyz</title>
         <link>https://lemmy.world/pictrs/image/d22b2935-f27b-49f0-81e7-c81c21088467.png</link>
         <description><![CDATA[submitted by <a href="https://lemmy.world/u/lwCET">lwCET</a> to <a href="https://lemmy.world/c/communityspotlight">communityspotlight</a><br>180 points | <a href="https://lemmy.world/post/9209829">19 comments</a><br><a href="https://lemmy.world/pictrs/image/d22b2935-f27b-49f0-81e7-c81c21088467.png">https://lemmy.world/pictrs/image/d22b2935-f27b-49f0-81e7-c81c21088467.png</a><h2>Hello World,</h2>
<h2>This weekâ€™s Community Spotlights are:</h2>
<p><strong>LW Community:</strong> <a href="https://lemmy.world/c/forgottenweapons">Forgotten Weapons</a> (!forgottenweapons@lemmy.world) - A community dedicated to discussion around historical arms, mechanically unique arms, and Ian McCollumâ€™s Forgotten Weapons content.<br />
<strong>Mod(s):</strong> @FireTower@lemmy.world</p>
<hr />
<p><strong>Fediverse Community:</strong> <a href="https://sopuli.xyz/c/aneurysmposting">Aneurysm Posting</a> (!aneurysmposting@sopuli.xyz) - For shitposting by people who can smell burnt toast.<br />
<strong>Mod(s):</strong> @PinkyCoyote@sopuli.xyz</p>
<hr />
<h2>How to submit a community you would like to see spotlighted</h2>
<p>Comment on any Weekly Spotlight post or suggest a community on our <a href="https://discord.gg/lemmyworld">Discord server</a> in the <strong>community-spotlight</strong> channel.  You can also send a message to the <a href="https://lemmy.world/u/lwCET">Community Team</a> with your suggestions.</p>]]></description>
         <comments>https://lemmy.world/post/9209829</comments>
         <guid>https://lemmy.world/post/9209829</guid>
         <pubDate>Wed, 06 Dec 2023 11:32:19 +0000</pubDate>
         <dc:creator>https://lemmy.world/u/lwCET</dc:creator>
      </item>
      <item>
         <title>LW Holiday Logos</title>
         <link>https://lemmy.world/pictrs/image/f3189f30-f8c8-4c4f-b957-e3a7bfd1c784.png</link>
         <description><![CDATA[submitted by <a href="https://lemmy.world/u/lwCET">lwCET</a> to <a href="https://lemmy.world/c/lemmyworld">lemmyworld</a><br>361 points | <a href="https://lemmy.world/post/9036399">47 comments</a><br><a href="https://lemmy.world/pictrs/image/f3189f30-f8c8-4c4f-b957-e3a7bfd1c784.png">https://lemmy.world/pictrs/image/f3189f30-f8c8-4c4f-b957-e3a7bfd1c784.png</a><p>Hello World,</p>
<p>You may have seen the LW holiday themed logos we have used for Halloween and Thanksgiving.  LWâ€™s users represent many countries around the world and we want to celebrate holidays and other special days that are local to you, but our team is fairly small and we arenâ€™t aware of a lot of the local customs out there.  So weâ€™re asking you what you would like to see represented in a LW themed logo.  What are some holidays/special days in your area and how do you celebrate them?  And not just major holidays, we would like to celebrate festivals, days of remembrance, and other special days.</p>
<p>Please, comment below your suggestions and ideas on how we could represent them in the LW logo.</p>
<p>EDIT: Mostly looking for events throughout the year.  Whatâ€™s left of 2023 is already in work.  Thanks!</p>]]></description>
         <comments>https://lemmy.world/post/9036399</comments>
         <guid>https://lemmy.world/post/9036399</guid>
         <pubDate>Sat, 02 Dec 2023 05:39:05 +0000</pubDate>
         <dc:creator>https://lemmy.world/u/lwCET</dc:creator>
      </item>
   </channel>
</rss>`;

const responseCommunity = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0">
   <channel>
      <title>Lemmy.World - lemmyworld</title>
      <link>https://lemmy.world/c/lemmyworld</link>
      <description>This Community is intended for **posts about the Lemmy.world server** by the admins.

For support with issues at Lemmy.world, go to [the Lemmy.world Support community](https://lemmy.world/c/support).

## Support e-mail
Any support requests are best sent to info@lemmy.world e-mail.

## Donations
If you would like to make a donation to support the cost of running this platform, please do so at the mastodon. world donation URLs:

- https://opencollective.com/mastodonworld
- https://patreon.com/mastodonworld</description>
      <item>
         <title>LW Holiday Logos</title>
         <link>https://lemmy.world/pictrs/image/f3189f30-f8c8-4c4f-b957-e3a7bfd1c784.png</link>
         <description><![CDATA[submitted by <a href="https://lemmy.world/u/lwCET">lwCET</a> to <a href="https://lemmy.world/c/lemmyworld">lemmyworld</a><br>361 points | <a href="https://lemmy.world/post/9036399">47 comments</a><br><a href="https://lemmy.world/pictrs/image/f3189f30-f8c8-4c4f-b957-e3a7bfd1c784.png">https://lemmy.world/pictrs/image/f3189f30-f8c8-4c4f-b957-e3a7bfd1c784.png</a><p>Hello World,</p>
<p>You may have seen the LW holiday themed logos we have used for Halloween and Thanksgiving.  LWâ€™s users represent many countries around the world and we want to celebrate holidays and other special days that are local to you, but our team is fairly small and we arenâ€™t aware of a lot of the local customs out there.  So weâ€™re asking you what you would like to see represented in a LW themed logo.  What are some holidays/special days in your area and how do you celebrate them?  And not just major holidays, we would like to celebrate festivals, days of remembrance, and other special days.</p>
<p>Please, comment below your suggestions and ideas on how we could represent them in the LW logo.</p>
<p>EDIT: Mostly looking for events throughout the year.  Whatâ€™s left of 2023 is already in work.  Thanks!</p>]]></description>
         <comments>https://lemmy.world/post/9036399</comments>
         <guid>https://lemmy.world/post/9036399</guid>
         <pubDate>Sat, 02 Dec 2023 05:39:05 +0000</pubDate>
         <dc:creator>https://lemmy.world/u/lwCET</dc:creator>
      </item>
      <item>
         <title>Lemmy.World Junior Cloud Engineer</title>
         <link>https://lemmy.world/post/8054956</link>
         <description><![CDATA[submitted by <a href="https://lemmy.world/u/lwadmin">lwadmin</a> to <a href="https://lemmy.world/c/lemmyworld">lemmyworld</a><br>501 points | <a href="https://lemmy.world/post/8054956">2 comments</a><p>Hello World!</p>
<p>Lemmy.World is looking for new engineers to help with our growing community. Volunteers will assist our existing infrastructure team with monitoring, maintenance and automation development tasks. They will report to our <a href="https://team.lemmy.world/#-org-chart">head of infrastructure</a>.</p>
<p>We are looking for junior admins for this role. You will learn a modern cloud infra stack, including Terraform, DataDog, CloudFlare and ma</p>
<p>Keep in mind that while this is a volunteer gig, we would ask you to be able to commit to at least 5-10 hours a week. We also understand this is a hobby and that family and work comes first.</p>
<p>Applicants must be okay with providing their CV, LinkedIn profile; along with sitting for a video interview.</p>
<p>We are an international team that works from both North America EST time (-4) and Europe CEST (+2) so we would ask that candidates be flexible with their availability.</p>
<p>To learn more and begin your application process, <a href="https://docs.google.com/forms/d/e/1FAIpQLSd0wXwY4V75_sVM1BmgFL8ObfwhT2jsUwxb9MP_TY8PyE3KfQ/viewform?pli=1">click here</a>. This is not a paid position.</p>]]></description>
         <comments>https://lemmy.world/post/8054956</comments>
         <guid>https://lemmy.world/post/8054956</guid>
         <pubDate>Fri, 10 Nov 2023 09:48:21 +0000</pubDate>
         <dc:creator>https://lemmy.world/u/lwadmin</dc:creator>
      </item>
   </channel>
</rss>`;

const responseCommunityIIC = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0">
   <channel>
      <title>Lemmy.World - idiotsincars</title>
      <link>https://lemmy.world/c/idiotsincars</link>
      <description>This ~~subreddit~~ community is devoted to the lovable idiots who do hilarious, idiot things in their idiot cars (or trucks, motorcycles, tractors, or other vehicle). We honor them with gifs, videos, images, and laughter.</description>
      <item>
         <title>9/30/23 Don't be this guy</title>
         <link>https://i.imgur.com/rGcxspg.mp4</link>
         <description><![CDATA[submitted by <a href="https://lemm.ee/u/SuperSleuth">SuperSleuth</a> to <a href="https://lemmy.world/c/idiotsincars">idiotsincars</a><br>97 points | <a href="https://lemmy.world/post/6063706">4 comments</a><br><a href="https://i.imgur.com/rGcxspg.mp4">https://i.imgur.com/rGcxspg.mp4</a><p>use this <a href="https://imgur.com/a/XKwjyC3">link</a> if video doesnâ€™t load</p>]]></description>
         <comments>https://lemmy.world/post/6063706</comments>
         <guid>https://lemmy.world/post/6063706</guid>
         <pubDate>Sun, 01 Oct 2023 00:42:07 +0000</pubDate>
         <dc:creator>https://lemm.ee/u/SuperSleuth</dc:creator>
      </item>
      <item>
         <title>Dash Cam Owners Australia September 2023 On the Road Compilation</title>
         <link>https://youtu.be/6Xr6tsMCDzs?si=apq7rpNvByYnpXN2</link>
         <description><![CDATA[submitted by <a href="https://lemmy.world/u/BestTestInTheWest">BestTestInTheWest</a> to <a href="https://lemmy.world/c/idiotsincars">idiotsincars</a><br>22 points | <a href="https://lemmy.world/post/5679506">2 comments</a><br><a href="https://youtu.be/6Xr6tsMCDzs?si=apq7rpNvByYnpXN2">https://youtu.be/6Xr6tsMCDzs?si=apq7rpNvByYnpXN2</a>]]></description>
         <comments>https://lemmy.world/post/5679506</comments>
         <guid>https://lemmy.world/post/5679506</guid>
         <pubDate>Sun, 24 Sep 2023 22:50:29 +0000</pubDate>
         <dc:creator>https://lemmy.world/u/BestTestInTheWest</dc:creator>
      </item>
      <item>
         <title>I merge now!</title>
         <link>https://files.catbox.moe/7ino16.mp4</link>
         <description><![CDATA[submitted by <a href="https://lemm.ee/u/Overstuff9499">Overstuff9499</a> to <a href="https://lemmy.world/c/idiotsincars">idiotsincars</a><br>13 points | <a href="https://lemmy.world/post/4072199">7 comments</a><br><a href="https://files.catbox.moe/7ino16.mp4">https://files.catbox.moe/7ino16.mp4</a><p>i guess i should read their minds.</p>]]></description>
         <comments>https://lemmy.world/post/4072199</comments>
         <guid>https://lemmy.world/post/4072199</guid>
         <pubDate>Tue, 29 Aug 2023 13:56:40 +0000</pubDate>
         <dc:creator>https://lemm.ee/u/Overstuff9499</dc:creator>
      </item>
      <item>
         <title>Dash Cam Owners Australia August 2023 On the Road Compilation</title>
         <link>https://youtu.be/TtWnAIcU6Cs?si=RQ9VJGcLF4xR0xsx</link>
         <description><![CDATA[submitted by <a href="https://lemmy.world/u/BestTestInTheWest">BestTestInTheWest</a> to <a href="https://lemmy.world/c/idiotsincars">idiotsincars</a><br>26 points | <a href="https://lemmy.world/post/3965818">1 comments</a><br><a href="https://youtu.be/TtWnAIcU6Cs?si=RQ9VJGcLF4xR0xsx">https://youtu.be/TtWnAIcU6Cs?si=RQ9VJGcLF4xR0xsx</a><p>Dash Cam Owners Australia August 2023 On the Road Compilation</p>]]></description>
         <comments>https://lemmy.world/post/3965818</comments>
         <guid>https://lemmy.world/post/3965818</guid>
         <pubDate>Sun, 27 Aug 2023 19:53:07 +0000</pubDate>
         <dc:creator>https://lemmy.world/u/BestTestInTheWest</dc:creator>
      </item>
      <item>
         <title>Car playing PacMan with the double yellow line in a dangerous curve</title>
         <link>https://i.imgur.com/gHFeqCi.mp4</link>
         <description><![CDATA[submitted by <a href="https://lemmy.world/u/LazaroFilm">LazaroFilm</a> to <a href="https://lemmy.world/c/idiotsincars">idiotsincars</a><br>45 points | <a href="https://lemmy.world/post/3303420">1 comments</a><br><a href="https://i.imgur.com/gHFeqCi.mp4">https://i.imgur.com/gHFeqCi.mp4</a><p>And they honk backâ€½</p>]]></description>
         <comments>https://lemmy.world/post/3303420</comments>
         <guid>https://lemmy.world/post/3303420</guid>
         <pubDate>Wed, 16 Aug 2023 22:26:18 +0000</pubDate>
         <dc:creator>https://lemmy.world/u/LazaroFilm</dc:creator>
      </item>
      <item>
         <title>Cop car forgot how stop signs work</title>
         <link>https://i.imgur.com/hsaoKWm.mp4</link>
         <description><![CDATA[submitted by <a href="https://lemmy.world/u/LazaroFilm">LazaroFilm</a> to <a href="https://lemmy.world/c/idiotsincars">idiotsincars</a><br>49 points | <a href="https://lemmy.world/post/3303348">4 comments</a><br><a href="https://i.imgur.com/hsaoKWm.mp4">https://i.imgur.com/hsaoKWm.mp4</a>]]></description>
         <comments>https://lemmy.world/post/3303348</comments>
         <guid>https://lemmy.world/post/3303348</guid>
         <pubDate>Wed, 16 Aug 2023 22:18:38 +0000</pubDate>
         <dc:creator>https://lemmy.world/u/LazaroFilm</dc:creator>
      </item>
      <item>
         <title>Honey, I forgot the KeÅŸkek</title>
         <link>https://i.imgur.com/lXKg8Gn.mp4</link>
         <description><![CDATA[submitted by <a href="https://lemm.ee/u/SuperSleuth">SuperSleuth</a> to <a href="https://lemmy.world/c/idiotsincars">idiotsincars</a><br>108 points | <a href="https://lemmy.world/post/2916600">5 comments</a><br><a href="https://i.imgur.com/lXKg8Gn.mp4">https://i.imgur.com/lXKg8Gn.mp4</a><p>A seven car pileup during a wedding convoy in Denizli, Turkey. Click <a href="https://imgur.com/a/XzQ2rCD">here</a> if you canâ€™t see the video.</p>]]></description>
         <comments>https://lemmy.world/post/2916600</comments>
         <guid>https://lemmy.world/post/2916600</guid>
         <pubDate>Wed, 09 Aug 2023 13:20:04 +0000</pubDate>
         <dc:creator>https://lemm.ee/u/SuperSleuth</dc:creator>
      </item>
      <item>
         <title>BMW unexpectedly using blinkers before brake checking cargo truck [YT original in post]</title>
         <link>http://regna.nu/7u70dz.gif</link>
         <description><![CDATA[submitted by <a href="https://lemmy.world/u/Regna">Regna</a> to <a href="https://lemmy.world/c/idiotsincars">idiotsincars</a><br>91 points | <a href="https://lemmy.world/post/2370743">11 comments</a><br><a href="http://regna.nu/7u70dz.gif">http://regna.nu/7u70dz.gif</a><p><em>Edit: Changed link for the pic to another site</em></p>
<p>The guy behind <a href="https://www.youtube.com/@truckdriver1982">Trucker Dashcam // Sweden</a> is one of the nicest truckers Iâ€™ve ever heard of. He mainly does dashcam compilations nowadays, and includes videos from friends and subscibers as well.</p>
<ul>
<li>Original video is at: <a href="https://www.youtube.com/watch?v=6HivZOJ4-K4">Trucker Dashcam // Sweden</a></li>
<li>Here is <a href="https://www.youtube.com/watch?v=6HivZOJ4-K4&amp;t=55s">time when the BMW turns up</a></li>
<li>Here is a <a href="https://piped.video/channel/UCfV0wtzumYCRuvLhY5n6hug">Piped link to the channel</a></li>
</ul>]]></description>
         <comments>https://lemmy.world/post/2370743</comments>
         <guid>https://lemmy.world/post/2370743</guid>
         <pubDate>Sun, 30 Jul 2023 10:19:11 +0000</pubDate>
         <dc:creator>https://lemmy.world/u/Regna</dc:creator>
      </item>
   </channel>
</rss>`;

Deno.test('isLemmyUrl', () => {
  assertEquals(isLemmyUrl('https://lemmy.world/c/lemmyworld'), true);
  assertEquals(isLemmyUrl('https://www.google.de/'), false);
});

Deno.test('getLemmyFeed - User', async () => {
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
    const { source, items } = await getLemmyFeed(
      supabaseClient,
      undefined,
      mockProfile,
      { ...mockSource, options: { lemmy: 'https://lemmy.world/u/lwCET' } },
    );
    feedutils.assertEqualsSource(source, {
      'id': 'lemmy-myuser-mycolumn-9b51f0368938451bfbd740fad833b7a4',
      'columnId': 'mycolumn',
      'userId': 'myuser',
      'type': 'lemmy',
      'title': 'Lemmy.World - lwCET',
      'options': { 'lemmy': 'https://lemmy.world/feeds/u/lwCET.xml?sort=New' },
      'link': 'https://lemmy.world/u/lwCET',
    });
    feedutils.assertEqualsItems(items, [{
      'id':
        'lemmy-myuser-mycolumn-9b51f0368938451bfbd740fad833b7a4-1f643a920e7a0d3766558a52ddb28f96',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'lemmy-myuser-mycolumn-9b51f0368938451bfbd740fad833b7a4',
      'title':
        '[Weekly Community Spotlights] c/forgottenweapons and aneurysmposting@sopuli.xyz',
      'link': 'https://lemmy.world/post/9209829',
      'media':
        'https://lemmy.world/pictrs/image/d22b2935-f27b-49f0-81e7-c81c21088467.png',
      'description':
        'submitted by <a href="https://lemmy.world/u/lwCET">lwCET</a> to <a href="https://lemmy.world/c/communityspotlight">communityspotlight</a><br>180 points | <a href="https://lemmy.world/post/9209829">19 comments</a><br><a href="https://lemmy.world/pictrs/image/d22b2935-f27b-49f0-81e7-c81c21088467.png">https://lemmy.world/pictrs/image/d22b2935-f27b-49f0-81e7-c81c21088467.png</a><h2>Hello World,</h2>\n<h2>This weekâ€™s Community Spotlights are:</h2>\n<p><strong>LW Community:</strong> <a href="https://lemmy.world/c/forgottenweapons">Forgotten Weapons</a> (!forgottenweapons@lemmy.world) - A community dedicated to discussion around historical arms, mechanically unique arms, and Ian McCollumâ€™s Forgotten Weapons content.<br />\n<strong>Mod(s):</strong> @FireTower@lemmy.world</p>\n<hr />\n<p><strong>Fediverse Community:</strong> <a href="https://sopuli.xyz/c/aneurysmposting">Aneurysm Posting</a> (!aneurysmposting@sopuli.xyz) - For shitposting by people who can smell burnt toast.<br />\n<strong>Mod(s):</strong> @PinkyCoyote@sopuli.xyz</p>\n<hr />\n<h2>How to submit a community you would like to see spotlighted</h2>\n<p>Comment on any Weekly Spotlight post or suggest a community on our <a href="https://discord.gg/lemmyworld">Discord server</a> in the <strong>community-spotlight</strong> channel.  You can also send a message to the <a href="https://lemmy.world/u/lwCET">Community Team</a> with your suggestions.</p>',
      'author': 'https://lemmy.world/u/lwCET',
      'publishedAt': 1701862339,
    }, {
      'id':
        'lemmy-myuser-mycolumn-9b51f0368938451bfbd740fad833b7a4-86c6108b553905422e6268948f22ba54',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'lemmy-myuser-mycolumn-9b51f0368938451bfbd740fad833b7a4',
      'title': 'LW Holiday Logos',
      'link': 'https://lemmy.world/post/9036399',
      'media':
        'https://lemmy.world/pictrs/image/f3189f30-f8c8-4c4f-b957-e3a7bfd1c784.png',
      'description':
        'submitted by <a href="https://lemmy.world/u/lwCET">lwCET</a> to <a href="https://lemmy.world/c/lemmyworld">lemmyworld</a><br>361 points | <a href="https://lemmy.world/post/9036399">47 comments</a><br><a href="https://lemmy.world/pictrs/image/f3189f30-f8c8-4c4f-b957-e3a7bfd1c784.png">https://lemmy.world/pictrs/image/f3189f30-f8c8-4c4f-b957-e3a7bfd1c784.png</a><p>Hello World,</p>\n<p>You may have seen the LW holiday themed logos we have used for Halloween and Thanksgiving.  LWâ€™s users represent many countries around the world and we want to celebrate holidays and other special days that are local to you, but our team is fairly small and we arenâ€™t aware of a lot of the local customs out there.  So weâ€™re asking you what you would like to see represented in a LW themed logo.  What are some holidays/special days in your area and how do you celebrate them?  And not just major holidays, we would like to celebrate festivals, days of remembrance, and other special days.</p>\n<p>Please, comment below your suggestions and ideas on how we could represent them in the LW logo.</p>\n<p>EDIT: Mostly looking for events throughout the year.  Whatâ€™s left of 2023 is already in work.  Thanks!</p>',
      'author': 'https://lemmy.world/u/lwCET',
      'publishedAt': 1701495545,
    }]);
  } finally {
    fetchWithTimeoutSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      'https://lemmy.world/feeds/u/lwCET.xml?sort=New',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseUser, { status: 200 }));
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
});

Deno.test('getLemmyFeed - Community', async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    'fetchWithTimeout',
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responseCommunity, { status: 200 }));
      }),
    ]),
  );

  try {
    const { source, items } = await getLemmyFeed(
      supabaseClient,
      undefined,
      mockProfile,
      { ...mockSource, options: { lemmy: 'https://lemmy.world/c/lemmyworld' } },
    );
    feedutils.assertEqualsSource(source, {
      'id': 'lemmy-myuser-mycolumn-8024684791f06e280f6fbd7217099f42',
      'columnId': 'mycolumn',
      'userId': 'myuser',
      'type': 'lemmy',
      'title': 'Lemmy.World - lemmyworld',
      'options': {
        'lemmy': 'https://lemmy.world/feeds/c/lemmyworld.xml?sort=New',
      },
      'link': 'https://lemmy.world/c/lemmyworld',
    });
    feedutils.assertEqualsItems(items, [{
      'id':
        'lemmy-myuser-mycolumn-8024684791f06e280f6fbd7217099f42-86c6108b553905422e6268948f22ba54',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'lemmy-myuser-mycolumn-8024684791f06e280f6fbd7217099f42',
      'title': 'LW Holiday Logos',
      'link': 'https://lemmy.world/post/9036399',
      'media':
        'https://lemmy.world/pictrs/image/f3189f30-f8c8-4c4f-b957-e3a7bfd1c784.png',
      'description':
        'submitted by <a href="https://lemmy.world/u/lwCET">lwCET</a> to <a href="https://lemmy.world/c/lemmyworld">lemmyworld</a><br>361 points | <a href="https://lemmy.world/post/9036399">47 comments</a><br><a href="https://lemmy.world/pictrs/image/f3189f30-f8c8-4c4f-b957-e3a7bfd1c784.png">https://lemmy.world/pictrs/image/f3189f30-f8c8-4c4f-b957-e3a7bfd1c784.png</a><p>Hello World,</p>\n<p>You may have seen the LW holiday themed logos we have used for Halloween and Thanksgiving.  LWâ€™s users represent many countries around the world and we want to celebrate holidays and other special days that are local to you, but our team is fairly small and we arenâ€™t aware of a lot of the local customs out there.  So weâ€™re asking you what you would like to see represented in a LW themed logo.  What are some holidays/special days in your area and how do you celebrate them?  And not just major holidays, we would like to celebrate festivals, days of remembrance, and other special days.</p>\n<p>Please, comment below your suggestions and ideas on how we could represent them in the LW logo.</p>\n<p>EDIT: Mostly looking for events throughout the year.  Whatâ€™s left of 2023 is already in work.  Thanks!</p>',
      'author': 'https://lemmy.world/u/lwCET',
      'publishedAt': 1701495545,
    }, {
      'id':
        'lemmy-myuser-mycolumn-8024684791f06e280f6fbd7217099f42-797a3b386c90d913c61e1c831cba6f46',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'lemmy-myuser-mycolumn-8024684791f06e280f6fbd7217099f42',
      'title': 'Lemmy.World Junior Cloud Engineer',
      'link': 'https://lemmy.world/post/8054956',
      'description':
        'submitted by <a href="https://lemmy.world/u/lwadmin">lwadmin</a> to <a href="https://lemmy.world/c/lemmyworld">lemmyworld</a><br>501 points | <a href="https://lemmy.world/post/8054956">2 comments</a><p>Hello World!</p>\n<p>Lemmy.World is looking for new engineers to help with our growing community. Volunteers will assist our existing infrastructure team with monitoring, maintenance and automation development tasks. They will report to our <a href="https://team.lemmy.world/#-org-chart">head of infrastructure</a>.</p>\n<p>We are looking for junior admins for this role. You will learn a modern cloud infra stack, including Terraform, DataDog, CloudFlare and ma</p>\n<p>Keep in mind that while this is a volunteer gig, we would ask you to be able to commit to at least 5-10 hours a week. We also understand this is a hobby and that family and work comes first.</p>\n<p>Applicants must be okay with providing their CV, LinkedIn profile; along with sitting for a video interview.</p>\n<p>We are an international team that works from both North America EST time (-4) and Europe CEST (+2) so we would ask that candidates be flexible with their availability.</p>\n<p>To learn more and begin your application process, <a href="https://docs.google.com/forms/d/e/1FAIpQLSd0wXwY4V75_sVM1BmgFL8ObfwhT2jsUwxb9MP_TY8PyE3KfQ/viewform?pli=1">click here</a>. This is not a paid position.</p>',
      'author': 'https://lemmy.world/u/lwadmin',
      'publishedAt': 1699609701,
    }]);
  } finally {
    fetchWithTimeoutSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      'https://lemmy.world/feeds/c/lemmyworld.xml?sort=New',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseCommunity, { status: 200 }));
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
});

Deno.test('getLemmyFeed - Community - IIC', async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    'fetchWithTimeout',
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responseCommunityIIC, { status: 200 }));
      }),
    ]),
  );

  try {
    const { source, items } = await getLemmyFeed(
      supabaseClient,
      undefined,
      mockProfile,
      {
        ...mockSource,
        options: { lemmy: 'https://lemmy.world/feeds/c/idiotsincars.xml' },
      },
    );
    feedutils.assertEqualsSource(source, {
      'id': 'lemmy-myuser-mycolumn-e5cb4d4594ce7d19987fd42ca1dd837f',
      'columnId': 'mycolumn',
      'userId': 'myuser',
      'type': 'lemmy',
      'title': 'Lemmy.World - idiotsincars',
      'options': {
        'lemmy': 'https://lemmy.world/feeds/c/idiotsincars.xml?sort=New',
      },
      'link': 'https://lemmy.world/c/idiotsincars',
    });
    feedutils.assertEqualsItems(items, [{
      'id':
        'lemmy-myuser-mycolumn-e5cb4d4594ce7d19987fd42ca1dd837f-33d0c935222609e6d7afe3d3054affec',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'lemmy-myuser-mycolumn-e5cb4d4594ce7d19987fd42ca1dd837f',
      'title': '9/30/23 Don\'t be this guy',
      'link': 'https://lemmy.world/post/6063706',
      'media': 'https://i.imgur.com/rGcxspg.mp4',
      'description':
        'submitted by <a href="https://lemm.ee/u/SuperSleuth">SuperSleuth</a> to <a href="https://lemmy.world/c/idiotsincars">idiotsincars</a><br>97 points | <a href="https://lemmy.world/post/6063706">4 comments</a><br><a href="https://i.imgur.com/rGcxspg.mp4">https://i.imgur.com/rGcxspg.mp4</a><p>use this <a href="https://imgur.com/a/XKwjyC3">link</a> if video doesnâ€™t load</p>',
      'author': 'https://lemm.ee/u/SuperSleuth',
      'publishedAt': 1696120927,
    }, {
      'id':
        'lemmy-myuser-mycolumn-e5cb4d4594ce7d19987fd42ca1dd837f-44104b8b3612c665abe8b93a2cdd2ce0',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'lemmy-myuser-mycolumn-e5cb4d4594ce7d19987fd42ca1dd837f',
      'title':
        'Dash Cam Owners Australia September 2023 On the Road Compilation',
      'link': 'https://lemmy.world/post/5679506',
      'media': 'https://youtu.be/6Xr6tsMCDzs?si=apq7rpNvByYnpXN2',
      'description':
        'submitted by <a href="https://lemmy.world/u/BestTestInTheWest">BestTestInTheWest</a> to <a href="https://lemmy.world/c/idiotsincars">idiotsincars</a><br>22 points | <a href="https://lemmy.world/post/5679506">2 comments</a><br><a href="https://youtu.be/6Xr6tsMCDzs?si=apq7rpNvByYnpXN2">https://youtu.be/6Xr6tsMCDzs?si=apq7rpNvByYnpXN2</a>',
      'author': 'https://lemmy.world/u/BestTestInTheWest',
      'publishedAt': 1695595829,
    }, {
      'id':
        'lemmy-myuser-mycolumn-e5cb4d4594ce7d19987fd42ca1dd837f-d36d08de3466c62c4feb90c491e68113',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'lemmy-myuser-mycolumn-e5cb4d4594ce7d19987fd42ca1dd837f',
      'title': 'I merge now!',
      'link': 'https://lemmy.world/post/4072199',
      'media': 'https://files.catbox.moe/7ino16.mp4',
      'description':
        'submitted by <a href="https://lemm.ee/u/Overstuff9499">Overstuff9499</a> to <a href="https://lemmy.world/c/idiotsincars">idiotsincars</a><br>13 points | <a href="https://lemmy.world/post/4072199">7 comments</a><br><a href="https://files.catbox.moe/7ino16.mp4">https://files.catbox.moe/7ino16.mp4</a><p>i guess i should read their minds.</p>',
      'author': 'https://lemm.ee/u/Overstuff9499',
      'publishedAt': 1693317400,
    }, {
      'id':
        'lemmy-myuser-mycolumn-e5cb4d4594ce7d19987fd42ca1dd837f-325c767708c578205330addd91232fc8',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'lemmy-myuser-mycolumn-e5cb4d4594ce7d19987fd42ca1dd837f',
      'title': 'Dash Cam Owners Australia August 2023 On the Road Compilation',
      'link': 'https://lemmy.world/post/3965818',
      'media': 'https://youtu.be/TtWnAIcU6Cs?si=RQ9VJGcLF4xR0xsx',
      'description':
        'submitted by <a href="https://lemmy.world/u/BestTestInTheWest">BestTestInTheWest</a> to <a href="https://lemmy.world/c/idiotsincars">idiotsincars</a><br>26 points | <a href="https://lemmy.world/post/3965818">1 comments</a><br><a href="https://youtu.be/TtWnAIcU6Cs?si=RQ9VJGcLF4xR0xsx">https://youtu.be/TtWnAIcU6Cs?si=RQ9VJGcLF4xR0xsx</a><p>Dash Cam Owners Australia August 2023 On the Road Compilation</p>',
      'author': 'https://lemmy.world/u/BestTestInTheWest',
      'publishedAt': 1693165987,
    }, {
      'id':
        'lemmy-myuser-mycolumn-e5cb4d4594ce7d19987fd42ca1dd837f-6cea754fc3ac4867b66309151e8ef5eb',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'lemmy-myuser-mycolumn-e5cb4d4594ce7d19987fd42ca1dd837f',
      'title':
        'Car playing PacMan with the double yellow line in a dangerous curve',
      'link': 'https://lemmy.world/post/3303420',
      'media': 'https://i.imgur.com/gHFeqCi.mp4',
      'description':
        'submitted by <a href="https://lemmy.world/u/LazaroFilm">LazaroFilm</a> to <a href="https://lemmy.world/c/idiotsincars">idiotsincars</a><br>45 points | <a href="https://lemmy.world/post/3303420">1 comments</a><br><a href="https://i.imgur.com/gHFeqCi.mp4">https://i.imgur.com/gHFeqCi.mp4</a><p>And they honk backâ€½</p>',
      'author': 'https://lemmy.world/u/LazaroFilm',
      'publishedAt': 1692224778,
    }, {
      'id':
        'lemmy-myuser-mycolumn-e5cb4d4594ce7d19987fd42ca1dd837f-08bb1f161a61a21a47457171e25c3fd1',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'lemmy-myuser-mycolumn-e5cb4d4594ce7d19987fd42ca1dd837f',
      'title': 'Cop car forgot how stop signs work',
      'link': 'https://lemmy.world/post/3303348',
      'media': 'https://i.imgur.com/hsaoKWm.mp4',
      'description':
        'submitted by <a href="https://lemmy.world/u/LazaroFilm">LazaroFilm</a> to <a href="https://lemmy.world/c/idiotsincars">idiotsincars</a><br>49 points | <a href="https://lemmy.world/post/3303348">4 comments</a><br><a href="https://i.imgur.com/hsaoKWm.mp4">https://i.imgur.com/hsaoKWm.mp4</a>',
      'author': 'https://lemmy.world/u/LazaroFilm',
      'publishedAt': 1692224318,
    }, {
      'id':
        'lemmy-myuser-mycolumn-e5cb4d4594ce7d19987fd42ca1dd837f-a567cf7498d0506a2f8a954354aa95c0',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'lemmy-myuser-mycolumn-e5cb4d4594ce7d19987fd42ca1dd837f',
      'title': 'Honey, I forgot the KeÅŸkek',
      'link': 'https://lemmy.world/post/2916600',
      'media': 'https://i.imgur.com/lXKg8Gn.mp4',
      'description':
        'submitted by <a href="https://lemm.ee/u/SuperSleuth">SuperSleuth</a> to <a href="https://lemmy.world/c/idiotsincars">idiotsincars</a><br>108 points | <a href="https://lemmy.world/post/2916600">5 comments</a><br><a href="https://i.imgur.com/lXKg8Gn.mp4">https://i.imgur.com/lXKg8Gn.mp4</a><p>A seven car pileup during a wedding convoy in Denizli, Turkey. Click <a href="https://imgur.com/a/XzQ2rCD">here</a> if you canâ€™t see the video.</p>',
      'author': 'https://lemm.ee/u/SuperSleuth',
      'publishedAt': 1691587204,
    }, {
      'id':
        'lemmy-myuser-mycolumn-e5cb4d4594ce7d19987fd42ca1dd837f-ad7fbbbe7e47d9ca72aded5c66ab5bde',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'lemmy-myuser-mycolumn-e5cb4d4594ce7d19987fd42ca1dd837f',
      'title':
        'BMW unexpectedly using blinkers before brake checking cargo truck [YT original in post]',
      'link': 'https://lemmy.world/post/2370743',
      'media': 'http://regna.nu/7u70dz.gif',
      'description':
        'submitted by <a href="https://lemmy.world/u/Regna">Regna</a> to <a href="https://lemmy.world/c/idiotsincars">idiotsincars</a><br>91 points | <a href="https://lemmy.world/post/2370743">11 comments</a><br><a href="http://regna.nu/7u70dz.gif">http://regna.nu/7u70dz.gif</a><p><em>Edit: Changed link for the pic to another site</em></p>\n<p>The guy behind <a href="https://www.youtube.com/@truckdriver1982">Trucker Dashcam // Sweden</a> is one of the nicest truckers Iâ€™ve ever heard of. He mainly does dashcam compilations nowadays, and includes videos from friends and subscibers as well.</p>\n<ul>\n<li>Original video is at: <a href="https://www.youtube.com/watch?v=6HivZOJ4-K4">Trucker Dashcam // Sweden</a></li>\n<li>Here is <a href="https://www.youtube.com/watch?v=6HivZOJ4-K4&t=55s">time when the BMW turns up</a></li>\n<li>Here is a <a href="https://piped.video/channel/UCfV0wtzumYCRuvLhY5n6hug">Piped link to the channel</a></li>\n</ul>',
      'author': 'https://lemmy.world/u/Regna',
      'publishedAt': 1690712351,
    }]);
  } finally {
    fetchWithTimeoutSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      'https://lemmy.world/feeds/c/idiotsincars.xml?sort=New',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseCommunityIIC, { status: 200 }));
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
});
