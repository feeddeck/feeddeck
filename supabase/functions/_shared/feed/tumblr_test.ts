import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from "https://deno.land/std@0.208.0/testing/mock.ts";

import { ISource } from "../models/source.ts";
import { IProfile } from "../models/profile.ts";
import { getTumblrFeed, isTumblrUrl } from "./tumblr.ts";
import { utils } from "../utils/index.ts";
import { feedutils } from "./utils/index.ts";

const supabaseClient = createClient("http://localhost:54321", "test123");
const mockProfile: IProfile = {
  id: "",
  tier: "free",
  createdAt: 0,
  updatedAt: 0,
};
const mockSource: ISource = {
  id: "",
  columnId: "mycolumn",
  userId: "myuser",
  type: "medium",
  title: "",
};

const response = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0">
   <channel>
      <description />
      <title>Today on Tumblr</title>
      <generator>Tumblr (3.0; @todayontumblr)</generator>
      <link>https://todayontumblr.tumblr.com/</link>
      <item>
         <title>NEIL WON BEST ACTOR AT THE GAME AWARDS!!!!!!</title>
         <description>&lt;p &gt;&lt;a class="tumblr_blog" href="https://argetcross.tumblr.com/post/736098070263218176/neil-won-best-actor-at-the-game-awards"&gt;argetcross &lt;/a &gt;:&lt;/p &gt;&lt;blockquote &gt;&lt;p &gt;NEIL WON BEST ACTOR AT THE GAME AWARDS!!!!!!&lt;/p &gt;&lt;div class="npf_row"&gt;&lt;figure class="tmblr-full" data-orig-height="945" data-orig-width="2048"&gt;&lt;img src="https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s640x960/b8e88192aa512164126093c75681143fe851fead.jpg" data-orig-height="945" data-orig-width="2048" srcset="https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s75x75_c1/eff71b743942cc3094990943933886d7d289ae2f.jpg 75w, https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s100x200/f0d8dc8bb82087bfd457f9fcc92e8ec0a2d79250.jpg 100w, https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s250x400/fa2684d74d1a1321c7bece3f6bd0caa40392c36d.jpg 250w, https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s400x600/b578a131611c62237a1403a081ae8dbf8bb57b72.jpg 400w, https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s500x750/bed251d1aef5fffcc65ea69f8a113d0a99585081.jpg 500w, https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s540x810/3daeb676fcf06741f47af8f7b910b8e8368622e1.jpg 540w, https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s640x960/b8e88192aa512164126093c75681143fe851fead.jpg 640w, https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s1280x1920/2da89407179aa94cd58b581a58944fc2160f9d56.jpg 1280w, https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s2048x3072/49b9d11b154993cad04a1e2c61071573e184002e.jpg 2048w" sizes="(max-width: 1280px) 100vw, 1280px"/&gt;&lt;/figure &gt;&lt;/div &gt;&lt;/blockquote &gt;</description>
         <link>https://www.tumblr.com/todayontumblr/736339394445918208</link>
         <guid>https://www.tumblr.com/todayontumblr/736339394445918208</guid>
         <pubDate>Sun, 10 Dec 2023 12:06:08 -0500</pubDate>
         <category>today on tumblr</category>
      </item>
      <item>
         <title>That &amp;rsquo;s why they were rushing everyone &amp;rsquo;s speeches cause Geoff wanted enough time to talk to his wife &amp;hellip;</title>
         <description>&lt;p &gt;&lt;a class="tumblr_blog" href="https://orallech.tumblr.com/post/736101836478611456/thats-why-they-were-rushing-everyones-speeches"&gt;orallech &lt;/a &gt;:&lt;/p &gt;&lt;blockquote &gt;&lt;p &gt;That’s why they were rushing everyone’s speeches cause Geoff wanted enough time to talk to his wife kojima &lt;/p &gt;&lt;/blockquote &gt;</description>
         <link>https://www.tumblr.com/todayontumblr/736335427403907072</link>
         <guid>https://www.tumblr.com/todayontumblr/736335427403907072</guid>
         <pubDate>Sun, 10 Dec 2023 11:03:05 -0500</pubDate>
         <category>today on tumblr</category>
      </item>
      <item>
         <title>Muppet Fact #925</title>
         <description>&lt;p &gt;&lt;a class="tumblr_blog" href="https://muppet-facts.tumblr.com/post/736100473317343232/muppet-fact-925"&gt;muppet-facts &lt;/a &gt;:&lt;/p &gt;&lt;blockquote &gt;&lt;p &gt;At the 2023 Game Awards, Gonzo presented the award for Best Debut Indie Game with Geoff Keighley. He said he &amp;rsquo;s been playing &lt;i &gt;Tears of the Kingdom &lt;/i &gt;. He lost days following a Cucco up the hill. He also has a conspiracy that a lot of games released this year follow a chicken theme. &lt;/p &gt;&lt;div class="npf_row"&gt;&lt;figure class="tmblr-full" data-orig-height="2160" data-orig-width="3840"&gt;&lt;img src="https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s640x960/de1345504db6ac2e012d6aef542489fbfd8a522b.png" data-orig-height="2160" data-orig-width="3840" srcset="https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s75x75_c1/24353b4aa077be11678ff83f73bcb2cdc02a0a82.png 75w, https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s100x200/f8bae9a792c7644dee26379f44fb8d36f476213d.png 100w, https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s250x400/f7d6d9833510950930a3e14e3bc345d067a30868.png 250w, https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s400x600/0a16568c844f59cf493607a1cd6a32899ca5cf47.png 400w, https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s500x750/c4635e448d70ab8200d5f29256a7153301a8e415.png 500w, https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s540x810/d1f17ba75dd935012801d629591ee480ce8eca49.png 540w, https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s640x960/de1345504db6ac2e012d6aef542489fbfd8a522b.png 640w, https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s1280x1920/f7849216be34e6744bcf83e8d06e306ef486d439.png 1280w, https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s2048x3072/673081b3df788fbe38d4237b236839f59ba339b8.png 2048w" sizes="(max-width: 1280px) 100vw, 1280px"/&gt;&lt;/figure &gt;&lt;figure class="tmblr-full" data-orig-height="1080" data-orig-width="1920"&gt;&lt;img src="https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s640x960/f0dfd4aa4229944da9b0e525e6c9a0ec89143373.png" data-orig-height="1080" data-orig-width="1920" srcset="https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s75x75_c1/0268965777520275909841726829a2571b4dd4b1.png 75w, https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s100x200/e3b79f463b947c8857dddceda099e4cfe6e53e9c.png 100w, https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s250x400/4eeb69a20d2872719cf1e2e28b54367d28a33114.png 250w, https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s400x600/445c4b2e690ae3075b362a105af9b4aa45adee88.png 400w, https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s500x750/30a34daebebee02fc501e9ca7361d6f3221ed856.png 500w, https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s540x810/29f17a07b007f7476d4a321a56a29f333c32b93e.png 540w, https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s640x960/f0dfd4aa4229944da9b0e525e6c9a0ec89143373.png 640w, https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s1280x1920/6b40fc10a77481213526f9f4412aca16bc0ce173.png 1280w, https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s2048x3072/286ccace479893c0e6a7803080132f3b7869b634.png 1920w" sizes="(max-width: 1280px) 100vw, 1280px"/&gt;&lt;/figure &gt;&lt;/div &gt;&lt;p &gt;&lt;b &gt;Source: &lt;/b &gt;&lt;/p &gt;&lt;p &gt;The Game Awards 2023. December 7, 2023. &lt;/p &gt;&lt;/blockquote &gt;</description>
         <link>https://www.tumblr.com/todayontumblr/736331601085120512</link>
         <guid>https://www.tumblr.com/todayontumblr/736331601085120512</guid>
         <pubDate>Sun, 10 Dec 2023 10:02:16 -0500</pubDate>
         <category>today on tumblr</category>
      </item>
      <item>
         <title>Hardest image in gaming culture</title>
         <description>&lt;p &gt;&lt;a class="tumblr_blog" href="https://www.tumblr.com/temperedknight/736102767863742464/hardest-image-in-gaming-culture"&gt;temperedknight &lt;/a &gt;:&lt;/p &gt;&lt;blockquote &gt;&lt;div class="npf_row"&gt;&lt;figure class="tmblr-full" data-orig-height="521" data-orig-width="1063"&gt;&lt;img src="https://64.media.tumblr.com/363392fc016d8c904fa3b86050b366a2/08a786e18a31fca4-84/s640x960/8ce0d3c4fa8efea0a196cb1921aa64cc43950f8d.png" data-orig-height="521" data-orig-width="1063" srcset="https://64.media.tumblr.com/363392fc016d8c904fa3b86050b366a2/08a786e18a31fca4-84/s75x75_c1/c86df7bd8018d29a3848bf9ebf68c645f3eb43ff.png 75w, https://64.media.tumblr.com/363392fc016d8c904fa3b86050b366a2/08a786e18a31fca4-84/s100x200/4d9c7c121ef92a8ba19983b2a5a56e5406a03e0c.png 100w, https://64.media.tumblr.com/363392fc016d8c904fa3b86050b366a2/08a786e18a31fca4-84/s250x400/2cf0925fa1dfd3fae5a991e88453f024be044f70.png 250w, https://64.media.tumblr.com/363392fc016d8c904fa3b86050b366a2/08a786e18a31fca4-84/s400x600/88f6685b3a8f0bafeb83ccb875d82d29269b268d.png 400w, https://64.media.tumblr.com/363392fc016d8c904fa3b86050b366a2/08a786e18a31fca4-84/s500x750/e084806a49fb3808cd10d8916bcaec53493fc181.png 500w, https://64.media.tumblr.com/363392fc016d8c904fa3b86050b366a2/08a786e18a31fca4-84/s540x810/4630feda50c2ec3c41a7d7413cae5f853cdb5034.png 540w, https://64.media.tumblr.com/363392fc016d8c904fa3b86050b366a2/08a786e18a31fca4-84/s640x960/8ce0d3c4fa8efea0a196cb1921aa64cc43950f8d.png 640w, https://64.media.tumblr.com/363392fc016d8c904fa3b86050b366a2/08a786e18a31fca4-84/s1280x1920/c48e8fb2dad3ff167d0a318025c6edfff19a49fc.png 1063w" sizes="(max-width: 1063px) 100vw, 1063px"/&gt;&lt;/figure &gt;&lt;/div &gt;&lt;p &gt;Hardest image in gaming culture &lt;/p &gt;&lt;/blockquote &gt;</description>
         <link>https://www.tumblr.com/todayontumblr/736327882138386432</link>
         <guid>https://www.tumblr.com/todayontumblr/736327882138386432</guid>
         <pubDate>Sun, 10 Dec 2023 09:03:09 -0500</pubDate>
         <category>today on tumblr</category>
      </item>
   </channel>
