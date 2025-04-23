import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from "https://deno.land/std@0.208.0/testing/mock.ts";

import { ISource } from "../models/source.ts";
import { IProfile } from "../models/profile.ts";
import { getMastodonFeed } from "./mastodon.ts";
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

const responseTag = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:media="http://search.yahoo.com/mrss/" xmlns:webfeeds="http://webfeeds.org/rss/1.0" version="2.0">
   <channel>
      <title>#kubernetes</title>
      <description>Public posts tagged #kubernetes</description>
      <link>https://hachyderm.io/tags/kubernetes</link>
      <lastBuildDate>Fri, 08 Dec 2023 12:52:54 +0000</lastBuildDate>
      <generator>Mastodon v4.2.1</generator>
      <item>
         <guid isPermaLink="true">https://ioc.exchange/@jon404/111544891736153138</guid>
         <link>https://ioc.exchange/@jon404/111544891736153138</link>
         <pubDate>Fri, 08 Dec 2023 12:52:54 +0000</pubDate>
         <description>&lt;p&gt;Shameless blog series plug&lt;/p&gt;&lt;hr&gt;&lt;p&gt;If you're in to &lt;a href="https://ioc.exchange/tags/kubernetes" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;kubernetes&lt;/span&gt;&lt;/a&gt; and &lt;a href="https://ioc.exchange/tags/homelab" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;homelab&lt;/span&gt;&lt;/a&gt; setups, I've started a blog series at LQ.org that will cover the &lt;a href="https://ioc.exchange/tags/virtualization" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;virtualization&lt;/span&gt;&lt;/a&gt;, network integration, and &lt;a href="https://ioc.exchange/tags/selfhosted" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;selfhosted&lt;/span&gt;&lt;/a&gt; apps I'll be running in my on-prem mini k8s cluster.  &lt;/p&gt;&lt;p&gt;I'm planning on running Alpine/Xen on refurbished desktop machines, with Debian VMs/k8s-1.28 and MetalLB/Calico for integrating into my &lt;a href="https://ioc.exchange/tags/OpenBSD" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;OpenBSD&lt;/span&gt;&lt;/a&gt; / &lt;a href="https://ioc.exchange/tags/BGP" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;BGP&lt;/span&gt;&lt;/a&gt; / &lt;a href="https://ioc.exchange/tags/OSPF" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;OSPF&lt;/span&gt;&lt;/a&gt; network backbone.&lt;/p&gt;&lt;p&gt;&lt;a href="https://www.linuxquestions.org/questions/blog/rocket357-328529/on-premise-kubernetes-part-1-5-39090/" rel="nofollow noopener noreferrer" translate="no" target="_blank"&gt;&lt;span class="invisible"&gt;https://www.&lt;/span&gt;&lt;span class="ellipsis"&gt;linuxquestions.org/questions/b&lt;/span&gt;&lt;span class="invisible"&gt;log/rocket357-328529/on-premise-kubernetes-part-1-5-39090/&lt;/span&gt;&lt;/a&gt;&lt;/p&gt;</description>
         <category>kubernetes</category>
         <category>homelab</category>
         <category>selfhosted</category>
         <category>openbsd</category>
         <category>bgp</category>
         <category>ospf</category>
         <category>virtualization</category>
      </item>
      <item>
         <guid isPermaLink="true">https://botsin.space/@k8s_releases/111544452566443481</guid>
         <link>https://botsin.space/@k8s_releases/111544452566443481</link>
         <pubDate>Fri, 08 Dec 2023 11:01:13 +0000</pubDate>
         <description>&lt;p&gt;New Kubernetes Release Candidate Release&lt;/p&gt;&lt;p&gt;✨ Kubernetes v1.29.0-rc.2 ✨&lt;/p&gt;&lt;p&gt;&lt;a href="https://github.com/kubernetes/kubernetes/releases/tag/v1.29.0-rc.2" rel="nofollow noopener noreferrer" target="_blank"&gt;&lt;span class="invisible"&gt;https://&lt;/span&gt;&lt;span class="ellipsis"&gt;github.com/kubernetes/kubernet&lt;/span&gt;&lt;span class="invisible"&gt;es/releases/tag/v1.29.0-rc.2&lt;/span&gt;&lt;/a&gt;&lt;/p&gt;&lt;p&gt;&lt;a href="https://botsin.space/tags/Kubernetes" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;Kubernetes&lt;/span&gt;&lt;/a&gt; &lt;a href="https://botsin.space/tags/k8s" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;k8s&lt;/span&gt;&lt;/a&gt; &lt;a href="https://botsin.space/tags/kube" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;kube&lt;/span&gt;&lt;/a&gt;&lt;/p&gt;</description>
         <category>kubernetes</category>
         <category>k8s</category>
         <category>kube</category>
      </item>
      <item>
         <guid isPermaLink="true">https://vmst.io/@ErikBussink/111544298911638567</guid>
         <link>https://vmst.io/@ErikBussink/111544298911638567</link>
         <pubDate>Fri, 08 Dec 2023 10:22:08 +0000</pubDate>
         <description>&lt;p&gt;Plan for the weekend&lt;br&gt;- Deploy the add-on TPM2 keys on 4 supermicro servers and enable the encryption service on my &lt;a href="https://vmst.io/tags/vSphere" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;vSphere&lt;/span&gt;&lt;/a&gt; cluster&lt;br&gt;- Attach some Tigo solar optimizer on some solar panels&lt;br&gt;- deploy a new set of NSX ALB load-balancer VM for integration in &lt;a href="https://vmst.io/tags/NSX" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;NSX&lt;/span&gt;&lt;/a&gt; for &lt;a href="https://vmst.io/tags/kubernetes" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;kubernetes&lt;/span&gt;&lt;/a&gt; &lt;br&gt;&lt;a href="https://vmst.io/tags/HomeDC" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;HomeDC&lt;/span&gt;&lt;/a&gt; &lt;a href="https://vmst.io/tags/homelab" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;homelab&lt;/span&gt;&lt;/a&gt;&lt;/p&gt;</description>
         <category>vSphere</category>
         <category>nsx</category>
         <category>kubernetes</category>
         <category>homedc</category>
         <category>homelab</category>
      </item>
      <item>
         <guid isPermaLink="true">https://fosstodon.org/@imdciangot/111544228725688234</guid>
         <link>https://fosstodon.org/@imdciangot/111544228725688234</link>
         <pubDate>Fri, 08 Dec 2023 10:04:17 +0000</pubDate>
         <description>&lt;p&gt;&#x1f680; ALERT: Seamlessly Access HPC Resources, possible addictive &#x1f680;&lt;/p&gt;&lt;p&gt;The Interlink project aims to bridge the gap between Kubernetes and HPC environments, enabling seamless access to world-class HPC centers, all within the familiar context of cloud-based computing interfaces.&lt;/p&gt;&lt;p&gt;Learn how with this first demo, and join the SciGeeks crew for more!&lt;/p&gt;&lt;p&gt;&lt;a href="https://youtu.be/-djIQGPvYdI?si=wBPHbz3iu7A3qOSx" rel="nofollow noopener noreferrer" translate="no" target="_blank"&gt;&lt;span class="invisible"&gt;https://&lt;/span&gt;&lt;span class="ellipsis"&gt;youtu.be/-djIQGPvYdI?si=wBPHbz&lt;/span&gt;&lt;span class="invisible"&gt;3iu7A3qOSx&lt;/span&gt;&lt;/a&gt;&lt;/p&gt;&lt;p&gt;Super early stage of this adventure, give feedback!&lt;/p&gt;&lt;p&gt;&lt;a href="https://fosstodon.org/tags/kubernetes" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;kubernetes&lt;/span&gt;&lt;/a&gt; &lt;a href="https://fosstodon.org/tags/HPC" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;HPC&lt;/span&gt;&lt;/a&gt; &lt;a href="https://fosstodon.org/tags/DistributedComputing" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;DistributedComputing&lt;/span&gt;&lt;/a&gt; &lt;a href="https://fosstodon.org/tags/Research" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;Research&lt;/span&gt;&lt;/a&gt; &lt;a href="https://fosstodon.org/tags/ai" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;ai&lt;/span&gt;&lt;/a&gt; &lt;a href="https://fosstodon.org/tags/digitaltwins" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank"&gt;#&lt;span&gt;digitaltwins&lt;/span&gt;&lt;/a&gt;&lt;/p&gt;</description>
         <media:content url="https://media.hachyderm.io/cache/media_attachments/files/111/544/228/748/711/741/original/84994e14c0b7384e.png" type="image/png" fileSize="965382" medium="image">
            <media:rating scheme="urn:simple">nonadult</media:rating>
         </media:content>
         <category>kubernetes</category>
         <category>hpc</category>
         <category>distributedcomputing</category>
         <category>research</category>
         <category>ai</category>
         <category>digitaltwins</category>
      </item>
   </channel>
