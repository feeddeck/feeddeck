import { createClient } from '@supabase/supabase-js';
import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from 'std/testing/mock';

import { ISource } from '../models/source.ts';
import { IProfile } from '../models/profile.ts';
import { getRSSFeed } from './rss.ts';
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

const responseTagesschauWebsiteHTML = ` <!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"
      lang="de">
<head>
    <link rel="icon" href="/resources/assets/image/favicon/favicon.ico" type="image/x-icon">
    <link rel="icon" href="/resources/assets/image/favicon/favicon.svg" type="image/svg+xml">
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width"/>
    <link rel="apple-touch-icon" sizes="57x57" href="/resources/assets/image/favicon/apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="114x114" href="/resources/assets/image/favicon/apple-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="72x72" href="/resources/assets/image/favicon/apple-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="144x144" href="/resources/assets/image/favicon/apple-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="60x60" href="/resources/assets/image/favicon/apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="120x120" href="/resources/assets/image/favicon/apple-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="76x76" href="/resources/assets/image/favicon/apple-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/resources/assets/image/favicon/apple-icon-152x152.png">
    <link rel="icon" type="image/png" href="/resources/assets/image/favicon/favicon-96x96.png" sizes="96x96">
    <link rel="icon" type="image/png" href="/resources/assets/image/favicon/favicon-32x32.png" sizes="32x32">
    <link rel="icon" type="image/png" href="/resources/assets/image/favicon/favicon-16x16.png" sizes="16x16">
    <meta name="msapplication-TileColor" content="#0BA6CD">
    <meta name="msapplication-TileImage" content="/resources/assets/image/favicon/mstile-70x70.png">
    <meta name="msapplication-TileImage" content="/resources/assets/image/favicon/mstile-144x144.png">
    <meta name="msapplication-TileImage" content="/resources/assets/image/favicon/mstile-150x150.png">
    <meta name="msapplication-TileImage" content="/resources/assets/image/favicon/mstile-310x310.png">
        <meta name="author" content="tagesschau.de"/>
        <link rel="canonical" href="https://www.tagesschau.de/" />
    <meta name="publisher" content="tagesschau.de"/>
    <link rel="author" title="Kontakt" href="/kontakt"/>
    <link rel="start" title="Startseite" href="https://www.tagesschau.de/"/>
    <link rel="search" title="Suche" href="/suche"/>
    <link rel="copyright" title="Impressum" href="/impressum"/>
    <link rel="help" title="Hilfe" href="/hilfe"/>
        <link rel="alternate" type="application/atom+xml" title="ATOM"
              href="https://www.tagesschau.de/index~atom.xml">
        <link rel="alternate" type="application/rss+xml" title="RSS"
              href="https://www.tagesschau.de/index~rss2.xml">
        <link rel="alternate" type="application/rdf+xml" title="RDF"
              href="https://www.tagesschau.de/index~rdf.xml">
            <link href="https://ard.social/@tagesschau" rel="me">
        <title>tagesschau.de - die erste Adresse für Nachrichten und Information | tagesschau.de</title>
            <link rel="preconnect" href="https://images.tagesschau.de" crossorigin>
            <link rel="preconnect" href="https://images.tagesschau.de">
            <link rel="preconnect" href="https://de-config.sensic.net" crossorigin>
            <link rel="preconnect" href="https://de-config.sensic.net">
            <link rel="preconnect" href="https://logs1413.xiti.com" crossorigin>
            <link rel="preconnect" href="https://logs1413.xiti.com">
            <link rel="preconnect" href="https://player.h-cdn.com" crossorigin>
            <link rel="preconnect" href="https://player.h-cdn.com">
            <link rel="preconnect" href="https://perr.h-cdn.com" crossorigin>
            <link rel="preconnect" href="https://perr.h-cdn.com">
            <link rel="preconnect" href="https://zagent29.h-cdn.com" crossorigin>
            <link rel="preconnect" href="https://zagent29.h-cdn.com">
            <link rel="preconnect" href="https://zagent30.h-cdn.com" crossorigin>
            <link rel="preconnect" href="https://zagent30.h-cdn.com">
            <link rel="dns-prefetch" href="https://images.tagesschau.de">
            <link rel="dns-prefetch" href="https://de-config.sensic.net">
            <link rel="dns-prefetch" href="https://de.ioam.de">
            <link rel="dns-prefetch" href="https://script.ioam.de">
            <link rel="dns-prefetch" href="https://logs1413.xiti.com">
            <link rel="dns-prefetch" href="https://player.h-cdn.com">
            <link rel="dns-prefetch" href="https://perr.h-cdn.com">
            <link rel="dns-prefetch" href="https://zagent29.h-cdn.com">
            <link rel="dns-prefetch" href="https://zagent30.h-cdn.com">
            <link rel="preload" href="/resources/assets/fonts/TheSansC5s-4_SemiLight.woff2" as="font" crossorigin>
            <link rel="preload" href="/resources/assets/fonts/TheSansC5s-6_SemiBold.woff2" as="font" crossorigin>
            <link rel="preload" href="/resources/assets/fonts/TheSansC5s-4_SemiLightItalic.woff2" as="font" crossorigin>
            <link rel="preload" href="/resources/assets/image/lazy-image-placeholder.jpg" as="image">
            <link rel="preload" href="https://images.tagesschau.de/image/2d5406e9-671d-4110-8302-de9b0a8b4832/AAABjBuUz7s/AAABibBx0zc/1x1-640/lindner-habeck-scholz-102.webp" as="image" media="(max-width: 420px)">
            <link rel="preload" href="https://images.tagesschau.de/image/2d5406e9-671d-4110-8302-de9b0a8b4832/AAABjBuUz7s/AAABibBx1ms/1x1-840/lindner-habeck-scholz-102.webp" as="image" media="(min-width: 421px) and (max-width: 767px)">
            <link rel="preload" href="https://images.tagesschau.de/image/2d5406e9-671d-4110-8302-de9b0a8b4832/AAABjBuUz7s/AAABibBx3ic/20x9-960/lindner-habeck-scholz-102.webp" as="image" media="(min-width: 768px) and (max-width: 1023px)">
            <link rel="preload" href="https://images.tagesschau.de/image/2d5406e9-671d-4110-8302-de9b0a8b4832/AAABjBuUz7s/AAABibBx2rU/20x9-1280/lindner-habeck-scholz-102.webp" as="image" media="(min-width: 1024px)">
</head>
<body>
</body>
</html>`;
const responseTagesschauWebsiteRSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0">
   <channel>
      <title>tagesschau.de - die erste Adresse für Nachrichten und Information</title>
      <link>https://www.tagesschau.de/</link>
      <description>Die aktuellen Beiträge der Seite https://www.tagesschau.de/</description>
      <language>de</language>
      <copyright>ARD-aktuell / tagesschau.de</copyright>
      <lastBuildDate>Tue, 12 Dec 2023 15:46:52 +0100</lastBuildDate>
      <pubDate>Tue, 12 Dec 2023 15:46:52 +0100</pubDate>
      <docs>http://blogs.law.harvard.edu/tech/rss</docs>
      <ttl>90</ttl>
      <dc:publisher>tagesschau.de</dc:publisher>
      <dc:language>de</dc:language>
      <dc:rights>ARD-aktuell / tagesschau.de</dc:rights>
      <dc:date>2023-12-12T14:44:56Z</dc:date>
      <dc:source>tagesschau.de</dc:source>
      <item>
         <title>Haushaltskrise: Um wie viele Milliarden es wirklich geht</title>
         <link>https://www.tagesschau.de/wirtschaft/haushalt-volumen-100.html</link>
         <description>Die Spitzen der Ampelkoalition suchen Auswege aus der Haushaltskrise. Die Wirtschaft drängt, einige Vorhaben stehen auf der Kippe. Was macht die Gespräche so schwierig - und um wie viel Geld geht es genau? Von H.-J. Vieweger.</description>
         <pubDate>Tue, 12 Dec 2023 15:20:21 +0100</pubDate>
         <guid>2371e076-f0bd-4e39-8fcf-3e6cf3308eff</guid>
         <dc:date>2023-12-12T14:20:21Z</dc:date>
         <content:encoded><![CDATA[<p> <a href="https://www.tagesschau.de/wirtschaft/haushalt-volumen-100.html"><img src="https://images.tagesschau.de/image/2d5406e9-671d-4110-8302-de9b0a8b4832/AAABjBuUz7s/AAABibBxqrQ/16x9-1280/lindner-habeck-scholz-102.jpg" alt="Christian Lindner, Robert Habeck und Olaf Scholz im Bundestag  | dpa" /></a> <br/> <br/>Die Spitzen der Ampelkoalition suchen Auswege aus der Haushaltskrise. Die Wirtschaft drängt, einige Vorhaben stehen auf der Kippe. Was macht die Gespräche so schwierig - und um wie viel Geld geht es genau? <em>Von H.-J. Vieweger.</em>[<a href="https://www.tagesschau.de/wirtschaft/haushalt-volumen-100.html">mehr</a>]</p>]]></content:encoded>
      </item>
      <item>
         <title>Verhandlungen über Haushalt gehen weiter</title>
         <link>https://www.tagesschau.de/inland/innenpolitik/haushalt-verhandlungen-fortsetzung-100.html</link>
         <description>Sie tagen wieder: Seit dem Vormittag sitzen die Spitzen der Ampel zusammen, um eine Lösung für den Haushalt 2024 zu finden. Vertreter von Wirtschaft und Gewerkschaften dringen auf eine schnelle Einigung.</description>
         <pubDate>Tue, 12 Dec 2023 12:20:01 +0100</pubDate>
         <guid>7b616ae4-0bd3-46cc-92b5-86c91235bfc3</guid>
         <dc:date>2023-12-12T11:20:01Z</dc:date>
         <content:encoded><![CDATA[<p> <a href="https://www.tagesschau.de/inland/innenpolitik/haushalt-verhandlungen-fortsetzung-100.html"><img src="https://images.tagesschau.de/image/aff9abd4-3b6c-497a-9ff9-be59a588de60/AAABjF3BVcA/AAABibBxqrQ/16x9-1280/habeck-482.jpg" alt="Robert Habeck (M, Bündnis 90/Die Grünen), Bundesminister für Wirtschaft und Klimaschutz, kommt ins Bundeskanzleramt | dpa" /></a> <br/> <br/>Sie tagen wieder: Seit dem Vormittag sitzen die Spitzen der Ampel zusammen, um eine Lösung für den Haushalt 2024 zu finden. Vertreter von Wirtschaft und Gewerkschaften dringen auf eine schnelle Einigung.[<a href="https://www.tagesschau.de/inland/innenpolitik/haushalt-verhandlungen-fortsetzung-100.html">mehr</a>]</p>]]></content:encoded>
      </item>
      <item>
         <title>Ringen um Abschlusserklärung: Die dicken Bretter der Klimakonferenz</title>
         <link>https://www.tagesschau.de/ausland/asien/cop28-knackpunkte-100.html</link>
         <description>Auf der Klimakonferenz ist es den Teilnehmern bislang nicht gelungen, sich auf einen gemeinsamen Beschluss zu verständigen. Der größte Knackpunkt ist der Ausstieg aus fossilen Energien. Doch es gibt weitere. Von M. Polansky.</description>
         <pubDate>Tue, 12 Dec 2023 13:24:39 +0100</pubDate>
         <guid>43ab2bf0-e01d-48d8-ad12-cd4de07583ff</guid>
         <dc:date>2023-12-12T12:24:39Z</dc:date>
         <content:encoded><![CDATA[<p> <a href="https://www.tagesschau.de/ausland/asien/cop28-knackpunkte-100.html"><img src="https://images.tagesschau.de/image/7fa64dfe-5ca7-4845-8dac-5cdeaa1e4c1d/AAABjF3uH6c/AAABibBxqrQ/16x9-1280/cop-aktivisten-102.jpg" alt="Verkleidete Klimaaktivisten fordern auf der Klimakonferenz in Dubai den Ausstieg aus fossilen Energien. | EPA" /></a> <br/> <br/>Auf der Klimakonferenz ist es den Teilnehmern bislang nicht gelungen, sich auf einen gemeinsamen Beschluss zu verständigen. Der größte Knackpunkt ist der Ausstieg aus fossilen Energien. Doch es gibt weitere. <em>Von M. Polansky</em>.[<a href="https://www.tagesschau.de/ausland/asien/cop28-knackpunkte-100.html">mehr</a>]</p>]]></content:encoded>
      </item>
   </channel>
