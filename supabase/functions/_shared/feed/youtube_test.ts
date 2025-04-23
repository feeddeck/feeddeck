import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from "https://deno.land/std@0.208.0/testing/mock.ts";

import { ISource } from "../models/source.ts";
import { IProfile } from "../models/profile.ts";
import { getYoutubeFeed } from "./youtube.ts";
import { utils } from "../utils/index.ts";
import { feedutils } from "./utils/index.ts";
import { assertEqualsItems, assertEqualsSource } from "./utils/test.ts";

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

const responseYoutubeChannelId = `<link rel="alternate" type="application/rss+xml" title="RSS" href="https://www.youtube.com/feeds/videos.xml?channel_id=UC5NOEUbkLheQcaaRldYW5GA">`;

const responseYoutubeRSS = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xmlns:yt="http://www.youtube.com/xml/schemas/2015">
   <link rel="self" href="http://www.youtube.com/feeds/videos.xml?channel_id=UC5NOEUbkLheQcaaRldYW5GA" />
   <id>yt:channel:5NOEUbkLheQcaaRldYW5GA</id>
   <yt:channelId>5NOEUbkLheQcaaRldYW5GA</yt:channelId>
   <title>tagesschau</title>
   <link rel="alternate" href="https://www.youtube.com/channel/UC5NOEUbkLheQcaaRldYW5GA" />
   <author>
      <name>tagesschau</name>
      <uri>https://www.youtube.com/channel/UC5NOEUbkLheQcaaRldYW5GA</uri>
   </author>
   <published>2006-07-31T20:17:35+00:00</published>
   <entry>
      <id>yt:video:oiBPyTi7lvM</id>
      <yt:videoId>oiBPyTi7lvM</yt:videoId>
      <yt:channelId>UC5NOEUbkLheQcaaRldYW5GA</yt:channelId>
      <title>Verhandlungen über Haushalt werden fortgesetzt</title>
      <link rel="alternate" href="https://www.youtube.com/watch?v=oiBPyTi7lvM" />
      <author>
         <name>tagesschau</name>
         <uri>https://www.youtube.com/channel/UC5NOEUbkLheQcaaRldYW5GA</uri>
      </author>
      <published>2023-12-11T15:38:12+00:00</published>
      <updated>2023-12-11T15:38:13+00:00</updated>
      <media:group>
         <media:title>Verhandlungen über Haushalt werden fortgesetzt</media:title>
         <media:content url="https://www.youtube.com/v/oiBPyTi7lvM?version=3" type="application/x-shockwave-flash" width="640" height="390" />
         <media:thumbnail url="https://i4.ytimg.com/vi/oiBPyTi7lvM/hqdefault.jpg" width="480" height="360" />
         <media:description>Bundeskanzler Olaf Scholz hat sich zuversichtlich gezeigt, dass die Verhandlungen über das Milliarden-Loch im Haushalt für 2024 bald abgeschlossen werden. Auch SPD-Chefin Saskia Esken sprach von Fortschritten.

Scholz sucht seit Wochen in Dreiergesprächen mit Finanzminister Christian Lindner und Vizekanzler Robert Habeck nach einer Lösung der Haushaltskrise. Am späten Sonntagabend waren die Gespräche auf heute vertagt worden.

Mehr dazu:
https://www.tagesschau.de/inland/innenpolitik/bundesregierung-haushalt-104.html

Alle aktuellen Informationen und tagesschau24 im Livestream: https://www.tagesschau.de/

Alle Sendungen, Livestreams, Dokumentation und Reportagen auch in der ARD-Mediathek: https://www.ardmediathek.de/tagesschau</media:description>
         <media:community>
            <media:starRating count="69" average="5.00" min="1" max="5" />
            <media:statistics views="7461" />
         </media:community>
      </media:group>
   </entry>
   <entry>
      <id>yt:video:GqnNjM_YSY4</id>
      <yt:videoId>GqnNjM_YSY4</yt:videoId>
      <yt:channelId>UC5NOEUbkLheQcaaRldYW5GA</yt:channelId>
      <title>Bundesliga gibt grünes Licht für Investoren-Einstieg</title>
      <link rel="alternate" href="https://www.youtube.com/watch?v=GqnNjM_YSY4" />
      <author>
         <name>tagesschau</name>
         <uri>https://www.youtube.com/channel/UC5NOEUbkLheQcaaRldYW5GA</uri>
      </author>
      <published>2023-12-11T15:35:33+00:00</published>
      <updated>2023-12-11T15:35:33+00:00</updated>
      <media:group>
         <media:title>Bundesliga gibt grünes Licht für Investoren-Einstieg</media:title>
         <media:content url="https://www.youtube.com/v/GqnNjM_YSY4?version=3" type="application/x-shockwave-flash" width="640" height="390" />
         <media:thumbnail url="https://i4.ytimg.com/vi/GqnNjM_YSY4/hqdefault.jpg" width="480" height="360" />
         <media:description>Die Vertreter:innen der 36 Erst- und Zweitligisten haben den Weg für den geplanten Milliarden-Deal der Deutschen Fußball Liga mit einem Investor frei gemacht. Ein entsprechender Antrag auf der DFL-Mitgliederversammlung hat mit 24 Ja-Stimmen gerade so die nötige Zwei-Drittel-Mehrheit erhalten.

