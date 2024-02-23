import { createClient } from '@supabase/supabase-js';
import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from 'std/testing/mock';

import { ISource } from '../models/source.ts';
import { IProfile } from '../models/profile.ts';
import { getPodcastFeed } from './podcast.ts';
import { utils } from '../utils/index.ts';
import { feedutils } from './utils/index.ts';
import { assertEqualsItems, assertEqualsSource } from './utils/test.ts';

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

const responsePodcastRSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:cc="http://web.resource.org/cc/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:googleplay="http://www.google.com/schemas/play-podcasts/1.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:media="http://search.yahoo.com/mrss/" xmlns:podcast="https://podcastindex.org/namespace/1.0" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" version="2.0">
   <channel>
      <atom:link href="https://feeds.libsyn.com/419861/rss" rel="self" type="application/rss+xml" />
      <title>Kubernetes Podcast from Google</title>
      <pubDate>Tue, 05 Dec 2023 23:37:00 +0000</pubDate>
      <lastBuildDate>Wed, 06 Dec 2023 09:03:41 +0000</lastBuildDate>
      <generator>Libsyn WebEngine 2.0</generator>
      <link>https://kubernetespodcast.com</link>
      <language>en-us</language>
      <copyright><![CDATA[This work is licensed under a Creative Commons License - Attribution-NonCommercial-NoDerivatives 4.0 International - http://creativecommons.org/licenses/by-nc-nd/4.0/]]></copyright>
      <docs>https://kubernetespodcast.com</docs>
      <managingEditor>kubernetespodcast@google.com (kubernetespodcast@google.com)</managingEditor>
      <itunes:summary><![CDATA[A weekly podcast focused on what's happening in the Kubernetes community hosted by Abdel Sghiouar and Kaslin Fields. We cover Kubernetes, cloud-native applications, and other developments in the ecosystem. Abdel and Kaslin on Twitter at @KubernetesPod or by email at kubernetespodcast@google.com.]]></itunes:summary>
      <image>
         <url>https://static.libsyn.com/p/assets/7/2/d/d/72ddd143dc0d42c316c3140a3186d450/Kubernetes-Podcast-Logo_1400x1400.png</url>
         <title>Kubernetes Podcast from Google</title>
         <link><![CDATA[https://kubernetespodcast.com]]></link>
      </image>
      <itunes:author>Abdel Sghiouar, Kaslin Fields</itunes:author>
      <itunes:category text="News">
         <itunes:category text="Tech News" />
      </itunes:category>
      <itunes:category text="Technology" />
      <itunes:image href="https://static.libsyn.com/p/assets/7/2/d/d/72ddd143dc0d42c316c3140a3186d450/Kubernetes-Podcast-Logo_1400x1400.png" />
      <itunes:explicit>false</itunes:explicit>
      <itunes:owner>
         <itunes:name><![CDATA[Kubernetes Podcast from Google]]></itunes:name>
         <itunes:email>kubernetespodcast@google.com</itunes:email>
      </itunes:owner>
      <description><![CDATA[A weekly podcast focused on what's happening in the Kubernetes community hosted by Abdel Sghiouar and Kaslin Fields. We cover Kubernetes, cloud-native applications, and other developments in the ecosystem. Abdel and Kaslin on Twitter at @KubernetesPod or by email at kubernetespodcast@google.com.]]></description>
      <itunes:type>episodic</itunes:type>
      <!-- START CHANNEL EXTRA TAGS -->
      <itunes:new-feed-url>https://feeds.libsyn.com/419861/rss</itunes:new-feed-url>
      <!-- CLOSE CHANNEL EXTRA TAGS -->
      <podcast:locked owner="kubernetespodcast@google.com">no</podcast:locked>
      <item>
         <title>KubeCon NA 2023</title>
         <itunes:title>KubeCon NA 2023</itunes:title>
         <pubDate>Tue, 05 Dec 2023 23:37:00 +0000</pubDate>
         <guid isPermaLink="false"><![CDATA[5f0f56c3-6ba9-4479-9eff-c1a23d058e06]]></guid>
         <link><![CDATA[http://sites.libsyn.com/419861/kubecon-na-2023]]></link>
         <itunes:image href="https://static.libsyn.com/p/assets/3/1/3/a/313a88f0d39a0ede88c4a68c3ddbc4f2/NewKPodRoboWhite_2-20231205-ukhaijcnr3.png" />
         <description><![CDATA[<p dir="ltr">This episode Kaslin went to KubeCon North America In Chicago. She spoke to folks on the ground, asked them about their impressions of the conference, and collected a bunch of cool responses.</p> <p dir="ltr">Do you have something cool to share? Some questions? Let us know:</p> <p dir="ltr">- web: <a href= "https://kubernetespodcast.com">kubernetespodcast.com</a></p> <p dir="ltr">- mail: <a href= "mailto:kubernetespodcast@google.com">kubernetespodcast@google.com</a></p> <p dir="ltr">- twitter: <a href= "https://twitter.com/kubernetespod">@kubernetespod</a></p> <h2 dir="ltr">News of the week</h2> <p dir="ltr"><a href= "https://cloud.google.com/blog/products/identity-security/google-researchers-discover-reptar-a-new-cpu-vulnerability"> Google researchers discover 'Reptar,’ a new CPU vulnerability</a></p> <p dir="ltr"><a href= "https://lock.cmpxchg8b.com/reptar.html">Reptar by Tavis Ormandy</a></p> <p dir="ltr"><a href= "https://thenewstack.io/tim-hockin-kubernetes-needs-a-complexity-budget/"> Tim Hockin: Kubernetes Needs a Complexity Budget</a></p> <p dir="ltr"><a href= "https://www.theregister.com/2023/11/13/kubernetes_tim_hockin_on_ai/"> Kubernetes' Tim Hockin on a decade of dominance and the future of AI in open source</a> </p> <p dir="ltr"><a href= "https://www.youtube.com/watch?v=WqeShpaztZY&list=PLj6h78yzYM2MYc0X1465RzF_7Cqf7bnqL&index=19"> Keynote: A Vision for Vision - Kubernetes in Its Second Decade - Tim Hockin</a></p> <p dir="ltr"><a href= "https://github.com/cncf/tag-security/blob/main/assessments/Open_and_Secure.pdf"> Open and Secure: A Manual for Practicing Thread Modeling to Assess and Fortify Open Source and Security</a></p> <p dir="ltr"><a href= "https://www.cncf.io/blog/2023/11/22/announcing-our-latest-book-release-a-comprehensive-security-guide-to-assess-and-fortify-open-source-security/"> Announcing our latest book release: a comprehensive security guide to assess and fortify open source security</a></p> <h2 dir="ltr">Links from the interview</h2> <p dir="ltr"><a href= "https://github.com/cncf/llm-starter-pack">CNCF LLM Starter Pack</a></p> <p dir="ltr"><a href= "https://www.crossplane.io/">Crossplane</a></p> <p dir="ltr"><a href="https://webassembly.org/">Web Assembly</a></p> <p dir="ltr"><a href="https://gateway-api.sigs.k8s.io/">Intro to Kubernetes Gateway API</a></p> <h2 dir="ltr">Links from the post-interview chat</h2> <p dir="ltr"><a href= "https://twitter.com/birthmarkbart/status/1389960932395294725?s=20">  SIG ContribEx Comms Team Rap by Bart Farrell</a></p>]]></description>
         <content:encoded><![CDATA[<p dir="ltr">This episode Kaslin went to KubeCon North America In Chicago. She spoke to folks on the ground, asked them about their impressions of the conference, and collected a bunch of cool responses.</p> <p dir="ltr">Do you have something cool to share? Some questions? Let us know:</p> <p dir="ltr">- web: <a href= "https://kubernetespodcast.com">kubernetespodcast.com</a></p> <p dir="ltr">- mail: <a href= "mailto:kubernetespodcast@google.com">kubernetespodcast@google.com</a></p> <p dir="ltr">- twitter: <a href= "https://twitter.com/kubernetespod">@kubernetespod</a></p> News of the week <p dir="ltr"><a href= "https://cloud.google.com/blog/products/identity-security/google-researchers-discover-reptar-a-new-cpu-vulnerability"> Google researchers discover 'Reptar,’ a new CPU vulnerability</a></p> <p dir="ltr"><a href= "https://lock.cmpxchg8b.com/reptar.html">Reptar by Tavis Ormandy</a></p> <p dir="ltr"><a href= "https://thenewstack.io/tim-hockin-kubernetes-needs-a-complexity-budget/"> Tim Hockin: Kubernetes Needs a Complexity Budget</a></p> <p dir="ltr"><a href= "https://www.theregister.com/2023/11/13/kubernetes_tim_hockin_on_ai/"> Kubernetes' Tim Hockin on a decade of dominance and the future of AI in open source</a> </p> <p dir="ltr"><a href= "https://www.youtube.com/watch?v=WqeShpaztZY&list=PLj6h78yzYM2MYc0X1465RzF_7Cqf7bnqL&index=19"> Keynote: A Vision for Vision - Kubernetes in Its Second Decade - Tim Hockin</a></p> <p dir="ltr"><a href= "https://github.com/cncf/tag-security/blob/main/assessments/Open_and_Secure.pdf"> Open and Secure: A Manual for Practicing Thread Modeling to Assess and Fortify Open Source and Security</a></p> <p dir="ltr"><a href= "https://www.cncf.io/blog/2023/11/22/announcing-our-latest-book-release-a-comprehensive-security-guide-to-assess-and-fortify-open-source-security/"> Announcing our latest book release: a comprehensive security guide to assess and fortify open source security</a></p> Links from the interview <p dir="ltr"><a href= "https://github.com/cncf/llm-starter-pack">CNCF LLM Starter Pack</a></p> <p dir="ltr"><a href= "https://www.crossplane.io/">Crossplane</a></p> <p dir="ltr"><a href="https://webassembly.org/">Web Assembly</a></p> <p dir="ltr"><a href="https://gateway-api.sigs.k8s.io/">Intro to Kubernetes Gateway API</a></p> Links from the post-interview chat <p dir="ltr"><a href= "https://twitter.com/birthmarkbart/status/1389960932395294725?s=20">  SIG ContribEx Comms Team Rap by Bart Farrell</a></p>]]></content:encoded>
         <enclosure length="79018008" type="audio/mpeg" url="https://traffic.libsyn.com/secure/e780d51f-f115-44a6-8252-aed9216bb521/KPOD214.mp3?dest-id=3486674" />
         <itunes:duration>54:53</itunes:duration>
         <itunes:explicit>false</itunes:explicit>
         <itunes:keywords />
         <itunes:subtitle><![CDATA[This episode Kaslin went to KubeCon North America In Chicago. She spoke to folks on the ground, asked them about their impressions of the conference, and collected a bunch of cool responses. Do you have something cool to share? Some questions? Let us...]]></itunes:subtitle>
         <itunes:episode>214</itunes:episode>
         <itunes:episodeType>full</itunes:episodeType>
      </item>
      <item>
         <title>Kubernetes Pen Testing, with Jesper Larsson</title>
         <itunes:title>Kubernetes Pen Testing, with Jesper Larsson</itunes:title>
         <pubDate>Wed, 29 Nov 2023 00:18:00 +0000</pubDate>
         <guid isPermaLink="false"><![CDATA[1451620d-4a53-4522-9ad1-978600a7331f]]></guid>
         <link><![CDATA[http://sites.libsyn.com/419861/kubernetes-pen-testing-with-jesper-larsson]]></link>
         <itunes:image href="https://static.libsyn.com/p/assets/3/7/1/2/37123d51ad937e05e5bbc093207a2619/NewKPodRoboWhite_2-20231129-1q4wg71lhl.png" />
         <description><![CDATA[<p dir="ltr">Jesper Larsson is a Freelance PenTester. Jesper works with a hacker community called Cure53. Co-organizes SecurityFest in Gothenburg, Sweden. Hosts Säkerhetspodcasten or The Security Podcast. Jesper is also a Star on Hackad, a Swedish TV Series about hacking.</p> <p><strong> </strong></p> <p dir="ltr">Do you have something cool to share? Some questions? Let us know:</p> <p dir="ltr">- web: <a href= "https://kubernetespodcast.com">kubernetespodcast.com</a></p> <p dir="ltr">- mail: <a href= "mailto:kubernetespodcast@google.com">kubernetespodcast@google.com</a></p> <p dir="ltr">- twitter: <a href= "https://twitter.com/kubernetespod">@kubernetespod</a></p> <p><strong> </strong></p> <h2 dir="ltr">News of the week</h2> <p dir="ltr"><a href= "https://kubernetes.io/blog/2023/11/16/kubernetes-1-29-upcoming-changes/"> Kubernetes Removals, Deprecations, and Major Changes in Kubernetes 1.29</a></p> <p dir="ltr"><a href= "https://kubernetes.io/blog/2023/11/07/introducing-sig-etcd/">Introducing SIG etcd</a></p> <p dir="ltr"><a href= "https://kubernetespodcast.com/episode/211-etcd/">etcd, with Marek Siarkowicz and Wenjia Zhang</a> (The Kubernetes Podcast from Google)</p> <p dir="ltr"><a href= "https://cloud.redhat.com/blog/webassembly-wasm-and-openshift-a-powerful-duo-for-modern-applications"> WebAssembly (WASM) and OpenShift: A Powerful Duo for Modern Applications</a></p> <p dir="ltr"><a href="https://events.linuxfoundation.org/">Linux Foundation Events</a></p> <p dir="ltr"><a href= "https://github.com/kubernetes/community/pull/7603">Pass the torch in ContribEx #7603</a></p> <h2 dir="ltr">Links from the interview</h2> <p dir="ltr"><a href="https://cure53.de/">Cure53 Hacker Community</a></p> <p dir="ltr"><a href= "https://sakerhetspodcasten.se/">Säkerhetspodcasten</a></p> <p dir="ltr"><a href= "https://www.imdb.com/title/tt15746988/">Hackad TV Show on IMDB</a></p> <p dir="ltr"><a href="https://securityfest.com/">SecurityFest Gothenburg</a></p> <p dir="ltr"><a href="https://falco.org/">Falco</a> by <a href= "https://sysdig.com/">Sysdig</a></p> <p dir="ltr"><a href="https://github.com/wolfi-dev">Wolfi</a> by <a href="https://www.chainguard.dev/">Chainguard</a></p> <p dir="ltr"><a href= "https://www.wired.com/story/notpetya-cyberattack-ukraine-russia-code-crashed-the-world/"> The Untold Story of NotPetya, the Most Devastating Cyberattack in History</a></p> <h2 dir="ltr">Links from the post-interview chat</h2> <p dir="ltr"><a href= "https://www.wired.com/story/notpetya-cyberattack-ukraine-russia-code-crashed-the-world/"> The Untold Story of NotPetya, the Most Devastating Cyberattack in History</a></p>]]></description>
         <content:encoded><![CDATA[<p dir="ltr">Jesper Larsson is a Freelance PenTester. Jesper works with a hacker community called Cure53. Co-organizes SecurityFest in Gothenburg, Sweden. Hosts Säkerhetspodcasten or The Security Podcast. Jesper is also a Star on Hackad, a Swedish TV Series about hacking.</p> <p> </p> <p dir="ltr">Do you have something cool to share? Some questions? Let us know:</p> <p dir="ltr">- web: <a href= "https://kubernetespodcast.com">kubernetespodcast.com</a></p> <p dir="ltr">- mail: <a href= "mailto:kubernetespodcast@google.com">kubernetespodcast@google.com</a></p> <p dir="ltr">- twitter: <a href= "https://twitter.com/kubernetespod">@kubernetespod</a></p> <p> </p> News of the week <p dir="ltr"><a href= "https://kubernetes.io/blog/2023/11/16/kubernetes-1-29-upcoming-changes/"> Kubernetes Removals, Deprecations, and Major Changes in Kubernetes 1.29</a></p> <p dir="ltr"><a href= "https://kubernetes.io/blog/2023/11/07/introducing-sig-etcd/">Introducing SIG etcd</a></p> <p dir="ltr"><a href= "https://kubernetespodcast.com/episode/211-etcd/">etcd, with Marek Siarkowicz and Wenjia Zhang</a> (The Kubernetes Podcast from Google)</p> <p dir="ltr"><a href= "https://cloud.redhat.com/blog/webassembly-wasm-and-openshift-a-powerful-duo-for-modern-applications"> WebAssembly (WASM) and OpenShift: A Powerful Duo for Modern Applications</a></p> <p dir="ltr"><a href="https://events.linuxfoundation.org/">Linux Foundation Events</a></p> <p dir="ltr"><a href= "https://github.com/kubernetes/community/pull/7603">Pass the torch in ContribEx #7603</a></p> Links from the interview <p dir="ltr"><a href="https://cure53.de/">Cure53 Hacker Community</a></p> <p dir="ltr"><a href= "https://sakerhetspodcasten.se/">Säkerhetspodcasten</a></p> <p dir="ltr"><a href= "https://www.imdb.com/title/tt15746988/">Hackad TV Show on IMDB</a></p> <p dir="ltr"><a href="https://securityfest.com/">SecurityFest Gothenburg</a></p> <p dir="ltr"><a href="https://falco.org/">Falco</a> by <a href= "https://sysdig.com/">Sysdig</a></p> <p dir="ltr"><a href="https://github.com/wolfi-dev">Wolfi</a> by <a href="https://www.chainguard.dev/">Chainguard</a></p> <p dir="ltr"><a href= "https://www.wired.com/story/notpetya-cyberattack-ukraine-russia-code-crashed-the-world/"> The Untold Story of NotPetya, the Most Devastating Cyberattack in History</a></p> Links from the post-interview chat <p dir="ltr"><a href= "https://www.wired.com/story/notpetya-cyberattack-ukraine-russia-code-crashed-the-world/"> The Untold Story of NotPetya, the Most Devastating Cyberattack in History</a></p>]]></content:encoded>
         <enclosure length="73742318" type="audio/mpeg" url="https://traffic.libsyn.com/secure/e780d51f-f115-44a6-8252-aed9216bb521/KPOD213.mp3?dest-id=3486674" />
         <itunes:duration>51:13</itunes:duration>
         <itunes:explicit>false</itunes:explicit>
         <itunes:keywords />
         <itunes:subtitle><![CDATA[Jesper Larsson is a Freelance PenTester. Jesper works with a hacker community called Cure53. Co-organizes SecurityFest in Gothenburg, Sweden. Hosts Säkerhetspodcasten or The Security Podcast. Jesper is also a Star on Hackad, a Swedish TV Series about...]]></itunes:subtitle>
         <itunes:episode>213</itunes:episode>
         <itunes:episodeType>full</itunes:episodeType>
      </item>
   </channel>
</rss>`;

Deno.test('getPodcastFeed - RSS', async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    'fetchWithTimeout',
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responsePodcastRSS, { status: 200 }));
      }),
    ]),
  );

  const uploadSourceIconSpy = stub(
    feedutils,
    'uploadSourceIcon',
    returnsNext([
      new Promise((resolve) => {
        resolve(
          'https://static.libsyn.com/p/assets/7/2/d/d/72ddd143dc0d42c316c3140a3186d450/Kubernetes-Podcast-Logo_1400x1400.png',
        );
      }),
    ]),
  );

  try {
    const { source, items } = await getPodcastFeed(
      supabaseClient,
      undefined,
      mockProfile,
      {
        ...mockSource,
        options: { podcast: 'https://kubernetespodcast.com/feeds/audio.xml' },
      },
      undefined,
    );
    assertEqualsSource(source, {
      'id': 'podcast-myuser-mycolumn-9d151d96e51e542b848a39982f685eef',
      'columnId': 'mycolumn',
      'userId': 'myuser',
      'type': 'podcast',
      'title': 'Kubernetes Podcast from Google',
      'options': { 'podcast': 'https://kubernetespodcast.com/feeds/audio.xml' },
      'link': 'https://kubernetespodcast.com',
      'icon':
        'https://static.libsyn.com/p/assets/7/2/d/d/72ddd143dc0d42c316c3140a3186d450/Kubernetes-Podcast-Logo_1400x1400.png',
    });
    assertEqualsItems(items, [{
      'id':
        'podcast-myuser-mycolumn-9d151d96e51e542b848a39982f685eef-b7986c0276dcd01cdce685b148530a99',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'podcast-myuser-mycolumn-9d151d96e51e542b848a39982f685eef',
      'title': 'KubeCon NA 2023',
      'link': 'http://sites.libsyn.com/419861/kubecon-na-2023',
      'media':
        'https://traffic.libsyn.com/secure/e780d51f-f115-44a6-8252-aed9216bb521/KPOD214.mp3?dest-id=3486674',
      'description':
        '<p dir="ltr">This episode Kaslin went to KubeCon North America In Chicago. She spoke to folks on the ground, asked them about their impressions of the conference, and collected a bunch of cool responses.</p> <p dir="ltr">Do you have something cool to share? Some questions? Let us know:</p> <p dir="ltr">- web: <a href= "https://kubernetespodcast.com">kubernetespodcast.com</a></p> <p dir="ltr">- mail: <a href= "mailto:kubernetespodcast@google.com">kubernetespodcast@google.com</a></p> <p dir="ltr">- twitter: <a href= "https://twitter.com/kubernetespod">@kubernetespod</a></p> <h2 dir="ltr">News of the week</h2> <p dir="ltr"><a href= "https://cloud.google.com/blog/products/identity-security/google-researchers-discover-reptar-a-new-cpu-vulnerability"> Google researchers discover \'Reptar,’ a new CPU vulnerability</a></p> <p dir="ltr"><a href= "https://lock.cmpxchg8b.com/reptar.html">Reptar by Tavis Ormandy</a></p> <p dir="ltr"><a href= "https://thenewstack.io/tim-hockin-kubernetes-needs-a-complexity-budget/"> Tim Hockin: Kubernetes Needs a Complexity Budget</a></p> <p dir="ltr"><a href= "https://www.theregister.com/2023/11/13/kubernetes_tim_hockin_on_ai/"> Kubernetes\' Tim Hockin on a decade of dominance and the future of AI in open source</a> </p> <p dir="ltr"><a href= "https://www.youtube.com/watch?v=WqeShpaztZY&list=PLj6h78yzYM2MYc0X1465RzF_7Cqf7bnqL&index=19"> Keynote: A Vision for Vision - Kubernetes in Its Second Decade - Tim Hockin</a></p> <p dir="ltr"><a href= "https://github.com/cncf/tag-security/blob/main/assessments/Open_and_Secure.pdf"> Open and Secure: A Manual for Practicing Thread Modeling to Assess and Fortify Open Source and Security</a></p> <p dir="ltr"><a href= "https://www.cncf.io/blog/2023/11/22/announcing-our-latest-book-release-a-comprehensive-security-guide-to-assess-and-fortify-open-source-security/"> Announcing our latest book release: a comprehensive security guide to assess and fortify open source security</a></p> <h2 dir="ltr">Links from the interview</h2> <p dir="ltr"><a href= "https://github.com/cncf/llm-starter-pack">CNCF LLM Starter Pack</a></p> <p dir="ltr"><a href= "https://www.crossplane.io/">Crossplane</a></p> <p dir="ltr"><a href="https://webassembly.org/">Web Assembly</a></p> <p dir="ltr"><a href="https://gateway-api.sigs.k8s.io/">Intro to Kubernetes Gateway API</a></p> <h2 dir="ltr">Links from the post-interview chat</h2> <p dir="ltr"><a href= "https://twitter.com/birthmarkbart/status/1389960932395294725?s=20">  SIG ContribEx Comms Team Rap by Bart Farrell</a></p>',
      'publishedAt': 1701819420,
    }, {
      'id':
        'podcast-myuser-mycolumn-9d151d96e51e542b848a39982f685eef-4c7c98567f8fbe488d28b0cd032f7a72',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'podcast-myuser-mycolumn-9d151d96e51e542b848a39982f685eef',
      'title': 'Kubernetes Pen Testing, with Jesper Larsson',
      'link':
        'http://sites.libsyn.com/419861/kubernetes-pen-testing-with-jesper-larsson',
      'media':
        'https://traffic.libsyn.com/secure/e780d51f-f115-44a6-8252-aed9216bb521/KPOD213.mp3?dest-id=3486674',
      'description':
        '<p dir="ltr">Jesper Larsson is a Freelance PenTester. Jesper works with a hacker community called Cure53. Co-organizes SecurityFest in Gothenburg, Sweden. Hosts Säkerhetspodcasten or The Security Podcast. Jesper is also a Star on Hackad, a Swedish TV Series about hacking.</p> <p><strong> </strong></p> <p dir="ltr">Do you have something cool to share? Some questions? Let us know:</p> <p dir="ltr">- web: <a href= "https://kubernetespodcast.com">kubernetespodcast.com</a></p> <p dir="ltr">- mail: <a href= "mailto:kubernetespodcast@google.com">kubernetespodcast@google.com</a></p> <p dir="ltr">- twitter: <a href= "https://twitter.com/kubernetespod">@kubernetespod</a></p> <p><strong> </strong></p> <h2 dir="ltr">News of the week</h2> <p dir="ltr"><a href= "https://kubernetes.io/blog/2023/11/16/kubernetes-1-29-upcoming-changes/"> Kubernetes Removals, Deprecations, and Major Changes in Kubernetes 1.29</a></p> <p dir="ltr"><a href= "https://kubernetes.io/blog/2023/11/07/introducing-sig-etcd/">Introducing SIG etcd</a></p> <p dir="ltr"><a href= "https://kubernetespodcast.com/episode/211-etcd/">etcd, with Marek Siarkowicz and Wenjia Zhang</a> (The Kubernetes Podcast from Google)</p> <p dir="ltr"><a href= "https://cloud.redhat.com/blog/webassembly-wasm-and-openshift-a-powerful-duo-for-modern-applications"> WebAssembly (WASM) and OpenShift: A Powerful Duo for Modern Applications</a></p> <p dir="ltr"><a href="https://events.linuxfoundation.org/">Linux Foundation Events</a></p> <p dir="ltr"><a href= "https://github.com/kubernetes/community/pull/7603">Pass the torch in ContribEx #7603</a></p> <h2 dir="ltr">Links from the interview</h2> <p dir="ltr"><a href="https://cure53.de/">Cure53 Hacker Community</a></p> <p dir="ltr"><a href= "https://sakerhetspodcasten.se/">Säkerhetspodcasten</a></p> <p dir="ltr"><a href= "https://www.imdb.com/title/tt15746988/">Hackad TV Show on IMDB</a></p> <p dir="ltr"><a href="https://securityfest.com/">SecurityFest Gothenburg</a></p> <p dir="ltr"><a href="https://falco.org/">Falco</a> by <a href= "https://sysdig.com/">Sysdig</a></p> <p dir="ltr"><a href="https://github.com/wolfi-dev">Wolfi</a> by <a href="https://www.chainguard.dev/">Chainguard</a></p> <p dir="ltr"><a href= "https://www.wired.com/story/notpetya-cyberattack-ukraine-russia-code-crashed-the-world/"> The Untold Story of NotPetya, the Most Devastating Cyberattack in History</a></p> <h2 dir="ltr">Links from the post-interview chat</h2> <p dir="ltr"><a href= "https://www.wired.com/story/notpetya-cyberattack-ukraine-russia-code-crashed-the-world/"> The Untold Story of NotPetya, the Most Devastating Cyberattack in History</a></p>',
      'publishedAt': 1701217080,
    }]);
  } finally {
    fetchWithTimeoutSpy.restore();
    uploadSourceIconSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      'https://kubernetespodcast.com/feeds/audio.xml',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responsePodcastRSS, { status: 200 }));
    }),
  });
  assertSpyCall(uploadSourceIconSpy, 0, {
    args: [
      supabaseClient,
      {
        'id': 'podcast-myuser-mycolumn-9d151d96e51e542b848a39982f685eef',
        'columnId': 'mycolumn',
        'userId': 'myuser',
        'type': 'podcast',
        'title': 'Kubernetes Podcast from Google',
        'options': {
          'podcast': 'https://kubernetespodcast.com/feeds/audio.xml',
        },
        'link': 'https://kubernetespodcast.com',
        'icon':
          'https://static.libsyn.com/p/assets/7/2/d/d/72ddd143dc0d42c316c3140a3186d450/Kubernetes-Podcast-Logo_1400x1400.png',
      },
    ],
    returned: new Promise((resolve) => {
      resolve(
        'https://static.libsyn.com/p/assets/7/2/d/d/72ddd143dc0d42c316c3140a3186d450/Kubernetes-Podcast-Logo_1400x1400.png',
      );
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
  assertSpyCalls(uploadSourceIconSpy, 1);
});

const responsePodcastApple = `{
 "resultCount":1,
 "results": [
{"wrapperType":"track", "kind":"podcast", "collectionId":1120964487, "trackId":1120964487, "artistName":"Changelog Media", "collectionName":"Go Time: Golang, Software Engineering", "trackName":"Go Time: Golang, Software Engineering", "collectionCensoredName":"Go Time: Golang, Software Engineering", "trackCensoredName":"Go Time: Golang, Software Engineering", "collectionViewUrl":"https://podcasts.apple.com/us/podcast/go-time-golang-software-engineering/id1120964487?uo=4", "feedUrl":"https://changelog.com/gotime/feed", "trackViewUrl":"https://podcasts.apple.com/us/podcast/go-time-golang-software-engineering/id1120964487?uo=4", "artworkUrl30":"https://is1-ssl.mzstatic.com/image/thumb/Podcasts113/v4/0d/25/86/0d258649-4cfe-2750-6316-dffd9dbe3b8d/mza_5183216603141582042.png/30x30bb.jpg", "artworkUrl60":"https://is1-ssl.mzstatic.com/image/thumb/Podcasts113/v4/0d/25/86/0d258649-4cfe-2750-6316-dffd9dbe3b8d/mza_5183216603141582042.png/60x60bb.jpg", "artworkUrl100":"https://is1-ssl.mzstatic.com/image/thumb/Podcasts113/v4/0d/25/86/0d258649-4cfe-2750-6316-dffd9dbe3b8d/mza_5183216603141582042.png/100x100bb.jpg", "collectionPrice":0.00, "trackPrice":0.00, "collectionHdPrice":0, "releaseDate":"2023-11-08T13:15:00Z", "collectionExplicitness":"notExplicit", "trackExplicitness":"cleaned", "trackCount":304, "trackTimeMillis":5264, "country":"USA", "currency":"USD", "primaryGenreName":"Technology", "contentAdvisoryRating":"Clean", "artworkUrl600":"https://is1-ssl.mzstatic.com/image/thumb/Podcasts113/v4/0d/25/86/0d258649-4cfe-2750-6316-dffd9dbe3b8d/mza_5183216603141582042.png/600x600bb.jpg", "genreIds":["1318", "26", "1304", "1499"], "genres":["Technology", "Podcasts", "Education", "How To"]}]
}`;
const responsePodcastAppleRSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:podcast="https://podcastindex.org/namespace/1.0" version="2.0">
   <channel>
      <title>Go Time: Golang, Software Engineering</title>
      <copyright>All rights reserved</copyright>
      <link>https://changelog.com/gotime</link>
      <atom:link href="https://changelog.com/gotime/feed" rel="self" type="application/rss+xml" />
      <atom:link href="https://changelog.com/gotime" rel="alternate" type="text/html" />
      <language>en-us</language>
      <description>Your source for diverse discussions from around the Go community.  This show records LIVE every Tuesday at 3pm US Eastern. Join the Golang community and chat with us during the show in the #gotimefm channel of Gophers slack. Panelists include Mat Ryer, Jon Calhoun, Natalie Pistunovich, Johnny Boursiquot, Angelica Hill, Kris Brandow, and Ian Lopshire. We discuss cloud infrastructure, distributed systems, microservices, Kubernetes, Docker… oh and also Go! Some people search for GoTime or GoTimeFM and can’t find the show, so now the strings GoTime and GoTimeFM are in our description too.</description>
      <itunes:author>Changelog Media</itunes:author>
      <itunes:summary>Your source for diverse discussions from around the Go community.  This show records LIVE every Tuesday at 3pm US Eastern. Join the Golang community and chat with us during the show in the #gotimefm channel of Gophers slack. Panelists include Mat Ryer, Jon Calhoun, Natalie Pistunovich, Johnny Boursiquot, Angelica Hill, Kris Brandow, and Ian Lopshire. We discuss cloud infrastructure, distributed systems, microservices, Kubernetes, Docker… oh and also Go! Some people search for GoTime or GoTimeFM and can’t find the show, so now the strings GoTime and GoTimeFM are in our description too.</itunes:summary>
      <itunes:explicit>no</itunes:explicit>
      <itunes:image href="https://cdn.changelog.com/uploads/covers/go-time-original.png?v=63725770357" />
      <itunes:owner>
         <itunes:name>Changelog Media</itunes:name>
      </itunes:owner>
      <itunes:keywords>go, golang, open source, software, development, devops, architecture, docker, kubernetes</itunes:keywords>
      <itunes:category text="Technology">
         <itunes:category text="Software How-To" />
         <itunes:category text="Tech News" />
      </itunes:category>
      <podcast:funding url="https://changelog.com/++">Support our work by joining Changelog++</podcast:funding>
      <podcast:person role="host" img="https://cdn.changelog.com/uploads/avatars/people/lbY/avatar_large.jpg?v=63764553668" href="https://changelog.com/person/matryer">Mat Ryer</podcast:person>
      <podcast:person role="host" img="https://secure.gravatar.com/avatar/1777de319efe52999139231273746dc9.jpg?s=600&amp;d=mm" href="https://changelog.com/person/joncalhoun">Jon Calhoun</podcast:person>
      <podcast:person role="host" img="https://cdn.changelog.com/uploads/avatars/people/M0oR/avatar_large.jpeg?v=63729653215" href="https://changelog.com/person/nataliepis">Natalie Pistunovich</podcast:person>
      <podcast:person role="host" img="https://secure.gravatar.com/avatar/6d26a33d20b8e96182b8e71c30ffe927.jpg?s=600&amp;d=mm" href="https://changelog.com/person/jboursiquot">Johnny Boursiquot</podcast:person>
      <podcast:person role="host" img="https://cdn.changelog.com/uploads/avatars/people/wwOp4/avatar_large.jpg?v=63772335237" href="https://changelog.com/person/angelicahill">Angelica Hill</podcast:person>
      <podcast:person role="host" img="https://cdn.changelog.com/uploads/avatars/people/Qyme/avatar_large.jpg?v=63758939850" href="https://changelog.com/person/skriptble">Kris Brandow</podcast:person>
      <podcast:person role="host" img="https://cdn.changelog.com/uploads/avatars/people/yWWz5/avatar_large.jpg?v=63779509228" href="https://changelog.com/person/ianlopshire">Ian Lopshire</podcast:person>
      <item>
         <title>Event-driven systems &amp;architecture</title>
         <link>https://changelog.com/gotime/297</link>
         <guid isPermaLink="false">changelog.com/2/2126</guid>
         <pubDate>Tue, 14 Nov 2023 22:05:00 +0000</pubDate>
         <enclosure url="https://op3.dev/e/https://cdn.changelog.com/uploads/gotime/297/go-time-297.mp3" length="63299111" type="audio/mpeg" />
         <description>Event-driven systems may not be the go-to solution for everyone because of the challenges they can add. While the system reacting to events published in other parts of the system seem elegant, some of the complexities they bring can be challenging.  However, they do offer durability, autonomy &amp;flexibility. In this episode, we’ll define event-driven architecture, discuss the problems it solves, challenges it poses &amp;potential solutions.</description>
         <content:encoded><![CDATA[<p>Event-driven systems may not be the go-to solution for everyone because of the challenges they can add. While the system reacting to events published in other parts of the system seem elegant, some of the complexities they bring can be challenging.  However, they do offer durability, autonomy &amp; flexibility.</p>
<p>In this episode, we’ll define event-driven architecture, discuss the problems it solves, challenges it poses &amp; potential solutions.</p>

<p><a href="https://changelog.com/gotime/297/discuss">Leave us a comment</a></p>

<p><a href="https://changelog.com/++" rel="payment">Changelog++</a> members save 1 minute on this episode because they made the ads disappear. Join today!</p>

<p>Sponsors:</p>
<p><ul>
  <li><a href="https://fastly.com/?utm_source=changelog">Fastly</a> – <strong>Our bandwidth partner.</strong> Fastly powers fast, secure, and scalable digital experiences. Move beyond your content delivery network to their powerful edge cloud platform. Learn more at <a href="https://www.fastly.com/?utm_source=changelog&amp;utm_medium=podcast&amp;utm_campaign=changelog-sponsorship">fastly.com</a>
</li><li><a href="https://fly.io/changelog">Fly.io</a> – <strong>The home of Changelog.com</strong> — Deploy your apps and databases close to your users. In minutes you can run your Ruby, Go, Node, Deno, Python, or Elixir app (and databases!) all over the world. No ops required. Learn more at <a href="https://fly.io/changelog">fly.io/changelog</a> and check out <a href="https://fly.io/docs/speedrun/">the speedrun in their docs</a>.
</li><li><a href="https://cloud.typesense.org/?utm_source=changelog">Typesense</a> – Lightning fast, globally distributed Search-as-a-Service that runs in memory. You literally can’t get any faster!
</li>
</ul></p>


<p>Featuring:</p>
<p><ul><li>Chris Richardson &ndash; <a href="https://fosstodon.org/@crichardson" rel="external ugc">Mastodon</a>, <a href="https://twitter.com/crichardson" rel="external ugc">Twitter</a>, <a href="https://www.linkedin.com/in/pojos" rel="external ugc">LinkedIn</a></li><li>Indu Alagarsamy  &ndash; <a href="https://twitter.com/indu_alagarsamy" rel="external ugc">Twitter</a>, <a href="https://www.linkedin.com/in/indualagarsamy" rel="external ugc">LinkedIn</a>, <a href="https://indu.dev" rel="external ugc">Website</a></li><li>Viktor Stanchev &ndash; <a href="https://twitter.com/vikstrous" rel="external ugc">Twitter</a>, <a href="https://github.com/vikstrous" rel="external ugc">GitHub</a>, <a href="https://www.linkedin.com/in/viktorstanchev" rel="external ugc">LinkedIn</a>, <a href="https://viktorstanchev.com/" rel="external ugc">Website</a></li><li>Angelica Hill &ndash; <a href="https://twitter.com/Angelica_Hill" rel="external ugc">Twitter</a>, <a href="https://github.com/angelicahill" rel="external ugc">GitHub</a></li></ul></p>

<p>Show Notes:</p>
<p><ul>
<li><a href="https://temporal.io/">Temporal</a></li>
<li><a href="https://microservices.io/patterns/data/transactional-outbox.html">Patterns</a></li>
<li><a href="https://microservices.io/patterns/data/saga.html">Choreography vs orchestration</a></li>
<li><a href="https://martinfowler.com/eaaDev/EventSourcing.html">Event sourcing</a></li>
<li><a href="https://microservices.io/patterns/data/cqrs.html">CQRS</a></li>
<li>Cloud-based workflow solutions
<ul>
<li><a href="https://cloud.google.com/workflows">GCP Workflows</a>
<ul>
<li><a href="https://cloud.google.com/workflows/docs/reference/syntax/syntax-cheat-sheet">GCP workflows yaml language</a></li>
</ul>
</li>
<li><a href="https://aws.amazon.com/step-functions/">AWS Step Functions</a>
<ul>
<li><a href="https://docs.aws.amazon.com/step-functions/latest/dg/concepts-amazon-states-language.html">“Amazon states language” based on json</a></li>
</ul>
</li>
</ul>
</li>
<li>Go specific microservices orchestration tools, frameworks, and libraries:
<ul>
<li><a href="https://github.com/temporalio/sdk-go">Temporal Go SDK</a></li>
<li><a href="https://github.com/ThreeDotsLabs/watermill">Watermill</a></li>
</ul>
</li>
</ul>
</p>
<p>Something missing or broken? <a href="https://github.com/thechangelog/show-notes/blob/master/gotime/go-time-297.md">PRs welcome!</a></p>]]></content:encoded>
         <itunes:episodeType>full</itunes:episodeType>
         <itunes:image href="https://cdn.changelog.com/uploads/covers/go-time-original.png?v=63725770357" />
         <itunes:duration>1:05:24</itunes:duration>
         <itunes:explicit>no</itunes:explicit>
         <itunes:keywords>go, golang, open source, software, development, devops, architecture, docker, kubernetes</itunes:keywords>
         <itunes:subtitle>with Chris Richardson, Indu Alagarsamy &amp;Viktor Stanchev</itunes:subtitle>
         <itunes:summary>Event-driven systems may not be the go-to solution for everyone because of the challenges they can add. While the system reacting to events published in other parts of the system seem elegant, some of the complexities they bring can be challenging.  However, they do offer durability, autonomy &amp;flexibility. In this episode, we’ll define event-driven architecture, discuss the problems it solves, challenges it poses &amp;potential solutions.</itunes:summary>
         <dc:creator>Changelog Media</dc:creator>
         <itunes:author>Changelog Media</itunes:author>
         <podcast:person role="host" img="https://cdn.changelog.com/uploads/avatars/people/wwOp4/avatar_large.jpg?v=63772335237" href="https://changelog.com/person/angelicahill">Angelica Hill</podcast:person>
         <podcast:person role="guest" img="https://cdn.changelog.com/uploads/avatars/people/wwXpo/avatar_large.png?v=63859946508" href="https://changelog.com/person/chrisrichardson">Chris Richardson</podcast:person>
         <podcast:person role="guest" img="https://cdn.changelog.com/uploads/avatars/people/dVJwl/avatar_large.png?v=63859946700" href="https://changelog.com/person/indua">Indu Alagarsamy</podcast:person>
         <podcast:person role="guest" img="https://cdn.changelog.com/uploads/avatars/people/6DwkJ/avatar_large.jpg?v=63859946242" href="https://changelog.com/person/viktor">Viktor Stanchev</podcast:person>
         <podcast:chapters url="https://changelog.com/gotime/297/chapters" type="application/json+chapters" />
         <podcast:socialInteract uri="https://changelog.social/@gotime/111414814157362161" protocol="activitypub" />
      </item>
      <item>
         <title>Principles of simplicity</title>
         <link>https://changelog.com/gotime/296</link>
         <guid isPermaLink="false">changelog.com/2/2255</guid>
         <pubDate>Wed, 08 Nov 2023 13:15:00 +0000</pubDate>
         <enclosure url="https://op3.dev/e/https://cdn.changelog.com/uploads/gotime/296/go-time-296.mp3" length="84740716" type="audio/mpeg" />
         <description>Rob Pike says, “Simplicity is the art of hiding complexity.” If that’s true, what is simplicity in the context of writing software in Go? Is it even something we should strive for? Can software be too simple? Ian &amp;Kris discuss with return guest  sam boyer.</description>
         <content:encoded><![CDATA[<p>Rob Pike says, “Simplicity is the art of hiding complexity.” If that’s true, what is simplicity in the context of writing software in Go? Is it even something we should strive for? Can software be too simple? Ian &amp; Kris discuss with return guest  sam boyer.</p>

<p><a href="https://changelog.com/gotime/296/discuss">Leave us a comment</a></p>

<p><a href="https://changelog.com/++" rel="payment">Changelog++</a> members save 2 minutes on this episode because they made the ads disappear. Join today!</p>

<p>Sponsors:</p>
<p><ul>
  <li><a href="https://changelog.com/news">Changelog News</a> – A podcast+newsletter combo that’s brief, entertaining &amp; always on-point. <a href="https://changelog.com/news">Subscribe today</a>.
</li><li><a href="https://fastly.com/?utm_source=changelog">Fastly</a> – <strong>Our bandwidth partner.</strong> Fastly powers fast, secure, and scalable digital experiences. Move beyond your content delivery network to their powerful edge cloud platform. Learn more at <a href="https://www.fastly.com/?utm_source=changelog&amp;utm_medium=podcast&amp;utm_campaign=changelog-sponsorship">fastly.com</a>
</li><li><a href="https://fly.io/changelog">Fly.io</a> – <strong>The home of Changelog.com</strong> — Deploy your apps and databases close to your users. In minutes you can run your Ruby, Go, Node, Deno, Python, or Elixir app (and databases!) all over the world. No ops required. Learn more at <a href="https://fly.io/changelog">fly.io/changelog</a> and check out <a href="https://fly.io/docs/speedrun/">the speedrun in their docs</a>.
</li>
</ul></p>


<p>Featuring:</p>
<p><ul><li>sam boyer &ndash; <a href="https://twitter.com/sdboyer" rel="external ugc">Twitter</a>, <a href="https://github.com/sdboyer" rel="external ugc">GitHub</a></li><li>Ian Lopshire &ndash; <a href="https://twitter.com/ianlopshire" rel="external ugc">Twitter</a>, <a href="https://github.com/ianlopshire" rel="external ugc">GitHub</a></li><li>Kris Brandow &ndash; <a href="https://twitter.com/skriptble" rel="external ugc">Twitter</a>, <a href="https://github.com/skriptble" rel="external ugc">GitHub</a></li></ul></p>

<p>Show Notes:</p>
<p><ul>
<li><a href="https://www.youtube.com/watch?v=rFejpH_tAHM">Rob Pike - Simplicity is Complicated</a></li>
<li><a href="https://simonsinek.com/books/the-infinite-game/">The Infinite Game - Simon Sinek</a></li>
<li><a href="https://www.youtube.com/watch?v=SxdOUGdseq4">“Simple Made Easy” - Rich Hickey (2011)</a></li>
<li><a href="https://www.youtube.com/watch?v=dF98ii6r_gU&amp;t=190s">“You can’t get snakes from chicken eggs”</a></li>
</ul>
</p>
<p>Something missing or broken? <a href="https://github.com/thechangelog/show-notes/blob/master/gotime/go-time-296.md">PRs welcome!</a></p>]]></content:encoded>
         <itunes:episodeType>full</itunes:episodeType>
         <itunes:image href="https://cdn.changelog.com/uploads/covers/go-time-original.png?v=63725770357" />
         <itunes:duration>1:27:44</itunes:duration>
         <itunes:explicit>no</itunes:explicit>
         <itunes:keywords>go, golang, open source, software, development, devops, architecture, docker, kubernetes</itunes:keywords>
         <itunes:subtitle>with sam boyer</itunes:subtitle>
         <itunes:summary>Rob Pike says, “Simplicity is the art of hiding complexity.” If that’s true, what is simplicity in the context of writing software in Go? Is it even something we should strive for? Can software be too simple? Ian &amp;Kris discuss with return guest  sam boyer.</itunes:summary>
         <dc:creator>Changelog Media</dc:creator>
         <itunes:author>Changelog Media</itunes:author>
         <podcast:person role="host" img="https://cdn.changelog.com/uploads/avatars/people/yWWz5/avatar_large.jpg?v=63779509228" href="https://changelog.com/person/ianlopshire">Ian Lopshire</podcast:person>
         <podcast:person role="host" img="https://cdn.changelog.com/uploads/avatars/people/Qyme/avatar_large.jpg?v=63758939850" href="https://changelog.com/person/skriptble">Kris Brandow</podcast:person>
         <podcast:person role="guest" img="https://secure.gravatar.com/avatar/029f1c16a31002fe48f73bdec52cc2e0.jpg?s=600&amp;d=mm" href="https://changelog.com/person/sdboyer">sam boyer</podcast:person>
         <podcast:chapters url="https://changelog.com/gotime/296/chapters" type="application/json+chapters" />
         <podcast:socialInteract uri="https://changelog.social/@gotime/111380686496450294" protocol="activitypub" />
      </item>
         </channel>
</rss>`;

Deno.test('getPodcastFeed - Apple', async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    'fetchWithTimeout',
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responsePodcastApple, { status: 200 }));
      }),
      new Promise((resolve) => {
        resolve(new Response(responsePodcastAppleRSS, { status: 200 }));
      }),
    ]),
  );

  const uploadSourceIconSpy = stub(
    feedutils,
    'uploadSourceIcon',
    returnsNext([
      new Promise((resolve) => {
        resolve(
          'https://cdn.changelog.com/uploads/covers/go-time-original.png?v=63725770357',
        );
      }),
    ]),
  );

  try {
    const { source, items } = await getPodcastFeed(
      supabaseClient,
      undefined,
      mockProfile,
      {
        ...mockSource,
        options: {
          podcast:
            'https://podcasts.apple.com/de/podcast/go-time-golang-software-engineering/id1120964487',
        },
      },
      undefined,
    );
    assertEqualsSource(source, {
      'id': 'podcast-myuser-mycolumn-aad37b7b4ebb1f79286d7b9e24bb4163',
      'columnId': 'mycolumn',
      'userId': 'myuser',
      'type': 'podcast',
      'title': 'Go Time: Golang, Software Engineering',
      'options': { 'podcast': 'https://changelog.com/gotime/feed' },
      'link': 'https://changelog.com/gotime',
      'icon':
        'https://cdn.changelog.com/uploads/covers/go-time-original.png?v=63725770357',
    });
    assertEqualsItems(items, [{
      'id':
        'podcast-myuser-mycolumn-aad37b7b4ebb1f79286d7b9e24bb4163-04c1e4407a4e70983deb0950f6afc8b2',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'podcast-myuser-mycolumn-aad37b7b4ebb1f79286d7b9e24bb4163',
      'title': 'Event-driven systems &architecture',
      'link': 'https://changelog.com/gotime/297',
      'media':
        'https://op3.dev/e/https://cdn.changelog.com/uploads/gotime/297/go-time-297.mp3',
      'description':
        'Event-driven systems may not be the go-to solution for everyone because of the challenges they can add. While the system reacting to events published in other parts of the system seem elegant, some of the complexities they bring can be challenging.  However, they do offer durability, autonomy &flexibility. In this episode, we’ll define event-driven architecture, discuss the problems it solves, challenges it poses &potential solutions.',
      'author': 'Changelog Media',
      'publishedAt': 1699999500,
    }, {
      'id':
        'podcast-myuser-mycolumn-aad37b7b4ebb1f79286d7b9e24bb4163-2eb33370a9f9245ca2b1fc4491983383',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'podcast-myuser-mycolumn-aad37b7b4ebb1f79286d7b9e24bb4163',
      'title': 'Principles of simplicity',
      'link': 'https://changelog.com/gotime/296',
      'media':
        'https://op3.dev/e/https://cdn.changelog.com/uploads/gotime/296/go-time-296.mp3',
      'description':
        'Rob Pike says, “Simplicity is the art of hiding complexity.” If that’s true, what is simplicity in the context of writing software in Go? Is it even something we should strive for? Can software be too simple? Ian &Kris discuss with return guest  sam boyer.',
      'author': 'Changelog Media',
      'publishedAt': 1699449300,
    }]);
  } finally {
    fetchWithTimeoutSpy.restore();
    uploadSourceIconSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      'https://itunes.apple.com/lookup?id=1120964487&entity=podcast',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responsePodcastApple, { status: 200 }));
    }),
  });
  assertSpyCall(fetchWithTimeoutSpy, 1, {
    args: [
      'https://changelog.com/gotime/feed',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responsePodcastAppleRSS, { status: 200 }));
    }),
  });
  assertSpyCall(uploadSourceIconSpy, 0, {
    args: [
      supabaseClient,
      {
        'id': 'podcast-myuser-mycolumn-aad37b7b4ebb1f79286d7b9e24bb4163',
        'columnId': 'mycolumn',
        'userId': 'myuser',
        'type': 'podcast',
        'title': 'Go Time: Golang, Software Engineering',
        'options': { 'podcast': 'https://changelog.com/gotime/feed' },
        'link': 'https://changelog.com/gotime',
        'icon':
          'https://cdn.changelog.com/uploads/covers/go-time-original.png?v=63725770357',
      },
    ],
    returned: new Promise((resolve) => {
      resolve(
        'https://cdn.changelog.com/uploads/covers/go-time-original.png?v=63725770357',
      );
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 2);
  assertSpyCalls(uploadSourceIconSpy, 1);
});