</rss>`;

Deno.test('getRSSFeed - Tagesschau Website', async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    'fetchWithTimeout',
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responseTagesschauWebsiteHTML, { status: 200 }));
      }),
      new Promise((resolve) => {
        resolve(new Response(responseTagesschauWebsiteHTML, { status: 200 }));
      }),
      new Promise((resolve) => {
        resolve(new Response(responseTagesschauWebsiteRSS, { status: 200 }));
      }),
    ]),
  );

  const getFaviconSpy = stub(
    feedutils,
    'getFavicon',
    returnsNext([
      new Promise((resolve) => {
        resolve({
          url:
            'https://www.tagesschau.de/resources/assets/image/favicon/apple-icon-152x152.png',
          size: 20251,
          extension: 'png',
        });
      }),
    ]),
  );

  const uploadSourceIconSpy = stub(
    feedutils,
    'uploadSourceIcon',
    returnsNext([
      new Promise((resolve) => {
        resolve(
          'https://www.tagesschau.de/resources/assets/image/favicon/apple-icon-152x152.png',
        );
      }),
    ]),
  );

  try {
    const { source, items } = await getRSSFeed(
      supabaseClient,
      undefined,
      mockProfile,
      {
        ...mockSource,
        options: {
          rss: 'https://www.tagesschau.de',
        },
      },
    );
    assertEqualsSource(source, {
      'id': 'rss-myuser-mycolumn-790bbd13d8bff02d80672419ea0709b5',
      'columnId': 'mycolumn',
      'userId': 'myuser',
      'type': 'rss',
      'title':
        'tagesschau.de - die erste Adresse für Nachrichten und Information',
      'options': { 'rss': 'https://www.tagesschau.de/index~rss2.xml' },
      'link': 'https://www.tagesschau.de/',
      'icon':
        'https://www.tagesschau.de/resources/assets/image/favicon/apple-icon-152x152.png',
    });
    assertEqualsItems(items, [{
      'id':
        'rss-myuser-mycolumn-790bbd13d8bff02d80672419ea0709b5-0937a33dc3b35c2982ebb30ca389f6f8',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'rss-myuser-mycolumn-790bbd13d8bff02d80672419ea0709b5',
      'title': 'Haushaltskrise: Um wie viele Milliarden es wirklich geht',
      'link': 'https://www.tagesschau.de/wirtschaft/haushalt-volumen-100.html',
      'media':
        'https://images.tagesschau.de/image/2d5406e9-671d-4110-8302-de9b0a8b4832/AAABjBuUz7s/AAABibBxqrQ/16x9-1280/lindner-habeck-scholz-102.jpg',
      'description':
        'Die Spitzen der Ampelkoalition suchen Auswege aus der Haushaltskrise. Die Wirtschaft drängt, einige Vorhaben stehen auf der Kippe. Was macht die Gespräche so schwierig - und um wie viel Geld geht es genau? Von H.-J. Vieweger.',
      'publishedAt': 1702390821,
    }, {
      'id':
        'rss-myuser-mycolumn-790bbd13d8bff02d80672419ea0709b5-73a9b28a98ee50d9d79c0b7b03fae3a8',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'rss-myuser-mycolumn-790bbd13d8bff02d80672419ea0709b5',
      'title': 'Verhandlungen über Haushalt gehen weiter',
      'link':
        'https://www.tagesschau.de/inland/innenpolitik/haushalt-verhandlungen-fortsetzung-100.html',
      'media':
        'https://images.tagesschau.de/image/aff9abd4-3b6c-497a-9ff9-be59a588de60/AAABjF3BVcA/AAABibBxqrQ/16x9-1280/habeck-482.jpg',
      'description':
        'Sie tagen wieder: Seit dem Vormittag sitzen die Spitzen der Ampel zusammen, um eine Lösung für den Haushalt 2024 zu finden. Vertreter von Wirtschaft und Gewerkschaften dringen auf eine schnelle Einigung.',
      'publishedAt': 1702380001,
    }, {
      'id':
        'rss-myuser-mycolumn-790bbd13d8bff02d80672419ea0709b5-fbdf4ad3cc0a0edfbde09afe55844dde',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'rss-myuser-mycolumn-790bbd13d8bff02d80672419ea0709b5',
      'title':
        'Ringen um Abschlusserklärung: Die dicken Bretter der Klimakonferenz',
      'link':
        'https://www.tagesschau.de/ausland/asien/cop28-knackpunkte-100.html',
      'media':
        'https://images.tagesschau.de/image/7fa64dfe-5ca7-4845-8dac-5cdeaa1e4c1d/AAABjF3uH6c/AAABibBxqrQ/16x9-1280/cop-aktivisten-102.jpg',
      'description':
        'Auf der Klimakonferenz ist es den Teilnehmern bislang nicht gelungen, sich auf einen gemeinsamen Beschluss zu verständigen. Der größte Knackpunkt ist der Ausstieg aus fossilen Energien. Doch es gibt weitere. Von M. Polansky.',
      'publishedAt': 1702383879,
    }]);
  } finally {
    fetchWithTimeoutSpy.restore();
    getFaviconSpy.restore();
    uploadSourceIconSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      'https://www.tagesschau.de',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseTagesschauWebsiteHTML, { status: 200 }));
    }),
  });
  assertSpyCall(fetchWithTimeoutSpy, 1, {
    args: [
      'https://www.tagesschau.de',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseTagesschauWebsiteHTML, { status: 200 }));
    }),
  });
  assertSpyCall(fetchWithTimeoutSpy, 2, {
    args: [
      'https://www.tagesschau.de/index~rss2.xml',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseTagesschauWebsiteRSS, { status: 200 }));
    }),
  });
  assertSpyCall(getFaviconSpy, 0, {
    args: ['https://www.tagesschau.de/'],
    returned: new Promise((resolve) => {
      resolve({
        url:
          'https://www.tagesschau.de/resources/assets/image/favicon/apple-icon-152x152.png',
        size: 20251,
        extension: 'png',
      });
    }),
  });
  assertSpyCall(uploadSourceIconSpy, 0, {
    args: [
      supabaseClient,
      {
        'id': 'rss-myuser-mycolumn-790bbd13d8bff02d80672419ea0709b5',
        'columnId': 'mycolumn',
        'userId': 'myuser',
        'type': 'rss',
        'title':
          'tagesschau.de - die erste Adresse für Nachrichten und Information',
        'options': { 'rss': 'https://www.tagesschau.de/index~rss2.xml' },
        'link': 'https://www.tagesschau.de/',
        'icon':
          'https://www.tagesschau.de/resources/assets/image/favicon/apple-icon-152x152.png',
      },
    ],
    returned: new Promise((resolve) => {
      resolve(
        'https://www.tagesschau.de/resources/assets/image/favicon/apple-icon-152x152.png',
      );
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 3);
  assertSpyCalls(getFaviconSpy, 1);
  assertSpyCalls(uploadSourceIconSpy, 1);
});

const responseTagesschauAtom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://purl.org/atom/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" version="0.3">
   <title>tagesschau.de - die erste Adresse für Nachrichten und Information</title>
   <link rel="alternate" href="https://www.tagesschau.de/" />
   <author>
      <name>tagesschau.de</name>
   </author>
   <tagline>Die aktuellen Beiträge der Seite https://www.tagesschau.de/</tagline>
   <copyright>ARD-aktuell / tagesschau.de</copyright>
   <dc:date>2023-12-12T16:10:24Z</dc:date>
   <dc:language>de</dc:language>
   <dc:rights>ARD-aktuell / tagesschau.de</dc:rights>
   <entry>
      <title>Haushaltskrise: Um wie viele Milliarden es wirklich geht</title>
      <link rel="alternate" href="https://www.tagesschau.de/wirtschaft/haushalt-volumen-100.html" />
      <id>2371e076-f0bd-4e39-8fcf-3e6cf3308eff</id>
      <summary type="text/html" mode="escaped">Die Spitzen der Ampelkoalition suchen Auswege aus der Haushaltskrise. Die Wirtschaft drängt, einige Vorhaben stehen auf der Kippe. Was macht die Gespräche so schwierig - und um wie viel Geld geht es genau? Von H.-J. Vieweger.</summary>
      <content mode="escaped">&lt;![CDATA[&lt;p &gt;&lt;a href="https://www.tagesschau.de/wirtschaft/haushalt-volumen-100.html"&gt;&lt;img src="https://images.tagesschau.de/image/2d5406e9-671d-4110-8302-de9b0a8b4832/AAABjBuUz7s/AAABibBxqrQ/16x9-1280/lindner-habeck-scholz-102.jpg" alt="Christian Lindner, Robert Habeck und Olaf Scholz im Bundestag  | dpa" /&gt;&lt;/a &gt;&lt;br/&gt;&lt;br/&gt;Die Spitzen der Ampelkoalition suchen Auswege aus der Haushaltskrise. Die Wirtschaft drängt, einige Vorhaben stehen auf der Kippe. Was macht die Gespräche so schwierig - und um wie viel Geld geht es genau? &lt;em &gt;Von H.-J. Vieweger.&lt;/em &gt;[&lt;a href="https://www.tagesschau.de/wirtschaft/haushalt-volumen-100.html"&gt;mehr &lt;/a &gt;]&lt;/p &gt;]]&gt;</content>
      <dc:date>2023-12-12T14:20:21Z</dc:date>
   </entry>
   <entry>
      <title>Verhandlungen über Haushalt gehen weiter</title>
      <link rel="alternate" href="https://www.tagesschau.de/inland/innenpolitik/haushalt-verhandlungen-fortsetzung-100.html" />
      <id>7b616ae4-0bd3-46cc-92b5-86c91235bfc3</id>
      <summary type="text/html" mode="escaped">Sie tagen wieder: Seit dem Vormittag sitzen die Spitzen der Ampel zusammen, um eine Lösung für den Haushalt 2024 zu finden. Vertreter von Wirtschaft und Gewerkschaften dringen auf eine schnelle Einigung.</summary>
      <content mode="escaped">&lt;![CDATA[&lt;p &gt;&lt;a href="https://www.tagesschau.de/inland/innenpolitik/haushalt-verhandlungen-fortsetzung-100.html"&gt;&lt;img src="https://images.tagesschau.de/image/aff9abd4-3b6c-497a-9ff9-be59a588de60/AAABjF3BVcA/AAABibBxqrQ/16x9-1280/habeck-482.jpg" alt="Robert Habeck (M, Bündnis 90/Die Grünen), Bundesminister für Wirtschaft und Klimaschutz, kommt ins Bundeskanzleramt | dpa" /&gt;&lt;/a &gt;&lt;br/&gt;&lt;br/&gt;Sie tagen wieder: Seit dem Vormittag sitzen die Spitzen der Ampel zusammen, um eine Lösung für den Haushalt 2024 zu finden. Vertreter von Wirtschaft und Gewerkschaften dringen auf eine schnelle Einigung.[&lt;a href="https://www.tagesschau.de/inland/innenpolitik/haushalt-verhandlungen-fortsetzung-100.html"&gt;mehr &lt;/a &gt;]&lt;/p &gt;]]&gt;</content>
      <dc:date>2023-12-12T11:20:01Z</dc:date>
   </entry>
</feed>`;