</rss>`;

const responseUser = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:media="http://search.yahoo.com/mrss/" xmlns:webfeeds="http://webfeeds.org/rss/1.0" version="2.0">
   <channel>
      <title>Rico Berger</title>
      <description>Public posts from @ricoberger@hachyderm.io</description>
      <link>https://hachyderm.io/@ricoberger</link>
      <image>
         <url>https://media.hachyderm.io/accounts/avatars/109/773/619/675/865/785/original/bf731ded4166a661.png</url>
         <title>Rico Berger</title>
         <link>https://hachyderm.io/@ricoberger</link>
      </image>
      <lastBuildDate>Sun, 29 Jan 2023 17:56:17 +0000</lastBuildDate>
      <webfeeds:icon>https://media.hachyderm.io/accounts/avatars/109/773/619/675/865/785/original/bf731ded4166a661.png</webfeeds:icon>
      <generator>Mastodon v4.2.1</generator>
      <item>
         <guid isPermaLink="true">https://hachyderm.io/@ricoberger/109773781555026547</guid>
         <link>https://hachyderm.io/@ricoberger/109773781555026547</link>
         <pubDate>Sun, 29 Jan 2023 17:56:17 +0000</pubDate>
         <description>&lt;p&gt;&#x1f389;&#x1f389;&#x1f389; kubenav v4 the &lt;a href="https://hachyderm.io/tags/kubernetes" class="mention hashtag" rel="tag"&gt;#&lt;span&gt;kubernetes&lt;/span&gt;&lt;/a&gt; dashboard for iOS and Android is now available &lt;a href="https://kubenav.io" target="_blank" rel="nofollow noopener noreferrer" translate="no"&gt;&lt;span class="invisible"&gt;https://&lt;/span&gt;&lt;span class=""&gt;kubenav.io&lt;/span&gt;&lt;span class="invisible"&gt;&lt;/span&gt;&lt;/a&gt; &#x1f973;&#x1f973;&#x1f973;&lt;/p&gt;</description>
         <media:content url="https://media.hachyderm.io/media_attachments/files/109/773/779/869/674/363/original/ac40bbbaa3710aa1.png" type="image/png" fileSize="204505" medium="image">
            <media:rating scheme="urn:simple">nonadult</media:rating>
         </media:content>
         <media:content url="https://media.hachyderm.io/media_attachments/files/109/773/779/875/654/377/original/c0147e5b7f00c319.png" type="image/png" fileSize="183170" medium="image">
            <media:rating scheme="urn:simple">nonadult</media:rating>
         </media:content>
         <media:content url="https://media.hachyderm.io/media_attachments/files/109/773/779/881/805/268/original/352c2b12ba3611ef.png" type="image/png" fileSize="289689" medium="image">
            <media:rating scheme="urn:simple">nonadult</media:rating>
         </media:content>
         <media:content url="https://media.hachyderm.io/media_attachments/files/109/773/779/882/749/096/original/ce2283bdeb25b07f.png" type="image/png" fileSize="290752" medium="image">
            <media:rating scheme="urn:simple">nonadult</media:rating>
         </media:content>
         <category>kubernetes</category>
      </item>
   </channel>
</rss>`;