Aus dem Fan-Lager hatte es bis zuletzt Widerstand gegen einen solchen Deal gegeben. Die Anhänger:innen befürchten durch den Einstieg eines Investors eine Wettbewerbsverzerrung.

Mehr dazu:
https://www.tagesschau.de/inland/regional/berlin/rbb-deutsche-fussball-profiklubs-stimmen-fuer-einstieg-von-investor-102.html

Alle aktuellen Informationen und tagesschau24 im Livestream: https://www.tagesschau.de/

Alle Sendungen, Livestreams, Dokumentation und Reportagen auch in der ARD-Mediathek: https://www.ardmediathek.de/tagesschau</media:description>
         <media:community>
            <media:starRating count="99" average="5.00" min="1" max="5" />
            <media:statistics views="6727" />
         </media:community>
      </media:group>
   </entry>
</feed>`;

const responseYoutubeChannelIcon = `{
  "kind": "youtube#channelListResponse",
  "etag": "9epEY5Xvgq01s692ipBIincp2Jw",
  "pageInfo": {
    "totalResults": 1,
    "resultsPerPage": 1
  },
  "items": [
    {
      "kind": "youtube#channel",
      "etag": "5V6s7prKW0hYH8dPAr0gfRFYeQo",
      "id": "UC5NOEUbkLheQcaaRldYW5GA",
      "snippet": {
        "title": "tagesschau",
        "description": "Wir veröffentlichen hier aktuelle Livestreams, Kurzvideos, Reportagen und Podcasts aus den Angeboten der tagesschau-Redaktionen. Alle Ausgaben der tagesschau um 20 Uhr finden Sie hier:\nhttps://www.tagesschau.de/multimedia/video/videoarchiv2.html\n\nAlle Sendungen, Livestreams, Dokumentation und Reportagen auch in der ARD-Mediathek:\nhttps://www.ardmediathek.de/tagesschau\n\nMitschnitte der kompletten Sendungen sind auf YouTube kommentierbar. Wir bitten die Nutzerinnen und Nutzer um die Einhaltung der Community-Richtlinien und einen fairen Umgang miteinander: http://meta.tagesschau.de/richtlinien\n\nDie Redaktion erreichen immer wieder nachträgliche Verwendungsbeschränkungen, die die Online-Rechte für die Sendung einschränken. Aus diesem Grund kann es dazu kommen, dass Sendungen erneut hochgeladen werden. \n\nImpressum:\nhttps://www.tagesschau.de/impressum/#ardaktuell\n\nKontakt zur Social-Media-Redakion:\nhttps://www.tagesschau.de/mehr/kontakt/kontakt-social-101.html\n",
        "customUrl": "@tagesschau",
        "publishedAt": "2006-07-31T20:17:35Z",
        "thumbnails": {
          "default": {
            "url": "https://yt3.ggpht.com/ytc/APkrFKb2Js4H8BYIbxDYy8eK3GnIu_D6MaJc4sANPvoLXw=s88-c-k-c0x00ffffff-no-rj",
            "width": 88,
            "height": 88
          },
          "medium": {
            "url": "https://yt3.ggpht.com/ytc/APkrFKb2Js4H8BYIbxDYy8eK3GnIu_D6MaJc4sANPvoLXw=s240-c-k-c0x00ffffff-no-rj",
            "width": 240,
            "height": 240
          },
          "high": {
            "url": "https://yt3.ggpht.com/ytc/APkrFKb2Js4H8BYIbxDYy8eK3GnIu_D6MaJc4sANPvoLXw=s800-c-k-c0x00ffffff-no-rj",
            "width": 800,
            "height": 800
          }
        },
        "localized": {
          "title": "tagesschau",
          "description": "Wir veröffentlichen hier aktuelle Livestreams, Kurzvideos, Reportagen und Podcasts aus den Angeboten der tagesschau-Redaktionen. Alle Ausgaben der tagesschau um 20 Uhr finden Sie hier:\nhttps://www.tagesschau.de/multimedia/video/videoarchiv2.html\n\nAlle Sendungen, Livestreams, Dokumentation und Reportagen auch in der ARD-Mediathek:\nhttps://www.ardmediathek.de/tagesschau\n\nMitschnitte der kompletten Sendungen sind auf YouTube kommentierbar. Wir bitten die Nutzerinnen und Nutzer um die Einhaltung der Community-Richtlinien und einen fairen Umgang miteinander: http://meta.tagesschau.de/richtlinien\n\nDie Redaktion erreichen immer wieder nachträgliche Verwendungsbeschränkungen, die die Online-Rechte für die Sendung einschränken. Aus diesem Grund kann es dazu kommen, dass Sendungen erneut hochgeladen werden. \n\nImpressum:\nhttps://www.tagesschau.de/impressum/#ardaktuell\n\nKontakt zur Social-Media-Redakion:\nhttps://www.tagesschau.de/mehr/kontakt/kontakt-social-101.html\n"
        },
        "country": "DE"
      }
    }
  ]
}`;

Deno.test("getYoutubeFeed", async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    "fetchWithTimeout",
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responseYoutubeChannelId, { status: 200 }));
      }),
      new Promise((resolve) => {
        resolve(new Response(responseYoutubeRSS, { status: 200 }));
      }),
      new Promise((resolve) => {
        resolve(new Response(responseYoutubeChannelIcon, { status: 200 }));
      }),
    ]),
  );

  const uploadSourceIconSpy = stub(
    feedutils,
    "uploadSourceIcon",
    returnsNext([
      new Promise((resolve) => {
        resolve(
          "https://yt3.ggpht.com/ytc/APkrFKb2Js4H8BYIbxDYy8eK3GnIu_D6MaJc4sANPvoLXw=s88-c-k-c0x00ffffff-no-rj",
        );
      }),
    ]),
  );

  try {
    const { source, items } = await getYoutubeFeed(
      supabaseClient,
      undefined,
      mockProfile,
      {
        ...mockSource,
        options: {
          youtube: "https://youtube.com/@tagesschau?si=24jF6sxXvaU7Jv7D",
        },
      },
      undefined,
    );
    assertEqualsSource(source, {
      id: "youtube-myuser-mycolumn-66638d79d1f4c862ef3a54be04469f22",
      columnId: "mycolumn",
      userId: "myuser",
      type: "youtube",
      title: "tagesschau",
      options: {
        youtube:
          "https://www.youtube.com/feeds/videos.xml?channel_id=UC5NOEUbkLheQcaaRldYW5GA",
      },
      icon: "https://yt3.ggpht.com/ytc/APkrFKb2Js4H8BYIbxDYy8eK3GnIu_D6MaJc4sANPvoLXw=s88-c-k-c0x00ffffff-no-rj",
      link: "http://www.youtube.com/feeds/videos.xml?channel_id=UC5NOEUbkLheQcaaRldYW5GA",
    });
    assertEqualsItems(items, [
      {
        id: "youtube-myuser-mycolumn-66638d79d1f4c862ef3a54be04469f22-e5a1ee83f52f489b7213fd555e607bb8",
        userId: "myuser",
        columnId: "mycolumn",
        sourceId: "youtube-myuser-mycolumn-66638d79d1f4c862ef3a54be04469f22",
        title: "Verhandlungen über Haushalt werden fortgesetzt",
        link: "https://www.youtube.com/watch?v=oiBPyTi7lvM",
        media: "https://i4.ytimg.com/vi/oiBPyTi7lvM/hqdefault.jpg",
        description:
          "Bundeskanzler Olaf Scholz hat sich zuversichtlich gezeigt, dass die Verhandlungen über das Milliarden-Loch im Haushalt für 2024 bald abgeschlossen werden. Auch SPD-Chefin Saskia Esken sprach von Fortschritten.\n\nScholz sucht seit Wochen in Dreiergesprächen mit Finanzminister Christian Lindner und Vizekanzler Robert Habeck nach einer Lösung der Haushaltskrise. Am späten Sonntagabend waren die Gespräche auf heute vertagt worden.\n\nMehr dazu:\nhttps://www.tagesschau.de/inland/innenpolitik/bundesregierung-haushalt-104.html\n\nAlle aktuellen Informationen und tagesschau24 im Livestream: https://www.tagesschau.de/\n\nAlle Sendungen, Livestreams, Dokumentation und Reportagen auch in der ARD-Mediathek: https://www.ardmediathek.de/tagesschau",
        author: "tagesschau",
        publishedAt: 1702309092,
      },
      {
        id: "youtube-myuser-mycolumn-66638d79d1f4c862ef3a54be04469f22-8ab7b326373a8b764ba2676092c10d57",
        userId: "myuser",
        columnId: "mycolumn",
        sourceId: "youtube-myuser-mycolumn-66638d79d1f4c862ef3a54be04469f22",
        title: "Bundesliga gibt grünes Licht für Investoren-Einstieg",
        link: "https://www.youtube.com/watch?v=GqnNjM_YSY4",
        media: "https://i4.ytimg.com/vi/GqnNjM_YSY4/hqdefault.jpg",
        description:
          "Die Vertreter:innen der 36 Erst- und Zweitligisten haben den Weg für den geplanten Milliarden-Deal der Deutschen Fußball Liga mit einem Investor frei gemacht. Ein entsprechender Antrag auf der DFL-Mitgliederversammlung hat mit 24 Ja-Stimmen gerade so die nötige Zwei-Drittel-Mehrheit erhalten.\n\nAus dem Fan-Lager hatte es bis zuletzt Widerstand gegen einen solchen Deal gegeben. Die Anhänger:innen befürchten durch den Einstieg eines Investors eine Wettbewerbsverzerrung.\n\nMehr dazu:\nhttps://www.tagesschau.de/inland/regional/berlin/rbb-deutsche-fussball-profiklubs-stimmen-fuer-einstieg-von-investor-102.html\n\nAlle aktuellen Informationen und tagesschau24 im Livestream: https://www.tagesschau.de/\n\nAlle Sendungen, Livestreams, Dokumentation und Reportagen auch in der ARD-Mediathek: https://www.ardmediathek.de/tagesschau",
        author: "tagesschau",
        publishedAt: 1702308933,
      },
    ]);
  } finally {
    fetchWithTimeoutSpy.restore();
    uploadSourceIconSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      "https://youtube.com/@tagesschau?si=24jF6sxXvaU7Jv7D",
      { method: "get" },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseYoutubeChannelId, { status: 200 }));
    }),
  });
  assertSpyCall(fetchWithTimeoutSpy, 1, {
    args: [
      "https://www.youtube.com/feeds/videos.xml?channel_id=UC5NOEUbkLheQcaaRldYW5GA",
      { method: "get" },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseYoutubeRSS, { status: 200 }));
    }),
  });
  assertSpyCall(fetchWithTimeoutSpy, 2, {
    args: [
      "https://www.googleapis.com/youtube/v3/channels?id=UC5NOEUbkLheQcaaRldYW5GA&part=id%2Csnippet&maxResults=1&key=",
      { method: "get" },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseYoutubeChannelIcon, { status: 200 }));
    }),
  });
  assertSpyCall(uploadSourceIconSpy, 0, {
    args: [
      supabaseClient,
      {
        id: "youtube-myuser-mycolumn-66638d79d1f4c862ef3a54be04469f22",
        columnId: "mycolumn",
        userId: "myuser",
        type: "youtube",
        title: "tagesschau",
        options: {
          youtube:
            "https://www.youtube.com/feeds/videos.xml?channel_id=UC5NOEUbkLheQcaaRldYW5GA",
        },
        icon: "https://yt3.ggpht.com/ytc/APkrFKb2Js4H8BYIbxDYy8eK3GnIu_D6MaJc4sANPvoLXw=s88-c-k-c0x00ffffff-no-rj",
        link: "http://www.youtube.com/feeds/videos.xml?channel_id=UC5NOEUbkLheQcaaRldYW5GA",
      },
    ],
    returned: new Promise((resolve) => {
      resolve(
        "https://yt3.ggpht.com/ytc/APkrFKb2Js4H8BYIbxDYy8eK3GnIu_D6MaJc4sANPvoLXw=s88-c-k-c0x00ffffff-no-rj",
      );
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 3);
  assertSpyCalls(uploadSourceIconSpy, 1);
});