Deno.test('getRSSFeed - Tagesschau Atom', async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    'fetchWithTimeout',
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responseTagesschauAtom, { status: 200 }));
      }),
    ]),
  );

  const getFaviconSpy = stub(
    feedutils,
    'getFavicon',
    returnsNext([
      new Promise((resolve) => {
        resolve(undefined);
      }),
    ]),
  );

  const uploadSourceIconSpy = stub(
    feedutils,
    'uploadSourceIcon',
    returnsNext([
      new Promise((resolve) => {
        resolve(undefined);
      }),
    ]),
  );

  try {
    const { source, items } = await getRSSFeed(
      supabaseClient,
      undefined,
      mockProfile,
      {
        ...mockSource,
        options: {
          rss: 'https://www.tagesschau.de/index~atom.xml',
        },
      },
    );
    assertEqualsSource(source, {
      'id': 'rss-myuser-mycolumn-8465a4b4e81845fd534f45a3ef63ae7f',
      'columnId': 'mycolumn',
      'userId': 'myuser',
      'type': 'rss',
      'title':
        'tagesschau.de - die erste Adresse für Nachrichten und Information',
      'options': { 'rss': 'https://www.tagesschau.de/index~atom.xml' },
      'link': 'https://www.tagesschau.de/',
    });
    assertEqualsItems(items, [{
      'id':
        'rss-myuser-mycolumn-8465a4b4e81845fd534f45a3ef63ae7f-0937a33dc3b35c2982ebb30ca389f6f8',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'rss-myuser-mycolumn-8465a4b4e81845fd534f45a3ef63ae7f',
      'title': 'Haushaltskrise: Um wie viele Milliarden es wirklich geht',
      'link': 'https://www.tagesschau.de/wirtschaft/haushalt-volumen-100.html',
      'media':
        'https://images.tagesschau.de/image/2d5406e9-671d-4110-8302-de9b0a8b4832/AAABjBuUz7s/AAABibBxqrQ/16x9-1280/lindner-habeck-scholz-102.jpg',
      'description':
        'Die Spitzen der Ampelkoalition suchen Auswege aus der Haushaltskrise. Die Wirtschaft drängt, einige Vorhaben stehen auf der Kippe. Was macht die Gespräche so schwierig - und um wie viel Geld geht es genau? Von H.-J. Vieweger.',
      'publishedAt': 1702390821,
    }, {
      'id':
        'rss-myuser-mycolumn-8465a4b4e81845fd534f45a3ef63ae7f-73a9b28a98ee50d9d79c0b7b03fae3a8',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'rss-myuser-mycolumn-8465a4b4e81845fd534f45a3ef63ae7f',
      'title': 'Verhandlungen über Haushalt gehen weiter',
      'link':
        'https://www.tagesschau.de/inland/innenpolitik/haushalt-verhandlungen-fortsetzung-100.html',
      'media':
        'https://images.tagesschau.de/image/aff9abd4-3b6c-497a-9ff9-be59a588de60/AAABjF3BVcA/AAABibBxqrQ/16x9-1280/habeck-482.jpg',
      'description':
        'Sie tagen wieder: Seit dem Vormittag sitzen die Spitzen der Ampel zusammen, um eine Lösung für den Haushalt 2024 zu finden. Vertreter von Wirtschaft und Gewerkschaften dringen auf eine schnelle Einigung.',
      'publishedAt': 1702380001,
    }]);
  } finally {
    fetchWithTimeoutSpy.restore();
    getFaviconSpy.restore();
    uploadSourceIconSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      'https://www.tagesschau.de/index~atom.xml',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseTagesschauAtom, { status: 200 }));
    }),
  });
  assertSpyCall(getFaviconSpy, 0, {
    args: ['https://www.tagesschau.de/'],
    returned: new Promise((resolve) => {
      resolve(undefined);
    }),
  });
  assertSpyCall(uploadSourceIconSpy, 0, {
    args: [
      supabaseClient,
      {
        'id': 'rss-myuser-mycolumn-8465a4b4e81845fd534f45a3ef63ae7f',
        'columnId': 'mycolumn',
        'userId': 'myuser',
        'type': 'rss',
        'title':
          'tagesschau.de - die erste Adresse für Nachrichten und Information',
        'options': { 'rss': 'https://www.tagesschau.de/index~atom.xml' },
        'link': 'https://www.tagesschau.de/',
        icon: undefined,
      },
    ],
    returned: new Promise((resolve) => {
      resolve(undefined);
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
  assertSpyCalls(getFaviconSpy, 1);
  assertSpyCalls(uploadSourceIconSpy, 1);
});

const responseTagesschauRDF = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://purl.org/rss/1.0/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:mp="http://www.tagesschau.de/rss/1.0/modules/metaplus/1.2.0/" xmlns:sy="http://purl.org/rss/1.0/modules/syndication/">
   <channel rdf:about="https://www.tagesschau.de/">
      <title>tagesschau.de - die erste Adresse für Nachrichten und Information</title>
      <link>https://www.tagesschau.de/</link>
      <description>Die aktuellen Beiträge der Seite https://www.tagesschau.de/</description>
      <language>de</language>
      <copyright>ARD-aktuell / tagesschau.de</copyright>
      <lastBuildDate>Tue, 12 Dec 2023 17:18:00 +0100</lastBuildDate>
      <pubDate>Tue, 12 Dec 2023 17:18:00 +0100</pubDate>
      <ttl>90</ttl>
      <image rdf:resource="https://images.tagesschau.de/image/89045d82-5cd5-46ad-8f91-73911add30ee/AAABh3YLLz0/AAABibBx4co/original/tagesschau-logo-100.jpg" />
      <dc:publisher>tagesschau.de</dc:publisher>
      <dc:language>de</dc:language>
      <dc:rights>ARD-aktuell / tagesschau.de</dc:rights>
      <dc:date>2023-12-12T16:14:28+00:00</dc:date>
      <dc:source>tagesschau.de</dc:source>
      <sy:updatePeriod>hourly</sy:updatePeriod>
      <sy:updateFrequency>1</sy:updateFrequency>
      <sy:updateBase>2023-12-12T16:18:00+00:00</sy:updateBase>
      <items>
         <rdf:Seq>
            <rdf:li rdf:resource="2371e076-f0bd-4e39-8fcf-3e6cf3308eff" />
            <rdf:li rdf:resource="7b616ae4-0bd3-46cc-92b5-86c91235bfc3" />
         </rdf:Seq>
      </items>
   </channel>
   <image>
      <title>tagesschau | ARD-aktuell</title>
      <url>https://images.tagesschau.de/image/89045d82-5cd5-46ad-8f91-73911add30ee/AAABh3YLLz0/AAABibBx4co/original/tagesschau-logo-100.jpg</url>
      <link>https://tagesschau.de</link>
   </image>
   <item rdf:about="2371e076-f0bd-4e39-8fcf-3e6cf3308eff">
      <title>Haushaltskrise: Um wie viele Milliarden es wirklich geht</title>
      <link>https://www.tagesschau.de/wirtschaft/haushalt-volumen-100.html</link>
      <description>Die Spitzen der Ampelkoalition suchen Auswege aus der Haushaltskrise. Die Wirtschaft drängt, einige Vorhaben stehen auf der Kippe. Was macht die Gespräche so schwierig - und um wie viel Geld geht es genau? Von H.-J. Vieweger.</description>
      <pubDate>Tue, 12 Dec 2023 15:20:21 +0100</pubDate>
      <guid>2371e076-f0bd-4e39-8fcf-3e6cf3308eff</guid>
      <dc:date>2023-12-12T14:20:21Z</dc:date>
      <content:encoded><![CDATA[<p> <a href="https://www.tagesschau.de/wirtschaft/haushalt-volumen-100.html"><img src="https://images.tagesschau.de/image/2d5406e9-671d-4110-8302-de9b0a8b4832/AAABjBuUz7s/AAABibBxqrQ/16x9-1280/lindner-habeck-scholz-102.jpg" alt="Christian Lindner, Robert Habeck und Olaf Scholz im Bundestag  | dpa" /></a> <br/> <br/>Die Spitzen der Ampelkoalition suchen Auswege aus der Haushaltskrise. Die Wirtschaft drängt, einige Vorhaben stehen auf der Kippe. Was macht die Gespräche so schwierig - und um wie viel Geld geht es genau? <em>Von H.-J. Vieweger.</em>[<a href="https://www.tagesschau.de/wirtschaft/haushalt-volumen-100.html">mehr</a>]</p>]]></content:encoded>
      <dc:format>text/xml</dc:format>
      <dc:rights>ARD-aktuell / tagesschau.de</dc:rights>
      <dc:language>de</dc:language>
      <dc:publisher>tagesschau.de</dc:publisher>
      <dc:identifier>haushalt-volumen-100</dc:identifier>
      <dc:subjects />
      <dcterms:audience>all</dcterms:audience>
      <dcterms:isFormatOf rdf:resource="https://www.tagesschau.de/wirtschaft/haushalt-volumen-100~rss2.xml" />
   </item>
   <item rdf:about="7b616ae4-0bd3-46cc-92b5-86c91235bfc3">
      <title>Verhandlungen über Haushalt gehen weiter</title>
      <link>https://www.tagesschau.de/inland/innenpolitik/haushalt-verhandlungen-fortsetzung-100.html</link>
      <description>Sie tagen wieder: Seit dem Vormittag sitzen die Spitzen der Ampel zusammen, um eine Lösung für den Haushalt 2024 zu finden. Vertreter von Wirtschaft und Gewerkschaften dringen auf eine schnelle Einigung.</description>
      <pubDate>Tue, 12 Dec 2023 12:20:01 +0100</pubDate>
      <guid>7b616ae4-0bd3-46cc-92b5-86c91235bfc3</guid>
      <dc:date>2023-12-12T11:20:01Z</dc:date>
      <content:encoded><![CDATA[<p> <a href="https://www.tagesschau.de/inland/innenpolitik/haushalt-verhandlungen-fortsetzung-100.html"><img src="https://images.tagesschau.de/image/aff9abd4-3b6c-497a-9ff9-be59a588de60/AAABjF3BVcA/AAABibBxqrQ/16x9-1280/habeck-482.jpg" alt="Robert Habeck (M, Bündnis 90/Die Grünen), Bundesminister für Wirtschaft und Klimaschutz, kommt ins Bundeskanzleramt | dpa" /></a> <br/> <br/>Sie tagen wieder: Seit dem Vormittag sitzen die Spitzen der Ampel zusammen, um eine Lösung für den Haushalt 2024 zu finden. Vertreter von Wirtschaft und Gewerkschaften dringen auf eine schnelle Einigung.[<a href="https://www.tagesschau.de/inland/innenpolitik/haushalt-verhandlungen-fortsetzung-100.html">mehr</a>]</p>]]></content:encoded>
      <dc:format>text/xml</dc:format>
      <dc:rights>ARD-aktuell / tagesschau.de</dc:rights>
      <dc:language>de</dc:language>
      <dc:publisher>tagesschau.de</dc:publisher>
      <dc:identifier>haushalt-verhandlungen-fortsetzung-100</dc:identifier>
      <dc:subjects />
      <dcterms:audience>all</dcterms:audience>
      <dcterms:isFormatOf rdf:resource="https://www.tagesschau.de/inland/innenpolitik/haushalt-verhandlungen-fortsetzung-100~rss2.xml" />
   </item>
</rdf:RDF>`;

Deno.test('getRSSFeed - Tagesschau RDF', async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    'fetchWithTimeout',
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responseTagesschauRDF, { status: 200 }));
      }),
    ]),
  );

  const getFaviconSpy = stub(
    feedutils,
    'getFavicon',
    returnsNext([
      new Promise((resolve) => {
        resolve(undefined);
      }),
    ]),
  );

  const uploadSourceIconSpy = stub(
    feedutils,
    'uploadSourceIcon',
    returnsNext([
      new Promise((resolve) => {
        resolve(undefined);
      }),
    ]),
  );

  try {
    const { source, items } = await getRSSFeed(
      supabaseClient,
      undefined,
      mockProfile,
      {
        ...mockSource,
        options: {
          rss: 'https://www.tagesschau.de/index~rdf.xml',
        },
      },
    );
    assertEqualsSource(source, {
      'id': 'rss-myuser-mycolumn-315eca5c9ed1af9968989241a5b7de09',
      'columnId': 'mycolumn',
      'userId': 'myuser',
      'type': 'rss',
      'title':
        'tagesschau.de - die erste Adresse für Nachrichten und Information',
      'options': { 'rss': 'https://www.tagesschau.de/index~rdf.xml' },
      'link': 'https://www.tagesschau.de/',
    });
    assertEqualsItems(items, [{
      'id':
        'rss-myuser-mycolumn-315eca5c9ed1af9968989241a5b7de09-d1a49b5818b63c6c2d4cbabb45086a8c',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'rss-myuser-mycolumn-315eca5c9ed1af9968989241a5b7de09',
      'title': 'Haushaltskrise: Um wie viele Milliarden es wirklich geht',
      'link': 'https://www.tagesschau.de/wirtschaft/haushalt-volumen-100.html',
      'description':
        'Die Spitzen der Ampelkoalition suchen Auswege aus der Haushaltskrise. Die Wirtschaft drängt, einige Vorhaben stehen auf der Kippe. Was macht die Gespräche so schwierig - und um wie viel Geld geht es genau? Von H.-J. Vieweger.',
      'publishedAt': 1702390821,
    }, {
      'id':
        'rss-myuser-mycolumn-315eca5c9ed1af9968989241a5b7de09-c2f8e98ba67224f9e65c3623e7989fd6',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'rss-myuser-mycolumn-315eca5c9ed1af9968989241a5b7de09',
      'title': 'Verhandlungen über Haushalt gehen weiter',
      'link':
        'https://www.tagesschau.de/inland/innenpolitik/haushalt-verhandlungen-fortsetzung-100.html',
      'description':
        'Sie tagen wieder: Seit dem Vormittag sitzen die Spitzen der Ampel zusammen, um eine Lösung für den Haushalt 2024 zu finden. Vertreter von Wirtschaft und Gewerkschaften dringen auf eine schnelle Einigung.',
      'publishedAt': 1702380001,
    }]);
  } finally {
    fetchWithTimeoutSpy.restore();
    getFaviconSpy.restore();
    uploadSourceIconSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      'https://www.tagesschau.de/index~rdf.xml',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseTagesschauRDF, { status: 200 }));
    }),
  });
  assertSpyCall(getFaviconSpy, 0, {
    args: ['https://www.tagesschau.de/'],
    returned: new Promise((resolve) => {
      resolve(undefined);
    }),
  });
  assertSpyCall(uploadSourceIconSpy, 0, {
    args: [
      supabaseClient,
      {
        'id': 'rss-myuser-mycolumn-315eca5c9ed1af9968989241a5b7de09',
        'columnId': 'mycolumn',
        'userId': 'myuser',
        'type': 'rss',
        'title':
          'tagesschau.de - die erste Adresse für Nachrichten und Information',
        'options': { 'rss': 'https://www.tagesschau.de/index~rdf.xml' },
        'link': 'https://www.tagesschau.de/',
        icon: undefined,
      },
    ],
    returned: new Promise((resolve) => {
      resolve(undefined);
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
  assertSpyCalls(getFaviconSpy, 1);
  assertSpyCalls(uploadSourceIconSpy, 1);
});

const responseNYT = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/" xmlns:nyt="http://www.nytimes.com/namespaces/rss/2.0" version="2.0">
   <channel>
      <title>NYT &gt;World News</title>
      <link>https://www.nytimes.com/section/world</link>
      <atom:link href="https://rss.nytimes.com/services/xml/rss/nyt/World.xml" rel="self" type="application/rss+xml" />
      <description />
      <language>en-us</language>
      <copyright>Copyright 2023 The New York Times Company</copyright>
      <lastBuildDate>Tue, 12 Dec 2023 17:20:39 +0000</lastBuildDate>
      <pubDate>Tue, 12 Dec 2023 17:18:21 +0000</pubDate>
      <image>
         <title>NYT &gt;World News</title>
         <url>https://static01.nyt.com/images/misc/NYT_logo_rss_250x40.png</url>
         <link>https://www.nytimes.com/section/world</link>
      </image>
      <item>
         <title>Israel-Hamas War: Houthis Strike Commercial Ship in Red Sea, Fanning Fears of Wider War</title>
         <link>https://www.nytimes.com/live/2023/12/12/world/israel-hamas-gaza-war-news</link>
         <guid isPermaLink="true">https://www.nytimes.com/live/2023/12/12/world/israel-hamas-gaza-war-news</guid>
         <atom:link href="https://www.nytimes.com/live/2023/12/12/world/israel-hamas-gaza-war-news" rel="standout" />
         <description>A missile hit a tanker in one of the first successful strikes on a ship by the Iranian-backed Houthi militia in Yemen, which has vowed to target vessels in protest of Israel’s assault on Gaza.</description>
         <dc:creator>The New York Times</dc:creator>
         <pubDate>Tue, 12 Dec 2023 17:17:11 +0000</pubDate>
         <media:content height="1800" medium="image" url="https://static01.nyt.com/images/2023/12/12/multimedia/12israel-hamas-header-sub-cthq/12israel-hamas-header-sub-cthq-mediumSquareAt3X.jpg" width="1800" />
         <media:credit>Khaled Abdullah/Reuters</media:credit>
         <media:description>Protesting in Sanaa, Yemen, this month to show support for Palestinians in Gaza.</media:description>
      </item>
      <item>
         <title>Russia-Ukraine War: As Zelensky Pleads for Aid, Republicans Demand Border Concessions From Biden</title>
         <link>https://www.nytimes.com/live/2023/12/12/us/zelensky-biden-visit</link>
         <guid isPermaLink="true">https://www.nytimes.com/live/2023/12/12/us/zelensky-biden-visit</guid>
         <atom:link href="https://www.nytimes.com/live/2023/12/12/us/zelensky-biden-visit" rel="standout" />
         <description>Ukraine’s president is in Washington with an urgent request for more help to fight Russia, but Republicans in both chambers say they won’t act without a border deal. Mr. Zelensky will meet soon with President Biden.</description>
         <dc:creator>The New York Times</dc:creator>
         <pubDate>Tue, 12 Dec 2023 17:17:11 +0000</pubDate>
         <media:content height="1800" medium="image" url="https://static01.nyt.com/images/2023/12/12/multimedia/12zelensky-dc-blog/12zelensky-dc-hp-mediumSquareAt3X-v2.jpg" width="1800" />
         <media:credit>Kent Nishimura for The New York Times</media:credit>
         <media:description>President Volodymyr Zelensky of Ukraine arriving at the Capitol on Tuesday, where he earned a show of support from Senators Chuck Schumer and Mitch McConnell.</media:description>
      </item>
   </channel>
</rss>`;

Deno.test('getRSSFeed - NYT', async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    'fetchWithTimeout',
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responseNYT, { status: 200 }));
      }),
    ]),
  );

  const getFaviconSpy = stub(
    feedutils,
    'getFavicon',
    returnsNext([
      new Promise((resolve) => {
        resolve(undefined);
      }),
    ]),
  );

  const uploadSourceIconSpy = stub(
    feedutils,
    'uploadSourceIcon',
    returnsNext([
      new Promise((resolve) => {
        resolve(undefined);
      }),
    ]),
  );

  try {
    const { source, items } = await getRSSFeed(
      supabaseClient,
      undefined,
      mockProfile,
      {
        ...mockSource,
        options: {
          rss: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
        },
      },
    );
    assertEqualsSource(source, {
      'id': 'rss-myuser-mycolumn-befdaecfac50335eaa1a93512d673fb6',
      'columnId': 'mycolumn',
      'userId': 'myuser',
      'type': 'rss',
      'title': 'NYT >World News',
      'options': {
        'rss': 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
      },
      'link': 'https://www.nytimes.com/section/world',
    });
    assertEqualsItems(items, [{
      'id':
        'rss-myuser-mycolumn-befdaecfac50335eaa1a93512d673fb6-d22cc21707b95a8e85b4c7bd88b712e5',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'rss-myuser-mycolumn-befdaecfac50335eaa1a93512d673fb6',
      'title':
        'Israel-Hamas War: Houthis Strike Commercial Ship in Red Sea, Fanning Fears of Wider War',
      'link':
        'https://www.nytimes.com/live/2023/12/12/world/israel-hamas-gaza-war-news',
      'media':
        'https://static01.nyt.com/images/2023/12/12/multimedia/12israel-hamas-header-sub-cthq/12israel-hamas-header-sub-cthq-mediumSquareAt3X.jpg',
      'description':
        'A missile hit a tanker in one of the first successful strikes on a ship by the Iranian-backed Houthi militia in Yemen, which has vowed to target vessels in protest of Israel’s assault on Gaza.',
      'author': 'The New York Times',
      'publishedAt': 1702401431,
    }, {
      'id':
        'rss-myuser-mycolumn-befdaecfac50335eaa1a93512d673fb6-92c1a2023e17f7793d796690ff6ef250',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'rss-myuser-mycolumn-befdaecfac50335eaa1a93512d673fb6',
      'title':
        'Russia-Ukraine War: As Zelensky Pleads for Aid, Republicans Demand Border Concessions From Biden',
      'link': 'https://www.nytimes.com/live/2023/12/12/us/zelensky-biden-visit',
      'media':
        'https://static01.nyt.com/images/2023/12/12/multimedia/12zelensky-dc-blog/12zelensky-dc-hp-mediumSquareAt3X-v2.jpg',
      'description':
        'Ukraine’s president is in Washington with an urgent request for more help to fight Russia, but Republicans in both chambers say they won’t act without a border deal. Mr. Zelensky will meet soon with President Biden.',
      'author': 'The New York Times',
      'publishedAt': 1702401431,
    }]);
  } finally {
    fetchWithTimeoutSpy.restore();
    getFaviconSpy.restore();
    uploadSourceIconSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseNYT, { status: 200 }));
    }),
  });
  assertSpyCall(getFaviconSpy, 0, {
    args: ['https://www.nytimes.com/section/world'],
    returned: new Promise((resolve) => {
      resolve(undefined);
    }),
  });
  assertSpyCall(uploadSourceIconSpy, 0, {
    args: [
      supabaseClient,
      {
        'id': 'rss-myuser-mycolumn-befdaecfac50335eaa1a93512d673fb6',
        'columnId': 'mycolumn',
        'userId': 'myuser',
        'type': 'rss',
        'title': 'NYT >World News',
        'options': {
          'rss': 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
        },
        'link': 'https://www.nytimes.com/section/world',
        icon: undefined,
      },
    ],
    returned: new Promise((resolve) => {
      resolve(undefined);
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
  assertSpyCalls(getFaviconSpy, 1);
  assertSpyCalls(uploadSourceIconSpy, 1);
});

const responseCNN = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/" version="2.0">
   <channel>
      <title><![CDATA[CNN.com - RSS Channel]]></title>
      <description><![CDATA[CNN.com delivers up-to-the-minute news and information on the latest top stories, weather, entertainment, politics and more.]]></description>
      <link>http://www.cnn.com</link>
      <image>
         <url>http://i2.cdn.turner.com/cnn/2015/images/09/24/cnn.digital.png</url>
         <title>CNN.com - RSS Channel</title>
         <link>http://www.cnn.com</link>
      </image>
      <generator>coredev-bumblebee</generator>
      <lastBuildDate>Tue, 12 Dec 2023 16:50:57 GMT</lastBuildDate>
      <pubDate>Tue, 12 Dec 2023 16:50:57 GMT</pubDate>
      <copyright><![CDATA[Copyright (c) 2023 Turner Broadcasting System, Inc. All Rights Reserved.]]></copyright>
      <language><![CDATA[en-US]]></language>
      <ttl>10</ttl>
      <item>
         <title><![CDATA[Zelensky visits Washington in push for more Ukraine aid]]></title>
         <description><![CDATA[Ukrainian President Volodymyr Zelensky is meeting with President Joe Biden at the White House and lawmakers on Capitol Hill Tuesday as discussions on a Ukraine aid deal remain stalled. Follow for the latest live news updates.]]></description>
         <link>https://www.cnn.com/politics/live-news/zelensky-biden-visit-12-12-23/index.html</link>
         <guid isPermaLink="true">https://www.cnn.com/politics/live-news/zelensky-biden-visit-12-12-23/index.html</guid>
         <pubDate>Tue, 12 Dec 2023 16:11:05 GMT</pubDate>
         <media:group>
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231212094255-01-zelensky-dc-visit-121223-super-169.jpg" height="619" width="1100" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231212094255-01-zelensky-dc-visit-121223-large-11.jpg" height="300" width="300" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231212094255-01-zelensky-dc-visit-121223-vertical-large-gallery.jpg" height="552" width="414" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231212094255-01-zelensky-dc-visit-121223-video-synd-2.jpg" height="480" width="640" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231212094255-01-zelensky-dc-visit-121223-live-video.jpg" height="324" width="576" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231212094255-01-zelensky-dc-visit-121223-t1-main.jpg" height="250" width="250" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231212094255-01-zelensky-dc-visit-121223-vertical-gallery.jpg" height="360" width="270" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231212094255-01-zelensky-dc-visit-121223-story-body.jpg" height="169" width="300" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231212094255-01-zelensky-dc-visit-121223-t1-main.jpg" height="250" width="250" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231212094255-01-zelensky-dc-visit-121223-assign.jpg" height="186" width="248" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231212094255-01-zelensky-dc-visit-121223-hp-video.jpg" height="144" width="256" type="image/jpeg" />
         </media:group>
      </item>
      <item>
         <title><![CDATA[Humanitarian crisis worsens in Gaza as Israel-Hamas war intensifies]]></title>
         <description><![CDATA[The United Nations General Assembly will resume its emergency session Tuesday on Gaza, days after the United States vetoed a Security Council resolution calling for a ceasefire. Follow for live updates.]]></description>
         <link>https://www.cnn.com/middleeast/live-news/israel-hamas-war-gaza-news-12-12-23/index.html</link>
         <guid isPermaLink="true">https://www.cnn.com/middleeast/live-news/israel-hamas-war-gaza-news-12-12-23/index.html</guid>
         <pubDate>Tue, 12 Dec 2023 16:01:14 GMT</pubDate>
         <media:group>
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231211100814-gaza-skyline-5t-121123-super-169.jpeg" height="619" width="1100" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231211100814-gaza-skyline-5t-121123-large-11.jpeg" height="300" width="300" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231211100814-gaza-skyline-5t-121123-vertical-large-gallery.jpeg" height="552" width="414" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231211100814-gaza-skyline-5t-121123-video-synd-2.jpeg" height="480" width="640" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231211100814-gaza-skyline-5t-121123-live-video.jpeg" height="324" width="576" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231211100814-gaza-skyline-5t-121123-t1-main.jpeg" height="250" width="250" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231211100814-gaza-skyline-5t-121123-vertical-gallery.jpeg" height="360" width="270" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231211100814-gaza-skyline-5t-121123-story-body.jpeg" height="169" width="300" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231211100814-gaza-skyline-5t-121123-t1-main.jpeg" height="250" width="250" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231211100814-gaza-skyline-5t-121123-assign.jpeg" height="186" width="248" type="image/jpeg" />
            <media:content medium="image" url="https://cdn.cnn.com/cnnnext/dam/assets/231211100814-gaza-skyline-5t-121123-hp-video.jpeg" height="144" width="256" type="image/jpeg" />
         </media:group>
      </item>
   </channel>
</rss>`;

Deno.test('getRSSFeed - CNN', async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    'fetchWithTimeout',
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responseCNN, { status: 200 }));
      }),
    ]),
  );

  const getFaviconSpy = stub(
    feedutils,
    'getFavicon',
    returnsNext([
      new Promise((resolve) => {
        resolve(undefined);
      }),
    ]),
  );

  const uploadSourceIconSpy = stub(
    feedutils,
    'uploadSourceIcon',
    returnsNext([
      new Promise((resolve) => {
        resolve(undefined);
      }),
    ]),
  );

  try {
    const { source, items } = await getRSSFeed(
      supabaseClient,
      undefined,
      mockProfile,
      {
        ...mockSource,
        options: {
          rss: 'http://rss.cnn.com/rss/cnn_latest.rss',
        },
      },
    );
    assertEqualsSource(source, {
      'id': 'rss-myuser-mycolumn-27c792d08caef396bf1e3ce488f6b4ea',
      'columnId': 'mycolumn',
      'userId': 'myuser',
      'type': 'rss',
      'title': 'CNN.com - RSS Channel',
      'options': { 'rss': 'http://rss.cnn.com/rss/cnn_latest.rss' },
      'link': 'http://www.cnn.com',
    });
    assertEqualsItems(items, [{
      'id':
        'rss-myuser-mycolumn-27c792d08caef396bf1e3ce488f6b4ea-6577cd61df49e5dd769eb44e0be07ca5',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'rss-myuser-mycolumn-27c792d08caef396bf1e3ce488f6b4ea',
      'title': 'Zelensky visits Washington in push for more Ukraine aid',
      'link':
        'https://www.cnn.com/politics/live-news/zelensky-biden-visit-12-12-23/index.html',
      'media':
        'https://cdn.cnn.com/cnnnext/dam/assets/231212094255-01-zelensky-dc-visit-121223-super-169.jpg',
      'description':
        'Ukrainian President Volodymyr Zelensky is meeting with President Joe Biden at the White House and lawmakers on Capitol Hill Tuesday as discussions on a Ukraine aid deal remain stalled. Follow for the latest live news updates.',
      'publishedAt': 1702397465,
    }, {
      'id':
        'rss-myuser-mycolumn-27c792d08caef396bf1e3ce488f6b4ea-45e3785b62227cf241b472cd51107ae2',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'rss-myuser-mycolumn-27c792d08caef396bf1e3ce488f6b4ea',
      'title':
        'Humanitarian crisis worsens in Gaza as Israel-Hamas war intensifies',
      'link':
        'https://www.cnn.com/middleeast/live-news/israel-hamas-war-gaza-news-12-12-23/index.html',
      'media':
        'https://cdn.cnn.com/cnnnext/dam/assets/231211100814-gaza-skyline-5t-121123-super-169.jpeg',
      'description':
        'The United Nations General Assembly will resume its emergency session Tuesday on Gaza, days after the United States vetoed a Security Council resolution calling for a ceasefire. Follow for live updates.',
      'publishedAt': 1702396874,
    }]);
  } finally {
    fetchWithTimeoutSpy.restore();
    getFaviconSpy.restore();
    uploadSourceIconSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      'http://rss.cnn.com/rss/cnn_latest.rss',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseCNN, { status: 200 }));
    }),
  });
  assertSpyCall(getFaviconSpy, 0, {
    args: ['http://www.cnn.com'],
    returned: new Promise((resolve) => {
      resolve(undefined);
    }),
  });
  assertSpyCall(uploadSourceIconSpy, 0, {
    args: [
      supabaseClient,
      {
        'id': 'rss-myuser-mycolumn-27c792d08caef396bf1e3ce488f6b4ea',
        'columnId': 'mycolumn',
        'userId': 'myuser',
        'type': 'rss',
        'title': 'CNN.com - RSS Channel',
        'options': { 'rss': 'http://rss.cnn.com/rss/cnn_latest.rss' },
        'link': 'http://www.cnn.com',
        icon: undefined,
      },
    ],
    returned: new Promise((resolve) => {
      resolve(undefined);
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
  assertSpyCalls(getFaviconSpy, 1);
  assertSpyCalls(uploadSourceIconSpy, 1);
});

const responseNTV = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:googleplay="http://www.google.com/schemas/play-podcasts/1.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:spotify="http://www.spotify.com/ns/rss" version="2.0">
   <channel>
      <atom:link href="" rel="self" type="application/rss+xml" />
      <title>n-tv.de - Startseite</title>
      <link>https://www.n-tv.de/</link>
      <description>n-tv.de, Nachrichten seriös, schnell und kompetent. Artikel und Videos aus Politik, Wirtschaft, Börse, Sport und aller Welt.</description>
      <language>de-de</language>
      <copyright>n-tv Nachrichtenfernsehen GmbH. RSS Meldungen dürfen nur unverändert wiedergegeben und ausschließlich online verwendet werden. Die eingeräumten Nutzungsrechte beinhalten ausdrücklich nicht das Recht zur Weitergabe an Dritte. Insbesondere ist es nicht gestattet, die Daten auf öffentlichen Screens oder zum Download anzubieten - weder kostenlos noch kostenpflichtig.</copyright>
      <lastBuildDate>Tue, 12 Dec 2023 18:32:01 +0100</lastBuildDate>
      <ttl>5</ttl>
      <image>
         <url>https://www.n-tv.de/resources/02291043/adaptive/images/head_logo.png</url>
         <title>n-tv.de - Startseite</title>
         <link>https://www.n-tv.de/</link>
      </image>
      <item>
         <title>Tinte oder Laser: Das sind aktuell die besten Drucker</title>
         <description>Für einen guten Drucker im Homeoffice kann man 200 Euro, aber auch 500 Euro ausgeben, ein hoher Preis garantiert aber keine hohe Qualität. Welches Gerät das richtige ist, entscheiden individuelle Prioritäten und wie intensiv es eingesetzt wird. Stiftung Warentest hilft bei der Kaufentscheidung.</description>
         <link>https://www.n-tv.de/technik/Das-sind-aktuell-die-besten-Drucker-article24595055.html</link>
         <guid>https://www.n-tv.de/technik/Das-sind-aktuell-die-besten-Drucker-article24595055.html</guid>
         <category>Technik</category>
         <pubDate>Tue, 12 Dec 2023 18:21:58 +0100</pubDate>
         <content:encoded><![CDATA[<img src="https://bilder2.n-tv.de/img/incoming/crop24595613/7928676886-cImg_4_3-w250/Drucker.jpg" width="250" height="188" align="left" />Für einen guten Drucker im Homeoffice kann man 200 Euro, aber auch 500 Euro ausgeben, ein hoher Preis garantiert aber keine hohe Qualität. Welches Gerät das richtige ist, entscheiden individuelle Prioritäten und wie intensiv es eingesetzt wird. Stiftung Warentest hilft bei der Kaufentscheidung.]]></content:encoded>
         <enclosure url="https://bilder2.n-tv.de/img/incoming/crop24595613/7928676886-cImg_4_3-w250/Drucker.jpg" length="12555" type="image/jpeg" />
      </item>
      <item>
         <title>Auch andere Konzerne betroffen: Hacker legen ukrainischen Mobilfunkanbieter lahm</title>
         <description>Am Morgen wird der größte Mobilfunkanbieter der Ukraine, Kyivstar, nach eigenen Angaben Opfer eines Hackerangriffs. Landesweit fallen Verbindungen aus. Die Polizei sei eingeschaltet worden, teilt der Konzern mit. Auch andere Unternehmen sind betroffen.</description>
         <link>https://www.n-tv.de/politik/Hacker-legen-ukrainischen-Mobilfunkanbieter-lahm-article24594969.html</link>
         <guid>https://www.n-tv.de/politik/Hacker-legen-ukrainischen-Mobilfunkanbieter-lahm-article24594969.html</guid>
         <category>Politik</category>
         <pubDate>Tue, 12 Dec 2023 18:13:28 +0100</pubDate>
         <content:encoded><![CDATA[<img src="https://bilder2.n-tv.de/img/incoming/crop24595013/3588678578-cImg_4_3-w250/imago0241272335h.jpg" width="250" height="188" align="left" />Am Morgen wird der größte Mobilfunkanbieter der Ukraine, Kyivstar, nach eigenen Angaben Opfer eines Hackerangriffs. Landesweit fallen Verbindungen aus. Die Polizei sei eingeschaltet worden, teilt der Konzern mit. Auch andere Unternehmen sind betroffen.]]></content:encoded>
         <enclosure url="https://bilder2.n-tv.de/img/incoming/crop24595013/3588678578-cImg_4_3-w250/imago0241272335h.jpg" length="12555" type="image/jpeg" />
      </item>
   </channel>
</rss>`;

Deno.test('getRSSFeed - NTV', async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    'fetchWithTimeout',
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responseNTV, { status: 200 }));
      }),
    ]),
  );

  const getFaviconSpy = stub(
    feedutils,
    'getFavicon',
    returnsNext([
      new Promise((resolve) => {
        resolve(undefined);
      }),
    ]),
  );

  const uploadSourceIconSpy = stub(
    feedutils,
    'uploadSourceIcon',
    returnsNext([
      new Promise((resolve) => {
        resolve(undefined);
      }),
    ]),
  );

  try {
    const { source, items } = await getRSSFeed(
      supabaseClient,
      undefined,
      mockProfile,
      {
        ...mockSource,
        options: {
          rss: 'https://www.n-tv.de/rss',
        },
      },
    );
    assertEqualsSource(source, {
      'id': 'rss-myuser-mycolumn-390a57640c2613653000729c6fef53ae',
      'columnId': 'mycolumn',
      'userId': 'myuser',
      'type': 'rss',
      'title': 'n-tv.de - Startseite',
      'options': { 'rss': 'https://www.n-tv.de/rss' },
      'link': 'https://www.n-tv.de/',
    });
    assertEqualsItems(items, [{
      'id':
        'rss-myuser-mycolumn-390a57640c2613653000729c6fef53ae-b959f7366439bfcc1381b9a5f9fcf636',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'rss-myuser-mycolumn-390a57640c2613653000729c6fef53ae',
      'title': 'Tinte oder Laser: Das sind aktuell die besten Drucker',
      'link':
        'https://www.n-tv.de/technik/Das-sind-aktuell-die-besten-Drucker-article24595055.html',
      'media':
        'https://bilder2.n-tv.de/img/incoming/crop24595613/7928676886-cImg_4_3-w250/Drucker.jpg',
      'description':
        'Für einen guten Drucker im Homeoffice kann man 200 Euro, aber auch 500 Euro ausgeben, ein hoher Preis garantiert aber keine hohe Qualität. Welches Gerät das richtige ist, entscheiden individuelle Prioritäten und wie intensiv es eingesetzt wird. Stiftung Warentest hilft bei der Kaufentscheidung.',
      'publishedAt': 1702401718,
    }, {
      'id':
        'rss-myuser-mycolumn-390a57640c2613653000729c6fef53ae-36e1c97d7833bb69e6e53704e866e3ba',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'rss-myuser-mycolumn-390a57640c2613653000729c6fef53ae',
      'title':
        'Auch andere Konzerne betroffen: Hacker legen ukrainischen Mobilfunkanbieter lahm',
      'link':
        'https://www.n-tv.de/politik/Hacker-legen-ukrainischen-Mobilfunkanbieter-lahm-article24594969.html',
      'media':
        'https://bilder2.n-tv.de/img/incoming/crop24595013/3588678578-cImg_4_3-w250/imago0241272335h.jpg',
      'description':
        'Am Morgen wird der größte Mobilfunkanbieter der Ukraine, Kyivstar, nach eigenen Angaben Opfer eines Hackerangriffs. Landesweit fallen Verbindungen aus. Die Polizei sei eingeschaltet worden, teilt der Konzern mit. Auch andere Unternehmen sind betroffen.',
      'publishedAt': 1702401208,
    }]);
  } finally {
    fetchWithTimeoutSpy.restore();
    getFaviconSpy.restore();
    uploadSourceIconSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      'https://www.n-tv.de/rss',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseNTV, { status: 200 }));
    }),
  });
  assertSpyCall(getFaviconSpy, 0, {
    args: ['https://www.n-tv.de/'],
    returned: new Promise((resolve) => {
      resolve(undefined);
    }),
  });
  assertSpyCall(uploadSourceIconSpy, 0, {
    args: [
      supabaseClient,
      {
        'id': 'rss-myuser-mycolumn-390a57640c2613653000729c6fef53ae',
        'columnId': 'mycolumn',
        'userId': 'myuser',
        'type': 'rss',
        'title': 'n-tv.de - Startseite',
        'options': { 'rss': 'https://www.n-tv.de/rss' },
        'link': 'https://www.n-tv.de/',
        icon: undefined,
      },
    ],
    returned: new Promise((resolve) => {
      resolve(undefined);
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
  assertSpyCalls(getFaviconSpy, 1);
  assertSpyCalls(uploadSourceIconSpy, 1);
});

const responseFP = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
   <title>Freie Presse - Chemnitz</title>
   <link href="https://www.freiepresse.de/rss/rss_chemnitz.php" rel="self" />
   <author>
      <name>Freie Presse</name>
   </author>
   <updated>2023-12-12T18:06:34Z</updated>
   <id>tag:www.freiepresse.de,2023-12-12:/rss/rss_chemnitz.php</id>
   <entry>
      <link href="https://www.freiepresse.de/chemnitz/nach-streit-im-chemnitzer-kuechwald-buehnenverein-werner-haas-gruendet-neues-theater-artikel13168401" />
      <id>https://www.freiepresse.de/chemnitz/nach-streit-im-chemnitzer-kuechwald-buehnenverein-werner-haas-gruendet-neues-theater-artikel13168401</id>
      <updated>2023-12-12T18:00:00Z</updated>
      <title>Nach Streit im Chemnitzer Küchwald-Bühnenverein: Werner Haas gründet neues Theater</title>
      <content type="html">&lt;img src="https://www.freiepresse.de/DYNIMG/72/08/13067208_W740C2040x1360o0x0.jpg" /&gt;Es ist nicht lange still geblieben um Werner Haas. Der Regisseur und Chorleiter trennte sich im Sommer im Streit vom Verein zur Belebung der Küchwaldbühne. Er hatte den Verein gegründet und leitete die Laientheatergruppe, die fast jährlich auf der Freilichtbühne spielte. Für 2023 hatte sich der Vereinsvorstand aber mehrheitlich gegen eine Premiere entschieden. Haas habe kein tragfähiges Konzept da...</content>
      <copyright>Andreas Seidel/Archiv</copyright>
      <category term="Chemnitz" />
   </entry>
   <entry>
      <link href="https://www.freiepresse.de/chemnitz/oberflaechliche-ermittlungen-fehlende-technik-im-gerichtssaal-prozessauftakt-zu-2018er-aufarbeitung-wirft-fragen-auf-artikel13168461" />
      <id>https://www.freiepresse.de/chemnitz/oberflaechliche-ermittlungen-fehlende-technik-im-gerichtssaal-prozessauftakt-zu-2018er-aufarbeitung-wirft-fragen-auf-artikel13168461</id>
      <updated>2023-12-12T17:00:00Z</updated>
      <title>Oberflächliche Ermittlungen, fehlende Technik im Gerichtssaal: Prozessauftakt zu 2018er-Aufarbeitung wirft Fragen auf</title>
      <content type="html">&lt;img src="https://www.freiepresse.de/DYNIMG/73/46/13067346_W740C2040x1360o0x0.jpg" /&gt;Der Beginn der Verhandlung war auf 9 Uhr am Montag angesetzt, als die Vernehmung der ersten Zeugin begann, war es 13 Uhr. Sie sollte unter anderem den Weg skizzieren, den die mutmaßlichen Täter am Tattag zu den Tatorten genommen hatten. Vier Angeklagte mit je einem Vertreter auf der einen Seite, Staatsanwalt und drei Nebenkläger-Vertreter auf der anderen. Der Vorsitzende Richter Jürgen Zöllner lie...</content>
      <copyright>Harry Haertel</copyright>
      <category term="Chemnitz" />
   </entry>
</feed>`;

Deno.test('getRSSFeed - FP', async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    'fetchWithTimeout',
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responseFP, { status: 200 }));
      }),
    ]),
  );

  const getFaviconSpy = stub(
    feedutils,
    'getFavicon',
    returnsNext([
      new Promise((resolve) => {
        resolve(undefined);
      }),
    ]),
  );

  const uploadSourceIconSpy = stub(
    feedutils,
    'uploadSourceIcon',
    returnsNext([
      new Promise((resolve) => {
        resolve(undefined);
      }),
    ]),
  );

  try {
    const { source, items } = await getRSSFeed(
      supabaseClient,
      undefined,
      mockProfile,
      {
        ...mockSource,
        options: {
          rss: 'https://www.freiepresse.de/rss/rss_chemnitz.php',
        },
      },
    );
    assertEqualsSource(source, {
      'id': 'rss-myuser-mycolumn-3d20715877c48f9b58c13809c5abc600',
      'columnId': 'mycolumn',
      'userId': 'myuser',
      'type': 'rss',
      'title': 'Freie Presse - Chemnitz',
      'options': { 'rss': 'https://www.freiepresse.de/rss/rss_chemnitz.php' },
      'link': 'https://www.freiepresse.de/rss/rss_chemnitz.php',
    });
    assertEqualsItems(items, [{
      'id':
        'rss-myuser-mycolumn-3d20715877c48f9b58c13809c5abc600-39bfc1acb8b30883dce00bb6167b766d',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'rss-myuser-mycolumn-3d20715877c48f9b58c13809c5abc600',
      'title':
        'Nach Streit im Chemnitzer Küchwald-Bühnenverein: Werner Haas gründet neues Theater',
      'link':
        'https://www.freiepresse.de/chemnitz/nach-streit-im-chemnitzer-kuechwald-buehnenverein-werner-haas-gruendet-neues-theater-artikel13168401',
      'media':
        'https://www.freiepresse.de/DYNIMG/72/08/13067208_W740C2040x1360o0x0.jpg',
      'description':
        'Es ist nicht lange still geblieben um Werner Haas. Der Regisseur und Chorleiter trennte sich im Sommer im Streit vom Verein zur Belebung der Küchwaldbühne. Er hatte den Verein gegründet und leitete die Laientheatergruppe, die fast jährlich auf der Freilichtbühne spielte. Für 2023 hatte sich der Vereinsvorstand aber mehrheitlich gegen eine Premiere entschieden. Haas habe kein tragfähiges Konzept da...',
      'publishedAt': 1702404000,
    }, {
      'id':
        'rss-myuser-mycolumn-3d20715877c48f9b58c13809c5abc600-cab31961af28e14e6b601b7e68bcd678',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'rss-myuser-mycolumn-3d20715877c48f9b58c13809c5abc600',
      'title':
        'Oberflächliche Ermittlungen, fehlende Technik im Gerichtssaal: Prozessauftakt zu 2018er-Aufarbeitung wirft Fragen auf',
      'link':
        'https://www.freiepresse.de/chemnitz/oberflaechliche-ermittlungen-fehlende-technik-im-gerichtssaal-prozessauftakt-zu-2018er-aufarbeitung-wirft-fragen-auf-artikel13168461',
      'media':
        'https://www.freiepresse.de/DYNIMG/73/46/13067346_W740C2040x1360o0x0.jpg',
      'description':
        'Der Beginn der Verhandlung war auf 9 Uhr am Montag angesetzt, als die Vernehmung der ersten Zeugin begann, war es 13 Uhr. Sie sollte unter anderem den Weg skizzieren, den die mutmaßlichen Täter am Tattag zu den Tatorten genommen hatten. Vier Angeklagte mit je einem Vertreter auf der einen Seite, Staatsanwalt und drei Nebenkläger-Vertreter auf der anderen. Der Vorsitzende Richter Jürgen Zöllner lie...',
      'publishedAt': 1702400400,
    }]);
  } finally {
    fetchWithTimeoutSpy.restore();
    getFaviconSpy.restore();
    uploadSourceIconSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      'https://www.freiepresse.de/rss/rss_chemnitz.php',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseFP, { status: 200 }));
    }),
  });
  assertSpyCall(getFaviconSpy, 0, {
    args: ['https://www.freiepresse.de/rss/rss_chemnitz.php'],
    returned: new Promise((resolve) => {
      resolve(undefined);
    }),
  });
  assertSpyCall(uploadSourceIconSpy, 0, {
    args: [
      supabaseClient,
      {
        'id': 'rss-myuser-mycolumn-3d20715877c48f9b58c13809c5abc600',
        'columnId': 'mycolumn',
        'userId': 'myuser',
        'type': 'rss',
        'title': 'Freie Presse - Chemnitz',
        'options': { 'rss': 'https://www.freiepresse.de/rss/rss_chemnitz.php' },
        'link': 'https://www.freiepresse.de/rss/rss_chemnitz.php',
        icon: undefined,
      },
    ],
    returned: new Promise((resolve) => {
      resolve(undefined);
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
  assertSpyCalls(getFaviconSpy, 1);
  assertSpyCalls(uploadSourceIconSpy, 1);
});

const responseHV = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:slash="http://purl.org/rss/1.0/modules/slash/" xmlns:sy="http://purl.org/rss/1.0/modules/syndication/" xmlns:wfw="http://wellformedweb.org/CommentAPI/" version="2.0">
   <channel>
      <title>Hippovideo.io</title>
      <atom:link href="https://www.hippovideo.io/blog/feed/" rel="self" type="application/rss+xml" />
      <link>https://www.hippovideo.io/blog</link>
      <description>Video Personalization &amp; Distribution Platform</description>
      <lastBuildDate>Thu, 26 Oct 2023 09:14:30 +0000</lastBuildDate>
      <language>en-US</language>
      <sy:updatePeriod>hourly</sy:updatePeriod>
      <sy:updateFrequency>1</sy:updateFrequency>
      <generator>https://wordpress.org/?v=6.1.4</generator>
      <item>
         <title>Loom’s Acquisition: What Lies Ahead for Customer-Facing Functions?</title>
         <link>https://www.hippovideo.io/blog/looms-acquisition-what-lies-ahead-for-customer-facing-functions/?utm_source=rss&amp;utm_medium=rss&amp;utm_campaign=looms-acquisition-what-lies-ahead-for-customer-facing-functions</link>
         <comments>https://www.hippovideo.io/blog/looms-acquisition-what-lies-ahead-for-customer-facing-functions/#respond</comments>
         <dc:creator><![CDATA[Nayana]]></dc:creator>
         <pubDate>Fri, 20 Oct 2023 14:14:08 +0000</pubDate>
         <category><![CDATA[Featured]]></category>
         <category><![CDATA[Hippo Video]]></category>
         <category><![CDATA[Video]]></category>
         <guid isPermaLink="false">https://www.hippovideo.io/blog/?p=49277</guid>
         <description><![CDATA[<p>Growth of SaaS The Software as a Service (SaaS) industry has undergone a transformative journey over the last decade. Once a budding sector, it has now blossomed into a vast ecosystem teeming with innovative solutions across diverse categories. As businesses worldwide turned their focus towards digital transformation, the demand for SaaS solutions skyrocketed, with startups [&#8230;]</p>
<p>The post <a rel="nofollow" href="https://www.hippovideo.io/blog/looms-acquisition-what-lies-ahead-for-customer-facing-functions/">Loom’s Acquisition: What Lies Ahead for Customer-Facing Functions?</a> appeared first on <a rel="nofollow" href="https://www.hippovideo.io/blog">Hippovideo.io</a>.</p>]]></description>
         <content:encoded><![CDATA[<h2>Growth of SaaS</h2>
<p>The Software as a Service (SaaS) industry has undergone a transformative journey over the last decade. Once a budding sector, it has now blossomed into a vast ecosystem teeming with innovative solutions across diverse categories. As businesses worldwide turned their focus towards digital transformation, the demand for SaaS solutions skyrocketed, with startups and established players alike releasing a plethora of products to address a myriad of challenges faced by their customers.<br><br>Central to this evolution is the project management category. Amidst the clutter of tools and platforms, Atlassian has distinguished itself as a luminary, having carved out a niche with its powerful suite of tools like Jira, Confluence, and Bitbucket. Over the years, Atlassian&#8217;s commitment to facilitating seamless collaboration and streamlining workflows has enabled it to gain a sizable market share and an enviable reputation.</p>
<p>Parallelly, in the realm of communication tools, Loom emerged in 2015 with a promise to redefine how professionals connect. Offering a novel approach to communication, Loom combined the immediacy of video messaging with the convenience of asynchronous communication, making interactions more personal and efficient. The platform&#8217;s unique value proposition quickly garnered attention, allowing Loom to amass a dedicated user base and establish itself as a formidable player in the SaaS space.</p>
<h2>Atlassian + Loom</h2>
<p>The convergence of these two giants&#8217; paths, as evidenced by Atlassian&#8217;s recent acquisition of Loom, brings forth a fascinating chapter in the SaaS narrative, one that underscores the sector&#8217;s dynamic nature and the relentless pursuit of innovation.</p>
<p>Loom, with its focus on enhancing communication for internal teams via video messaging, has undoubtedly found a fitting home within Atlassian&#8217;s suite. Especially for software developers using Jira, the integration of Loom&#8217;s video tools offers a more interactive way to communicate about bugs, code feedback, and other software development concerns.</p>
<h2>Hippo Video: Where Video Communication Scales Seamlessly</h2>
<p>While Loom is a powerhouse for internal communications, <a href="https://www.hippovideo.io/blog/looms-acquisition-what-lies-ahead-for-customer-facing-functions/?utm_source=blog&amp;utm_medium=CTA&amp;utm_campaign=atlassianloom" target="_blank" rel="noreferrer noopener">Hippo Video&#8217;s capabilities</a> stretch even further, serving both internal teams and those interacting directly with customers. Hippo Video presents itself as a unique offering in the video market with its AI-powered capabilities and diverse use cases for customer-facing teams of all sizes. For those who have been using Loom, or even those considering Loom specifically for external communications, here&#8217;s a deeper dive into why Hippo Video might be worth your attention.</p>
<h2>Leading the way with category-first features</h2>
<p><strong>Ready-to-Use Templates:</strong> Time is of the essence in today&#8217;s fast-paced world. With a library of pre-built templates tailored for diverse scenarios, Hippo Video ensures you&#8217;re never starting from scratch. This accelerates video creation, ensuring you can communicate effectively without unique delay.<br><br><strong>AI-Powered Personalization:</strong> At its core, Hippo Video uses AI to help businesses connect more intimately with their audience. Personalized videos can lead to deeper engagement, ensuring that your message resonates with each individual viewer.</p>
<figure class="wp-block-video"><video autoplay controls muted preload="auto" src="https://www.hippovideo.io/blog/wp-content/uploads/2023/10/AvatarLPHeroVideo2.mp4"></video></figure>
<p class="has-text-align-center">AI Avatar by Hippo Video</p>
<p><strong>Pioneering Generative AI Technology:</strong> As one of the early adopters of Generative AI technology in the video tool segment, Hippo Video offers groundbreaking features like the AI Script Generator, AI Editor, and AI Avatars.</p>
<p><strong><a href="https://www.hippovideo.io/features/ai-video-script-generator.html" target="_blank" rel="noreferrer noopener">AI Script Generator</a>:</strong> Unsure about scripting your video or trying to figure out how to respond to an irate customer? Simply provide some basic prompts, and Hippo Video will generate a script for you. This not only makes video creation simpler but also ensures the content remains engaging.</p>
<p><strong><a href="https://www.hippovideo.io/features/ai-editor.html" target="_blank" rel="noreferrer noopener">AI Editor</a>:</strong> Video editing can often be a cumbersome process, but with Hippo Video&#8217;s AI Editor, it&#8217;s as simple as editing a document. The tool transcribes your video into text, allowing you to edit it seamlessly. Want to remove those unnecessary &#8220;ums&#8221; and &#8220;ahs&#8221;? Just a click, and they&#8217;re gone!</p>
<p><strong><a href="https://www.hippovideo.io/features/ai-avatar-video-generator.html" target="_blank" rel="noreferrer noopener">AI Avatar</a>:</strong> For times when an instant video is needed, but you&#8217;re not camera-ready, Hippo Video&#8217;s AI Avatar comes to the rescue. Choose from a range of digital presenters, input your script, pick a voice, and have a polished video ready in mere minutes. </p>
<h2>Empowering all customer-facing teams with video</h2>
<p>Hippo Video&#8217;s wide array of features and AI tools make it an invaluable asset for businesses, seamlessly catering to diverse teams and their specific needs.</p>
<p><strong>Sales:</strong> Hippo Video&#8217;s personalized videos boost prospecting and lead nurturing, making the outreach more memorable and engaging.</p>
<p><strong>Customer Support: </strong>With Hippo Video, the team can easily create knowledge base videos and product tutorials, simplifying complex topics and improving customer understanding.</p>
<p><strong>Customer Success:</strong> From onboarding new clients to sharing product updates or quarterly reviews, Hippo Video ensures that the Success Team communicates effectively, enhancing client relations.</p>
<p><strong>L&amp;D: </strong>&nbsp;Training becomes more dynamic and digestible with Hippo Video, allowing the Learning and Development Team to produce content that resonates with its audience.</p>
<p><strong>Product Marketing: </strong>The platform empowers the marketing team to create clear and compelling explainer videos, ensuring products are presented in the best light.</p>
<p><strong>Sales Enablement:</strong> With Hippo Video, sales training becomes more interactive and valuable, enabling teams to grasp concepts faster and apply them in real-world scenarios.</p>
<p><a href="https://www.hippovideo.io/blog/looms-acquisition-what-lies-ahead-for-customer-facing-functions/?utm_source=blog&amp;utm_medium=CTA&amp;utm_campaign=atlassianloom" target="_blank" rel="noreferrer noopener">Try Hippo Video for Free</a></p>
<h2>Conclusion</h2>
<p>In summation, while Loom offers robust solutions for internal team communications for those looking to expand their video capabilities externally, Hippo Video brings an array of innovative tools to the table. Its AI-driven features, coupled with ease of use, make it a compelling choice for businesses aiming to elevate their video communication strategy.</p>
<p><a class="a2a_button_facebook" href="https://www.addtoany.com/add_to/facebook?linkurl=https%3A%2F%2Fwww.hippovideo.io%2Fblog%2Flooms-acquisition-what-lies-ahead-for-customer-facing-functions%2F&amp;linkname=Loom%E2%80%99s%20Acquisition%3A%20What%20Lies%20Ahead%20for%20Customer-Facing%20Functions%3F" title="Facebook" rel="nofollow noopener" target="_blank"></a><a class="a2a_button_twitter" href="https://www.addtoany.com/add_to/twitter?linkurl=https%3A%2F%2Fwww.hippovideo.io%2Fblog%2Flooms-acquisition-what-lies-ahead-for-customer-facing-functions%2F&amp;linkname=Loom%E2%80%99s%20Acquisition%3A%20What%20Lies%20Ahead%20for%20Customer-Facing%20Functions%3F" title="Twitter" rel="nofollow noopener" target="_blank"></a><a class="a2a_button_linkedin" href="https://www.addtoany.com/add_to/linkedin?linkurl=https%3A%2F%2Fwww.hippovideo.io%2Fblog%2Flooms-acquisition-what-lies-ahead-for-customer-facing-functions%2F&amp;linkname=Loom%E2%80%99s%20Acquisition%3A%20What%20Lies%20Ahead%20for%20Customer-Facing%20Functions%3F" title="LinkedIn" rel="nofollow noopener" target="_blank"></a><a class="a2a_dd addtoany_share_save addtoany_share" href="https://www.addtoany.com/share#url=https%3A%2F%2Fwww.hippovideo.io%2Fblog%2Flooms-acquisition-what-lies-ahead-for-customer-facing-functions%2F&#038;title=Loom%E2%80%99s%20Acquisition%3A%20What%20Lies%20Ahead%20for%20Customer-Facing%20Functions%3F" data-a2a-url="https://www.hippovideo.io/blog/looms-acquisition-what-lies-ahead-for-customer-facing-functions/" data-a2a-title="Loom’s Acquisition: What Lies Ahead for Customer-Facing Functions?"></a></p><p>The post <a rel="nofollow" href="https://www.hippovideo.io/blog/looms-acquisition-what-lies-ahead-for-customer-facing-functions/">Loom’s Acquisition: What Lies Ahead for Customer-Facing Functions?</a> appeared first on <a rel="nofollow" href="https://www.hippovideo.io/blog">Hippovideo.io</a>.</p>]]></content:encoded>
         <wfw:commentRss>https://www.hippovideo.io/blog/looms-acquisition-what-lies-ahead-for-customer-facing-functions/feed/</wfw:commentRss>
         <slash:comments>0</slash:comments>
         <enclosure url="https://www.hippovideo.io/blog/wp-content/uploads/2023/10/AvatarLPHeroVideo2.mp4" length="16292637" type="video/mp4" />
      </item>
   </channel>
</rss>`;

Deno.test('getRSSFeed - FP', async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    'fetchWithTimeout',
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responseHV, { status: 200 }));
      }),
    ]),
  );

  const getFaviconSpy = stub(
    feedutils,
    'getFavicon',
    returnsNext([
      new Promise((resolve) => {
        resolve(undefined);
      }),
    ]),
  );

  const uploadSourceIconSpy = stub(
    feedutils,
    'uploadSourceIcon',
    returnsNext([
      new Promise((resolve) => {
        resolve(undefined);
      }),
    ]),
  );

  try {
    const { source, items } = await getRSSFeed(
      supabaseClient,
      undefined,
      mockProfile,
      {
        ...mockSource,
        options: {
          rss: 'https://www.hippovideo.io/blog/feed/',
        },
      },
    );
    assertEqualsSource(source, {
      'id': 'rss-myuser-mycolumn-f09335225050a5529306575010bf8aa4',
      'columnId': 'mycolumn',
      'userId': 'myuser',
      'type': 'rss',
      'title': 'Hippovideo.io',
      'options': { 'rss': 'https://www.hippovideo.io/blog/feed/' },
      'link': 'https://www.hippovideo.io/blog',
    });
    assertEqualsItems(items, [{
      'id':
        'rss-myuser-mycolumn-f09335225050a5529306575010bf8aa4-840819f0740d37f9c7a615f26ffcfa5f',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'rss-myuser-mycolumn-f09335225050a5529306575010bf8aa4',
      'title':
        'Loom’s Acquisition: What Lies Ahead for Customer-Facing Functions?',
      'link':
        'https://www.hippovideo.io/blog/looms-acquisition-what-lies-ahead-for-customer-facing-functions/?utm_source=rss&utm_medium=rss&utm_campaign=looms-acquisition-what-lies-ahead-for-customer-facing-functions',
      'options': {
        'video':
          'https://www.hippovideo.io/blog/wp-content/uploads/2023/10/AvatarLPHeroVideo2.mp4',
      },
      'description':
        'Growth of SaaS The Software as a Service (SaaS) industry has undergone a transformative journey over the last decade. Once a budding sector, it has now blossomed into a vast ecosystem teeming with innovative solutions across diverse categories. As businesses worldwide turned their focus towards digital transformation, the demand for SaaS solutions skyrocketed, with startups [&#8230;]\nThe post Loom’s Acquisition: What Lies Ahead for Customer-Facing Functions? appeared first on Hippovideo.io.',
      'author': 'Nayana',
      'publishedAt': 1697811248,
    }]);
  } finally {
    fetchWithTimeoutSpy.restore();
    getFaviconSpy.restore();
    uploadSourceIconSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      'https://www.hippovideo.io/blog/feed/',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseHV, { status: 200 }));
    }),
  });
  assertSpyCall(getFaviconSpy, 0, {
    args: ['https://www.hippovideo.io/blog'],
    returned: new Promise((resolve) => {
      resolve(undefined);
    }),
  });
  assertSpyCall(uploadSourceIconSpy, 0, {
    args: [
      supabaseClient,
      {
        'id': 'rss-myuser-mycolumn-f09335225050a5529306575010bf8aa4',
        'columnId': 'mycolumn',
        'userId': 'myuser',
        'type': 'rss',
        'title': 'Hippovideo.io',
        'options': { 'rss': 'https://www.hippovideo.io/blog/feed/' },
        'link': 'https://www.hippovideo.io/blog',
        icon: undefined,
      },
    ],
    returned: new Promise((resolve) => {
      resolve(undefined);
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
  assertSpyCalls(getFaviconSpy, 1);
  assertSpyCalls(uploadSourceIconSpy, 1);
});