Deno.test("getMastodonFeed - Tag", async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    "fetchWithTimeout",
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responseTag, { status: 200 }));
      }),
    ]),
  );

  try {
    const { source, items } = await getMastodonFeed(
      supabaseClient,
      undefined,
      mockProfile,
      {
        ...mockSource,
        options: { mastodon: "https://hachyderm.io/tags/Kubernetes" },
      },
      undefined,
    );
    feedutils.assertEqualsSource(source, {
      id: "mastodon-myuser-mycolumn-91151e10882e4fff432ff509b8c6b027",
      columnId: "mycolumn",
      userId: "myuser",
      type: "mastodon",
      title: "#kubernetes",
      options: { mastodon: "https://hachyderm.io/tags/Kubernetes.rss" },
      link: "https://hachyderm.io/tags/kubernetes",
    });
    feedutils.assertEqualsItems(items, [
      {
        id: "mastodon-myuser-mycolumn-91151e10882e4fff432ff509b8c6b027-5abb9cbadfb77c35a46b5c21fa96622e",
        userId: "myuser",
        columnId: "mycolumn",
        sourceId: "mastodon-myuser-mycolumn-91151e10882e4fff432ff509b8c6b027",
        title: "",
        link: "https://ioc.exchange/@jon404/111544891736153138",
        description:
          '<p>Shameless blog series plug</p><hr><p>If you\'re in to <a href="https://ioc.exchange/tags/kubernetes" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>kubernetes</span></a> and <a href="https://ioc.exchange/tags/homelab" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>homelab</span></a> setups, I\'ve started a blog series at LQ.org that will cover the <a href="https://ioc.exchange/tags/virtualization" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>virtualization</span></a>, network integration, and <a href="https://ioc.exchange/tags/selfhosted" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>selfhosted</span></a> apps I\'ll be running in my on-prem mini k8s cluster.  </p><p>I\'m planning on running Alpine/Xen on refurbished desktop machines, with Debian VMs/k8s-1.28 and MetalLB/Calico for integrating into my <a href="https://ioc.exchange/tags/OpenBSD" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>OpenBSD</span></a> / <a href="https://ioc.exchange/tags/BGP" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>BGP</span></a> / <a href="https://ioc.exchange/tags/OSPF" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>OSPF</span></a> network backbone.</p><p><a href="https://www.linuxquestions.org/questions/blog/rocket357-328529/on-premise-kubernetes-part-1-5-39090/" rel="nofollow noopener noreferrer" translate="no" target="_blank"><span class="invisible">https://www.</span><span class="ellipsis">linuxquestions.org/questions/b</span><span class="invisible">log/rocket357-328529/on-premise-kubernetes-part-1-5-39090/</span></a></p>',
        author: "@jon404@ioc.exchange",
        publishedAt: 1702039974,
      },
      {
        id: "mastodon-myuser-mycolumn-91151e10882e4fff432ff509b8c6b027-0ef142642e2dfd8cf186543d81e2b89c",
        userId: "myuser",
        columnId: "mycolumn",
        sourceId: "mastodon-myuser-mycolumn-91151e10882e4fff432ff509b8c6b027",
        title: "",
        link: "https://botsin.space/@k8s_releases/111544452566443481",
        description:
          '<p>New Kubernetes Release Candidate Release</p><p>✨ Kubernetes v1.29.0-rc.2 ✨</p><p><a href="https://github.com/kubernetes/kubernetes/releases/tag/v1.29.0-rc.2" rel="nofollow noopener noreferrer" target="_blank"><span class="invisible">https://</span><span class="ellipsis">github.com/kubernetes/kubernet</span><span class="invisible">es/releases/tag/v1.29.0-rc.2</span></a></p><p><a href="https://botsin.space/tags/Kubernetes" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>Kubernetes</span></a> <a href="https://botsin.space/tags/k8s" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>k8s</span></a> <a href="https://botsin.space/tags/kube" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>kube</span></a></p>',
        author: "@k8s_releases@botsin.space",
        publishedAt: 1702033273,
      },
      {
        id: "mastodon-myuser-mycolumn-91151e10882e4fff432ff509b8c6b027-ab07d25df9ede52a07a36c203261bef4",
        userId: "myuser",
        columnId: "mycolumn",
        sourceId: "mastodon-myuser-mycolumn-91151e10882e4fff432ff509b8c6b027",
        title: "",
        link: "https://vmst.io/@ErikBussink/111544298911638567",
        description:
          '<p>Plan for the weekend<br>- Deploy the add-on TPM2 keys on 4 supermicro servers and enable the encryption service on my <a href="https://vmst.io/tags/vSphere" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>vSphere</span></a> cluster<br>- Attach some Tigo solar optimizer on some solar panels<br>- deploy a new set of NSX ALB load-balancer VM for integration in <a href="https://vmst.io/tags/NSX" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>NSX</span></a> for <a href="https://vmst.io/tags/kubernetes" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>kubernetes</span></a> <br><a href="https://vmst.io/tags/HomeDC" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>HomeDC</span></a> <a href="https://vmst.io/tags/homelab" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>homelab</span></a></p>',
        author: "@ErikBussink@vmst.io",
        publishedAt: 1702030928,
      },
      {
        id: "mastodon-myuser-mycolumn-91151e10882e4fff432ff509b8c6b027-5c1055543a76a190ae210057583b2225",
        userId: "myuser",
        columnId: "mycolumn",
        sourceId: "mastodon-myuser-mycolumn-91151e10882e4fff432ff509b8c6b027",
        title: "",
        link: "https://fosstodon.org/@imdciangot/111544228725688234",
        options: {
          media: [
            "https://media.hachyderm.io/cache/media_attachments/files/111/544/228/748/711/741/original/84994e14c0b7384e.png",
          ],
        },
        description:
          '<p>&#x1f680; ALERT: Seamlessly Access HPC Resources, possible addictive &#x1f680;</p><p>The Interlink project aims to bridge the gap between Kubernetes and HPC environments, enabling seamless access to world-class HPC centers, all within the familiar context of cloud-based computing interfaces.</p><p>Learn how with this first demo, and join the SciGeeks crew for more!</p><p><a href="https://youtu.be/-djIQGPvYdI?si=wBPHbz3iu7A3qOSx" rel="nofollow noopener noreferrer" translate="no" target="_blank"><span class="invisible">https://</span><span class="ellipsis">youtu.be/-djIQGPvYdI?si=wBPHbz</span><span class="invisible">3iu7A3qOSx</span></a></p><p>Super early stage of this adventure, give feedback!</p><p><a href="https://fosstodon.org/tags/kubernetes" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>kubernetes</span></a> <a href="https://fosstodon.org/tags/HPC" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>HPC</span></a> <a href="https://fosstodon.org/tags/DistributedComputing" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>DistributedComputing</span></a> <a href="https://fosstodon.org/tags/Research" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>Research</span></a> <a href="https://fosstodon.org/tags/ai" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>ai</span></a> <a href="https://fosstodon.org/tags/digitaltwins" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>digitaltwins</span></a></p>',
        author: "@imdciangot@fosstodon.org",
        publishedAt: 1702029857,
      },
    ]);
  } finally {
    fetchWithTimeoutSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: ["https://hachyderm.io/tags/Kubernetes.rss", { method: "get" }, 5000],
    returned: new Promise((resolve) => {
      resolve(new Response(responseTag, { status: 200 }));
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
});

Deno.test("getMastodonFeed - User", async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    "fetchWithTimeout",
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responseUser, { status: 200 }));
      }),
    ]),
  );

  const uploadSourceIconSpy = stub(
    feedutils,
    "uploadSourceIcon",
    returnsNext([
      new Promise((resolve) => {
        resolve(
          "https://media.hachyderm.io/accounts/avatars/109/773/619/675/865/785/original/bf731ded4166a661.png",
        );
      }),
    ]),
  );

  try {
    const { source, items } = await getMastodonFeed(
      supabaseClient,
      undefined,
      mockProfile,
      { ...mockSource, options: { mastodon: "@ricoberger@hachyderm.io" } },
      undefined,
    );
    feedutils.assertEqualsSource(source, {
      id: "mastodon-myuser-mycolumn-5673bdae9d06a0744e93d647fe5cef2e",
      columnId: "mycolumn",
      userId: "myuser",
      type: "mastodon",
      title: "Rico Berger",
      options: { mastodon: "https://hachyderm.io/@ricoberger.rss" },
      link: "https://hachyderm.io/@ricoberger",
      icon: "https://media.hachyderm.io/accounts/avatars/109/773/619/675/865/785/original/bf731ded4166a661.png",
    });
    feedutils.assertEqualsItems(items, [
      {
        id: "mastodon-myuser-mycolumn-5673bdae9d06a0744e93d647fe5cef2e-576a014e46fbb2feae01d3143d1ec565",
        userId: "myuser",
        columnId: "mycolumn",
        sourceId: "mastodon-myuser-mycolumn-5673bdae9d06a0744e93d647fe5cef2e",
        title: "",
        link: "https://hachyderm.io/@ricoberger/109773781555026547",
        options: {
          media: [
            "https://media.hachyderm.io/media_attachments/files/109/773/779/869/674/363/original/ac40bbbaa3710aa1.png",
            "https://media.hachyderm.io/media_attachments/files/109/773/779/875/654/377/original/c0147e5b7f00c319.png",
            "https://media.hachyderm.io/media_attachments/files/109/773/779/881/805/268/original/352c2b12ba3611ef.png",
            "https://media.hachyderm.io/media_attachments/files/109/773/779/882/749/096/original/ce2283bdeb25b07f.png",
          ],
        },
        description:
          '<p>&#x1f389;&#x1f389;&#x1f389; kubenav v4 the <a href="https://hachyderm.io/tags/kubernetes" class="mention hashtag" rel="tag">#<span>kubernetes</span></a> dashboard for iOS and Android is now available <a href="https://kubenav.io" target="_blank" rel="nofollow noopener noreferrer" translate="no"><span class="invisible">https://</span><span class="">kubenav.io</span><span class="invisible"></span></a> &#x1f973;&#x1f973;&#x1f973;</p>',
        author: "@ricoberger@hachyderm.io",
        publishedAt: 1675014977,
      },
    ]);
  } finally {
    fetchWithTimeoutSpy.restore();
    uploadSourceIconSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: ["https://hachyderm.io/@ricoberger.rss", { method: "get" }, 5000],
    returned: new Promise((resolve) => {
      resolve(new Response(responseUser, { status: 200 }));
    }),
  });
  assertSpyCall(uploadSourceIconSpy, 0, {
    args: [
      supabaseClient,
      {
        id: "mastodon-myuser-mycolumn-5673bdae9d06a0744e93d647fe5cef2e",
        columnId: "mycolumn",
        userId: "myuser",
        type: "mastodon",
        title: "Rico Berger",
        options: { mastodon: "https://hachyderm.io/@ricoberger.rss" },
        link: "https://hachyderm.io/@ricoberger",
        icon: "https://media.hachyderm.io/accounts/avatars/109/773/619/675/865/785/original/bf731ded4166a661.png",
      },
    ],
    returned: new Promise((resolve) => {
      resolve(undefined);
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
  assertSpyCalls(uploadSourceIconSpy, 1);
});