</rss>`;

Deno.test("isTumblrUrl", () => {
  assertEquals(isTumblrUrl("https://www.tumblr.com/todayontumblr"), true);
  assertEquals(isTumblrUrl("https://www.google.de/"), false);
});

Deno.test("getTumblrFeed", async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    "fetchWithTimeout",
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(response, { status: 200 }));
      }),
    ]),
  );

  try {
    const { source, items } = await getTumblrFeed(
      supabaseClient,
      undefined,
      mockProfile,
      {
        ...mockSource,
        options: { tumblr: "https://www.tumblr.com/todayontumblr" },
      },
      undefined,
    );
    feedutils.assertEqualsSource(source, {
      id: "tumblr-myuser-mycolumn-8ce77e730a91955cd991349d0d6bfb6c",
      columnId: "mycolumn",
      userId: "myuser",
      type: "tumblr",
      title: "Today on Tumblr",
      options: { tumblr: "https://todayontumblr.tumblr.com/rss" },
      link: "https://todayontumblr.tumblr.com/",
    });
    feedutils.assertEqualsItems(items, [
      {
        id: "tumblr-myuser-mycolumn-8ce77e730a91955cd991349d0d6bfb6c-cadfdb150b18480df6d781f845d0fec5",
        userId: "myuser",
        columnId: "mycolumn",
        sourceId: "tumblr-myuser-mycolumn-8ce77e730a91955cd991349d0d6bfb6c",
        title: "NEIL WON BEST ACTOR AT THE GAME AWARDS!!!!!!",
        link: "https://www.tumblr.com/todayontumblr/736339394445918208",
        media:
          "https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s640x960/b8e88192aa512164126093c75681143fe851fead.jpg",
        description:
          '<p ><a class="tumblr_blog" href="https://argetcross.tumblr.com/post/736098070263218176/neil-won-best-actor-at-the-game-awards">argetcross </a >:</p ><blockquote ><p >NEIL WON BEST ACTOR AT THE GAME AWARDS!!!!!!</p ><div class="npf_row"><figure class="tmblr-full" data-orig-height="945" data-orig-width="2048"><img src="https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s640x960/b8e88192aa512164126093c75681143fe851fead.jpg" data-orig-height="945" data-orig-width="2048" srcset="https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s75x75_c1/eff71b743942cc3094990943933886d7d289ae2f.jpg 75w, https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s100x200/f0d8dc8bb82087bfd457f9fcc92e8ec0a2d79250.jpg 100w, https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s250x400/fa2684d74d1a1321c7bece3f6bd0caa40392c36d.jpg 250w, https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s400x600/b578a131611c62237a1403a081ae8dbf8bb57b72.jpg 400w, https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s500x750/bed251d1aef5fffcc65ea69f8a113d0a99585081.jpg 500w, https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s540x810/3daeb676fcf06741f47af8f7b910b8e8368622e1.jpg 540w, https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s640x960/b8e88192aa512164126093c75681143fe851fead.jpg 640w, https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s1280x1920/2da89407179aa94cd58b581a58944fc2160f9d56.jpg 1280w, https://64.media.tumblr.com/3721ad004e334d62e290e5062a296566/a5567169c27bf241-f9/s2048x3072/49b9d11b154993cad04a1e2c61071573e184002e.jpg 2048w" sizes="(max-width: 1280px) 100vw, 1280px"/></figure ></div ></blockquote >',
        publishedAt: 1702227968,
      },
      {
        id: "tumblr-myuser-mycolumn-8ce77e730a91955cd991349d0d6bfb6c-9cab913d4df84b6a40d7f90de40e6b24",
        userId: "myuser",
        columnId: "mycolumn",
        sourceId: "tumblr-myuser-mycolumn-8ce77e730a91955cd991349d0d6bfb6c",
        title:
          "That &rsquo;s why they were rushing everyone &rsquo;s speeches cause Geoff wanted enough time to talk to his wife &hellip;",
        link: "https://www.tumblr.com/todayontumblr/736335427403907072",
        description:
          '<p ><a class="tumblr_blog" href="https://orallech.tumblr.com/post/736101836478611456/thats-why-they-were-rushing-everyones-speeches">orallech </a >:</p ><blockquote ><p >That’s why they were rushing everyone’s speeches cause Geoff wanted enough time to talk to his wife kojima </p ></blockquote >',
        publishedAt: 1702224185,
      },
      {
        id: "tumblr-myuser-mycolumn-8ce77e730a91955cd991349d0d6bfb6c-8c7e748f46996222cfbf724b7748be62",
        userId: "myuser",
        columnId: "mycolumn",
        sourceId: "tumblr-myuser-mycolumn-8ce77e730a91955cd991349d0d6bfb6c",
        title: "Muppet Fact #925",
        link: "https://www.tumblr.com/todayontumblr/736331601085120512",
        media:
          "https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s640x960/de1345504db6ac2e012d6aef542489fbfd8a522b.png",
        description:
          '<p ><a class="tumblr_blog" href="https://muppet-facts.tumblr.com/post/736100473317343232/muppet-fact-925">muppet-facts </a >:</p ><blockquote ><p >At the 2023 Game Awards, Gonzo presented the award for Best Debut Indie Game with Geoff Keighley. He said he &rsquo;s been playing <i >Tears of the Kingdom </i >. He lost days following a Cucco up the hill. He also has a conspiracy that a lot of games released this year follow a chicken theme. </p ><div class="npf_row"><figure class="tmblr-full" data-orig-height="2160" data-orig-width="3840"><img src="https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s640x960/de1345504db6ac2e012d6aef542489fbfd8a522b.png" data-orig-height="2160" data-orig-width="3840" srcset="https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s75x75_c1/24353b4aa077be11678ff83f73bcb2cdc02a0a82.png 75w, https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s100x200/f8bae9a792c7644dee26379f44fb8d36f476213d.png 100w, https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s250x400/f7d6d9833510950930a3e14e3bc345d067a30868.png 250w, https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s400x600/0a16568c844f59cf493607a1cd6a32899ca5cf47.png 400w, https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s500x750/c4635e448d70ab8200d5f29256a7153301a8e415.png 500w, https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s540x810/d1f17ba75dd935012801d629591ee480ce8eca49.png 540w, https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s640x960/de1345504db6ac2e012d6aef542489fbfd8a522b.png 640w, https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s1280x1920/f7849216be34e6744bcf83e8d06e306ef486d439.png 1280w, https://64.media.tumblr.com/7338226115b70192b7b37dae667dc0b3/217c86a94d5179ce-1e/s2048x3072/673081b3df788fbe38d4237b236839f59ba339b8.png 2048w" sizes="(max-width: 1280px) 100vw, 1280px"/></figure ><figure class="tmblr-full" data-orig-height="1080" data-orig-width="1920"><img src="https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s640x960/f0dfd4aa4229944da9b0e525e6c9a0ec89143373.png" data-orig-height="1080" data-orig-width="1920" srcset="https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s75x75_c1/0268965777520275909841726829a2571b4dd4b1.png 75w, https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s100x200/e3b79f463b947c8857dddceda099e4cfe6e53e9c.png 100w, https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s250x400/4eeb69a20d2872719cf1e2e28b54367d28a33114.png 250w, https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s400x600/445c4b2e690ae3075b362a105af9b4aa45adee88.png 400w, https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s500x750/30a34daebebee02fc501e9ca7361d6f3221ed856.png 500w, https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s540x810/29f17a07b007f7476d4a321a56a29f333c32b93e.png 540w, https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s640x960/f0dfd4aa4229944da9b0e525e6c9a0ec89143373.png 640w, https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s1280x1920/6b40fc10a77481213526f9f4412aca16bc0ce173.png 1280w, https://64.media.tumblr.com/4175b0d1d5a1b0fd5c0fe1bfe7b50c03/217c86a94d5179ce-c1/s2048x3072/286ccace479893c0e6a7803080132f3b7869b634.png 1920w" sizes="(max-width: 1280px) 100vw, 1280px"/></figure ></div ><p ><b >Source: </b ></p ><p >The Game Awards 2023. December 7, 2023. </p ></blockquote >',
        publishedAt: 1702220536,
      },
      {
        id: "tumblr-myuser-mycolumn-8ce77e730a91955cd991349d0d6bfb6c-eb92be444fd1f7418a53a146c4b6366c",
        userId: "myuser",
        columnId: "mycolumn",
        sourceId: "tumblr-myuser-mycolumn-8ce77e730a91955cd991349d0d6bfb6c",
        title: "Hardest image in gaming culture",
        link: "https://www.tumblr.com/todayontumblr/736327882138386432",
        media:
          "https://64.media.tumblr.com/363392fc016d8c904fa3b86050b366a2/08a786e18a31fca4-84/s640x960/8ce0d3c4fa8efea0a196cb1921aa64cc43950f8d.png",
        description:
          '<p ><a class="tumblr_blog" href="https://www.tumblr.com/temperedknight/736102767863742464/hardest-image-in-gaming-culture">temperedknight </a >:</p ><blockquote ><div class="npf_row"><figure class="tmblr-full" data-orig-height="521" data-orig-width="1063"><img src="https://64.media.tumblr.com/363392fc016d8c904fa3b86050b366a2/08a786e18a31fca4-84/s640x960/8ce0d3c4fa8efea0a196cb1921aa64cc43950f8d.png" data-orig-height="521" data-orig-width="1063" srcset="https://64.media.tumblr.com/363392fc016d8c904fa3b86050b366a2/08a786e18a31fca4-84/s75x75_c1/c86df7bd8018d29a3848bf9ebf68c645f3eb43ff.png 75w, https://64.media.tumblr.com/363392fc016d8c904fa3b86050b366a2/08a786e18a31fca4-84/s100x200/4d9c7c121ef92a8ba19983b2a5a56e5406a03e0c.png 100w, https://64.media.tumblr.com/363392fc016d8c904fa3b86050b366a2/08a786e18a31fca4-84/s250x400/2cf0925fa1dfd3fae5a991e88453f024be044f70.png 250w, https://64.media.tumblr.com/363392fc016d8c904fa3b86050b366a2/08a786e18a31fca4-84/s400x600/88f6685b3a8f0bafeb83ccb875d82d29269b268d.png 400w, https://64.media.tumblr.com/363392fc016d8c904fa3b86050b366a2/08a786e18a31fca4-84/s500x750/e084806a49fb3808cd10d8916bcaec53493fc181.png 500w, https://64.media.tumblr.com/363392fc016d8c904fa3b86050b366a2/08a786e18a31fca4-84/s540x810/4630feda50c2ec3c41a7d7413cae5f853cdb5034.png 540w, https://64.media.tumblr.com/363392fc016d8c904fa3b86050b366a2/08a786e18a31fca4-84/s640x960/8ce0d3c4fa8efea0a196cb1921aa64cc43950f8d.png 640w, https://64.media.tumblr.com/363392fc016d8c904fa3b86050b366a2/08a786e18a31fca4-84/s1280x1920/c48e8fb2dad3ff167d0a318025c6edfff19a49fc.png 1063w" sizes="(max-width: 1063px) 100vw, 1063px"/></figure ></div ><p >Hardest image in gaming culture </p ></blockquote >',
        publishedAt: 1702216989,
      },
    ]);
  } finally {
    fetchWithTimeoutSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: ["https://todayontumblr.tumblr.com/rss", { method: "get" }, 5000],
    returned: new Promise((resolve) => {
      resolve(new Response(response, { status: 200 }));
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
});
