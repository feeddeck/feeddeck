import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from "https://deno.land/std@0.208.0/testing/mock.ts";

import { ISource } from "../models/source.ts";
import { IProfile } from "../models/profile.ts";
import { getGooglenewsFeed } from "./googlenews.ts";
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

const responseUrl = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:media="http://search.yahoo.com/mrss/" version="2.0">
   <channel>
      <generator>NFE/5.0</generator>
      <title>Schlagzeilen - Aktuell - Google News</title>
      <link>https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZxYUdjU0FtUmxHZ0pFUlNnQVAB?hl=de &amp;gl=DE &amp;ceid=DE:de</link>
      <language>de</language>
      <webMaster>news-webmaster@google.com</webMaster>
      <copyright>2023 Google Inc.</copyright>
      <lastBuildDate>Wed, 06 Dec 2023 20:10:12 GMT</lastBuildDate>
      <description>Google News</description>
      <item>
         <title>GDL ruft von Donnerstagabend an zu eintägigem Streik auf - tagesschau.de</title>
         <link>https://news.google.com/rss/articles/CBMiOGh0dHBzOi8vd3d3LnRhZ2Vzc2NoYXUuZGUvd2lydHNjaGFmdC9nZGwtc3RyZWlrLTE5MC5odG1s0gEA?oc=5</link>
         <guid isPermaLink="false">CBMiOGh0dHBzOi8vd3d3LnRhZ2Vzc2NoYXUuZGUvd2lydHNjaGFmdC9nZGwtc3RyZWlrLTE5MC5odG1s0gEA</guid>
         <pubDate>Wed, 06 Dec 2023 19:20:00 GMT</pubDate>
         <description>&lt;ol &gt;&lt;li &gt;&lt;a href="https://news.google.com/rss/articles/CBMiOGh0dHBzOi8vd3d3LnRhZ2Vzc2NoYXUuZGUvd2lydHNjaGFmdC9nZGwtc3RyZWlrLTE5MC5odG1s0gEA?oc=5" target="_blank"&gt;GDL ruft von Donnerstagabend an zu eintägigem Streik auf &lt;/a &gt;&amp;nbsp;&amp;nbsp;&lt;font color="#6f6f6f"&gt;tagesschau.de &lt;/font &gt;&lt;/li &gt;&lt;li &gt;&lt;a href="https://news.google.com/rss/articles/CBMidWh0dHBzOi8vd3d3LmJpbGQuZGUvcG9saXRpay9pbmxhbmQvcG9saXRpay1pbmxhbmQvZGV1dHNjaGUtYmFobi1tb3JnZW4tbmFlY2hzdGVyLWxva2Z1ZWhyZXItc3RyZWlrLTg2MzQ4NjM0LmJpbGQuaHRtbNIBAA?oc=5" target="_blank"&gt;Deutsche Bahn: Morgen nächster Lokführer-Streik! | Politik &lt;/a &gt;&amp;nbsp;&amp;nbsp;&lt;font color="#6f6f6f"&gt;BILD &lt;/font &gt;&lt;/li &gt;&lt;li &gt;&lt;a href="https://news.google.com/rss/articles/CBMihAFodHRwczovL3d3dy5uZHIuZGUvbmFjaHJpY2h0ZW4vc2NobGVzd2lnLWhvbHN0ZWluL2t1cnpuYWNocmljaHRlbi9TY2hsZXN3aWctSG9sc3RlaW4tYWt0dWVsbC1OYWNocmljaHRlbi1pbS1VZWJlcmJsaWNrLG5ld3MzNTU2Lmh0bWzSAQA?oc=5" target="_blank"&gt;Schleswig-Holstein aktuell: Nachrichten im Überblick &lt;/a &gt;&amp;nbsp;&amp;nbsp;&lt;font color="#6f6f6f"&gt;NDR.de &lt;/font &gt;&lt;/li &gt;&lt;li &gt;&lt;a href="https://news.google.com/rss/articles/CBMiiAFodHRwczovL3d3dy5sci1vbmxpbmUuZGUvbGF1c2l0ei9jb3R0YnVzL3JlMi1jb3R0YnVzLWJlcmxpbi1zdHJlY2tlLXdpcmQtd2llZGVyLWdlc3BlcnJ0LV8td2FzLWZhaHJnYWVzdGUtYmVhY2h0ZW4tbXVlc3Nlbi03MjQ0MjYwOS5odG1s0gEA?oc=5" target="_blank"&gt;Bahnstreik und Sperrung - Nichts geht mehr beim RE2 Cottbus – Berlin &lt;/a &gt;&amp;nbsp;&amp;nbsp;&lt;font color="#6f6f6f"&gt;Lausitzer Rundschau &lt;/font &gt;&lt;/li &gt;&lt;li &gt;&lt;a href="https://news.google.com/rss/articles/CBMingFodHRwczovL3d3dy5zcGllZ2VsLmRlL3dpcnRzY2hhZnQvc2VydmljZS9kZXV0c2NoZS1iYWhuLWdkbC1sb2tmdWVocmVyLWRlci1iYWhuLXN0cmVpa2VuLWFiLWRvbm5lcnN0YWctYmlzLWZyZWl0YWdhYmVuZC1hLTJhN2Q1OWUyLTBmOTUtNDVhYi04OTFkLTI4NjcxMGI1MWI1MdIBAA?oc=5" target="_blank"&gt;Deutsche Bahn/GDL: Lokführer der Bahn streiken ab Donnerstag bis Freitagabend &lt;/a &gt;&amp;nbsp;&amp;nbsp;&lt;font color="#6f6f6f"&gt;DER SPIEGEL &lt;/font &gt;&lt;/li &gt;&lt;/ol &gt;</description>
         <source url="https://www.tagesschau.de">tagesschau.de</source>
      </item>
      <item>
         <title>Lassen die USA die Ukraine im Stich?: US-Finanzministerin spricht von „katastrophaler Situation“ - Tagesspiegel</title>
         <link>https://news.google.com/rss/articles/CBMilgFodHRwczovL3d3dy50YWdlc3NwaWVnZWwuZGUvaW50ZXJuYXRpb25hbGVzL2xhc3Nlbi1kaWUtdXNhLWRpZS11a3JhaW5lLWltLXN0aWNoLXVzLWZpbmFuem1pbmlzdGVyaW4tc3ByaWNodC12b24ta2F0YXN0cm9waGFsZXItc2l0dWF0aW9uLTEwODg3Nzg3Lmh0bWzSAQA?oc=5</link>
         <guid isPermaLink="false">CBMilgFodHRwczovL3d3dy50YWdlc3NwaWVnZWwuZGUvaW50ZXJuYXRpb25hbGVzL2xhc3Nlbi1kaWUtdXNhLWRpZS11a3JhaW5lLWltLXN0aWNoLXVzLWZpbmFuem1pbmlzdGVyaW4tc3ByaWNodC12b24ta2F0YXN0cm9waGFsZXItc2l0dWF0aW9uLTEwODg3Nzg3Lmh0bWzSAQA</guid>
         <pubDate>Wed, 06 Dec 2023 15:38:00 GMT</pubDate>
         <description>&lt;ol &gt;&lt;li &gt;&lt;a href="https://news.google.com/rss/articles/CBMilgFodHRwczovL3d3dy50YWdlc3NwaWVnZWwuZGUvaW50ZXJuYXRpb25hbGVzL2xhc3Nlbi1kaWUtdXNhLWRpZS11a3JhaW5lLWltLXN0aWNoLXVzLWZpbmFuem1pbmlzdGVyaW4tc3ByaWNodC12b24ta2F0YXN0cm9waGFsZXItc2l0dWF0aW9uLTEwODg3Nzg3Lmh0bWzSAQA?oc=5" target="_blank"&gt;Lassen die USA die Ukraine im Stich?: US-Finanzministerin spricht von „katastrophaler Situation“&lt;/a &gt;&amp;nbsp;&amp;nbsp;&lt;font color="#6f6f6f"&gt;Tagesspiegel &lt;/font &gt;&lt;/li &gt;&lt;li &gt;&lt;a href="https://news.google.com/rss/articles/CCAiC0lETWpHLXRoZ3ZNmAEB?oc=5" target="_blank"&gt;Rüstungskonferenz in Washington: Ukraine-Hilfen der USA laufen aus &lt;/a &gt;&amp;nbsp;&amp;nbsp;&lt;font color="#6f6f6f"&gt;tagesschau &lt;/font &gt;&lt;/li &gt;&lt;li &gt;&lt;a href="https://news.google.com/rss/articles/CBMiiwFodHRwczovL3d3dy5iaWxkLmRlL3BvbGl0aWsvYXVzbGFuZC9wb2xpdGlrLWF1c2xhbmQvc2VsZW5za3lqLXNhZ3QtYXVmdHJpdHQtdm9yLXVzLXNlbmF0b3Jlbi1hYi1ldHdhcy1kYXp3aXNjaGVuZ2Vrb21tZW4tODYzMzg3OTIuYmlsZC5odG1s0gEA?oc=5" target="_blank"&gt;Selenskyj sagt Auftritt vor US-Senatoren ab: „Etwas dazwischengekommen“&lt;/a &gt;&amp;nbsp;&amp;nbsp;&lt;font color="#6f6f6f"&gt;BILD &lt;/font &gt;&lt;/li &gt;&lt;li &gt;&lt;a href="https://news.google.com/rss/articles/CBMic2h0dHBzOi8vd3d3LnQtb25saW5lLmRlL25hY2hyaWNodGVuL2F1c2xhbmQvdXNhL3VzLXdhaGwvaWRfMTAwMjk2MDQ4L3VzYS1oYWJlbi1rZWluLWdlbGQtbWVoci1mdWVyLWRpZS11a3JhaW5lLmh0bWzSAQA?oc=5" target="_blank"&gt;USA haben kein Geld mehr für die Ukraine &lt;/a &gt;&amp;nbsp;&amp;nbsp;&lt;font color="#6f6f6f"&gt;t-online &lt;/font &gt;&lt;/li &gt;&lt;li &gt;&lt;a href="https://news.google.com/rss/articles/CBMibGh0dHBzOi8vd3d3Lm1vcmdlbnBvc3QuZGUvcG9saXRpay9hcnRpY2xlMjQwNzUyNTI2L1VrcmFpbmUtS3JpZWctQW1lcmlrYS1kYXJmLW5pY2h0LXZvbi1kZXItRmFobmUtZ2VoZW4uaHRtbNIBAA?oc=5" target="_blank"&gt;Ukraine-Krieg: Putins wichtigste Unterstützer sitzen in Washington &lt;/a &gt;&amp;nbsp;&amp;nbsp;&lt;font color="#6f6f6f"&gt;Berliner Morgenpost &lt;/font &gt;&lt;/li &gt;&lt;/ol &gt;</description>
         <source url="https://www.tagesspiegel.de">Tagesspiegel</source>
      </item>
   </channel>
</rss>`;

const responseSearch = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:media="http://search.yahoo.com/mrss/" version="2.0">
   <channel>
      <generator>NFE/5.0</generator>
      <title>"Chemnitz" - Google News</title>
      <link>https://news.google.com/search?q=Chemnitz &amp;hl=de &amp;gl=DE &amp;ceid=DE:de</link>
      <language>de</language>
      <webMaster>news-webmaster@google.com</webMaster>
      <copyright>2023 Google Inc.</copyright>
      <lastBuildDate>Wed, 06 Dec 2023 20:19:34 GMT</lastBuildDate>
      <description>Google News</description>
      <item>
         <title>Chemnitz: Preisschock bei "eins energie"! Fernwärme wird 75 Prozent teurer - TAG24</title>
         <link>https://news.google.com/rss/articles/CBMibGh0dHBzOi8vd3d3LnRhZzI0LmRlL2NoZW1uaXR6L2xva2FsZXMvcHJlaXNzY2hvY2stYmVpLWVpbnMtZW5lcmdpZS1mZXJud2Flcm1lLXdpcmQtNzUtcHJvemVudC10ZXVyZXItMzAzMjA5MdIBcGh0dHBzOi8vd3d3LnRhZzI0LmRlL2FtcC9jaGVtbml0ei9sb2thbGVzL3ByZWlzc2Nob2NrLWJlaS1laW5zLWVuZXJnaWUtZmVybndhZXJtZS13aXJkLTc1LXByb3plbnQtdGV1cmVyLTMwMzIwOTE?oc=5</link>
         <guid isPermaLink="false">CBMibGh0dHBzOi8vd3d3LnRhZzI0LmRlL2NoZW1uaXR6L2xva2FsZXMvcHJlaXNzY2hvY2stYmVpLWVpbnMtZW5lcmdpZS1mZXJud2Flcm1lLXdpcmQtNzUtcHJvemVudC10ZXVyZXItMzAzMjA5MdIBcGh0dHBzOi8vd3d3LnRhZzI0LmRlL2FtcC9jaGVtbml0ei9sb2thbGVzL3ByZWlzc2Nob2NrLWJlaS1laW5zLWVuZXJnaWUtZmVybndhZXJtZS13aXJkLTc1LXByb3plbnQtdGV1cmVyLTMwMzIwOTE</guid>
         <pubDate>Wed, 06 Dec 2023 04:30:00 GMT</pubDate>
         <description>&lt;a href="https://news.google.com/rss/articles/CBMibGh0dHBzOi8vd3d3LnRhZzI0LmRlL2NoZW1uaXR6L2xva2FsZXMvcHJlaXNzY2hvY2stYmVpLWVpbnMtZW5lcmdpZS1mZXJud2Flcm1lLXdpcmQtNzUtcHJvemVudC10ZXVyZXItMzAzMjA5MdIBcGh0dHBzOi8vd3d3LnRhZzI0LmRlL2FtcC9jaGVtbml0ei9sb2thbGVzL3ByZWlzc2Nob2NrLWJlaS1laW5zLWVuZXJnaWUtZmVybndhZXJtZS13aXJkLTc1LXByb3plbnQtdGV1cmVyLTMwMzIwOTE?oc=5" target="_blank"&gt;Chemnitz: Preisschock bei "eins energie"! Fernwärme wird 75 Prozent teurer &lt;/a &gt;&amp;nbsp;&amp;nbsp;&lt;font color="#6f6f6f"&gt;TAG24 &lt;/font &gt;</description>
         <source url="https://www.tag24.de">TAG24</source>
      </item>
      <item>
         <title>Ehemaliges Chemnitzer Straßenbahndepot wird zu Garagencampus - MDR</title>
         <link>https://news.google.com/rss/articles/CBMiN2h0dHBzOi8vd3d3Lm1kci5kZS92aWRlby9tZHItdmlkZW9zL2EvdmlkZW8tNzc5OTUyLmh0bWzSAQA?oc=5</link>
         <guid isPermaLink="false">CBMiN2h0dHBzOi8vd3d3Lm1kci5kZS92aWRlby9tZHItdmlkZW9zL2EvdmlkZW8tNzc5OTUyLmh0bWzSAQA</guid>
         <pubDate>Wed, 06 Dec 2023 19:24:28 GMT</pubDate>
         <description>&lt;a href="https://news.google.com/rss/articles/CBMiN2h0dHBzOi8vd3d3Lm1kci5kZS92aWRlby9tZHItdmlkZW9zL2EvdmlkZW8tNzc5OTUyLmh0bWzSAQA?oc=5" target="_blank"&gt;Ehemaliges Chemnitzer Straßenbahndepot wird zu Garagencampus &lt;/a &gt;&amp;nbsp;&amp;nbsp;&lt;font color="#6f6f6f"&gt;MDR &lt;/font &gt;</description>
         <source url="https://www.mdr.de">MDR</source>
      </item>
   </channel>
</rss>`;

Deno.test("getGooglenewsFeed - Url", async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    "fetchWithTimeout",
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responseUrl, { status: 200 }));
      }),
    ]),
  );

  try {
    const { source, items } = await getGooglenewsFeed(
      supabaseClient,
      undefined,
      mockProfile,
      {
        ...mockSource,
        options: {
          googlenews: {
            type: "url",
            url: "https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZxYUdjU0FtUmxHZ0pFUlNnQVAB?hl=de&gl=DE&ceid=DE%3Ade",
          },
        },
      },
      undefined,
    );
    feedutils.assertEqualsSource(source, {
      id: "googlenews-myuser-mycolumn-8c1368ef1bc9e52356bffba3ce60cd48",
      columnId: "mycolumn",
      userId: "myuser",
      type: "googlenews",
      title: "Schlagzeilen - Aktuell - Google News",
      options: {
        googlenews: {
          type: "url",
          url: "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZxYUdjU0FtUmxHZ0pFUlNnQVAB?hl=de&gl=DE&ceid=DE%3Ade",
        },
      },
      link: "https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZxYUdjU0FtUmxHZ0pFUlNnQVAB?hl=de &gl=DE &ceid=DE:de",
    });
    feedutils.assertEqualsItems(items, [
      {
        id: "googlenews-myuser-mycolumn-8c1368ef1bc9e52356bffba3ce60cd48-b8e1de5555c562ab270e8398ee948d16",
        userId: "myuser",
        columnId: "mycolumn",
        sourceId: "googlenews-myuser-mycolumn-8c1368ef1bc9e52356bffba3ce60cd48",
        title:
          "GDL ruft von Donnerstagabend an zu eintägigem Streik auf - tagesschau.de",
        link: "https://news.google.com/rss/articles/CBMiOGh0dHBzOi8vd3d3LnRhZ2Vzc2NoYXUuZGUvd2lydHNjaGFmdC9nZGwtc3RyZWlrLTE5MC5odG1s0gEA?oc=5",
        description:
          '<ol ><li ><a href="https://news.google.com/rss/articles/CBMiOGh0dHBzOi8vd3d3LnRhZ2Vzc2NoYXUuZGUvd2lydHNjaGFmdC9nZGwtc3RyZWlrLTE5MC5odG1s0gEA?oc=5" target="_blank">GDL ruft von Donnerstagabend an zu eintägigem Streik auf </a >&nbsp;&nbsp;<font color="#6f6f6f">tagesschau.de </font ></li ><li ><a href="https://news.google.com/rss/articles/CBMidWh0dHBzOi8vd3d3LmJpbGQuZGUvcG9saXRpay9pbmxhbmQvcG9saXRpay1pbmxhbmQvZGV1dHNjaGUtYmFobi1tb3JnZW4tbmFlY2hzdGVyLWxva2Z1ZWhyZXItc3RyZWlrLTg2MzQ4NjM0LmJpbGQuaHRtbNIBAA?oc=5" target="_blank">Deutsche Bahn: Morgen nächster Lokführer-Streik! | Politik </a >&nbsp;&nbsp;<font color="#6f6f6f">BILD </font ></li ><li ><a href="https://news.google.com/rss/articles/CBMihAFodHRwczovL3d3dy5uZHIuZGUvbmFjaHJpY2h0ZW4vc2NobGVzd2lnLWhvbHN0ZWluL2t1cnpuYWNocmljaHRlbi9TY2hsZXN3aWctSG9sc3RlaW4tYWt0dWVsbC1OYWNocmljaHRlbi1pbS1VZWJlcmJsaWNrLG5ld3MzNTU2Lmh0bWzSAQA?oc=5" target="_blank">Schleswig-Holstein aktuell: Nachrichten im Überblick </a >&nbsp;&nbsp;<font color="#6f6f6f">NDR.de </font ></li ><li ><a href="https://news.google.com/rss/articles/CBMiiAFodHRwczovL3d3dy5sci1vbmxpbmUuZGUvbGF1c2l0ei9jb3R0YnVzL3JlMi1jb3R0YnVzLWJlcmxpbi1zdHJlY2tlLXdpcmQtd2llZGVyLWdlc3BlcnJ0LV8td2FzLWZhaHJnYWVzdGUtYmVhY2h0ZW4tbXVlc3Nlbi03MjQ0MjYwOS5odG1s0gEA?oc=5" target="_blank">Bahnstreik und Sperrung - Nichts geht mehr beim RE2 Cottbus – Berlin </a >&nbsp;&nbsp;<font color="#6f6f6f">Lausitzer Rundschau </font ></li ><li ><a href="https://news.google.com/rss/articles/CBMingFodHRwczovL3d3dy5zcGllZ2VsLmRlL3dpcnRzY2hhZnQvc2VydmljZS9kZXV0c2NoZS1iYWhuLWdkbC1sb2tmdWVocmVyLWRlci1iYWhuLXN0cmVpa2VuLWFiLWRvbm5lcnN0YWctYmlzLWZyZWl0YWdhYmVuZC1hLTJhN2Q1OWUyLTBmOTUtNDVhYi04OTFkLTI4NjcxMGI1MWI1MdIBAA?oc=5" target="_blank">Deutsche Bahn/GDL: Lokführer der Bahn streiken ab Donnerstag bis Freitagabend </a >&nbsp;&nbsp;<font color="#6f6f6f">DER SPIEGEL </font ></li ></ol >',
        author: "tagesschau.de",
        publishedAt: 1701890400,
      },
      {
        id: "googlenews-myuser-mycolumn-8c1368ef1bc9e52356bffba3ce60cd48-196ae0209c5e61dd3b746eda4f7e7eef",
        userId: "myuser",
        columnId: "mycolumn",
        sourceId: "googlenews-myuser-mycolumn-8c1368ef1bc9e52356bffba3ce60cd48",
        title:
          "Lassen die USA die Ukraine im Stich?: US-Finanzministerin spricht von „katastrophaler Situation“ - Tagesspiegel",
        link: "https://news.google.com/rss/articles/CBMilgFodHRwczovL3d3dy50YWdlc3NwaWVnZWwuZGUvaW50ZXJuYXRpb25hbGVzL2xhc3Nlbi1kaWUtdXNhLWRpZS11a3JhaW5lLWltLXN0aWNoLXVzLWZpbmFuem1pbmlzdGVyaW4tc3ByaWNodC12b24ta2F0YXN0cm9waGFsZXItc2l0dWF0aW9uLTEwODg3Nzg3Lmh0bWzSAQA?oc=5",
        description:
          '<ol ><li ><a href="https://news.google.com/rss/articles/CBMilgFodHRwczovL3d3dy50YWdlc3NwaWVnZWwuZGUvaW50ZXJuYXRpb25hbGVzL2xhc3Nlbi1kaWUtdXNhLWRpZS11a3JhaW5lLWltLXN0aWNoLXVzLWZpbmFuem1pbmlzdGVyaW4tc3ByaWNodC12b24ta2F0YXN0cm9waGFsZXItc2l0dWF0aW9uLTEwODg3Nzg3Lmh0bWzSAQA?oc=5" target="_blank">Lassen die USA die Ukraine im Stich?: US-Finanzministerin spricht von „katastrophaler Situation“</a >&nbsp;&nbsp;<font color="#6f6f6f">Tagesspiegel </font ></li ><li ><a href="https://news.google.com/rss/articles/CCAiC0lETWpHLXRoZ3ZNmAEB?oc=5" target="_blank">Rüstungskonferenz in Washington: Ukraine-Hilfen der USA laufen aus </a >&nbsp;&nbsp;<font color="#6f6f6f">tagesschau </font ></li ><li ><a href="https://news.google.com/rss/articles/CBMiiwFodHRwczovL3d3dy5iaWxkLmRlL3BvbGl0aWsvYXVzbGFuZC9wb2xpdGlrLWF1c2xhbmQvc2VsZW5za3lqLXNhZ3QtYXVmdHJpdHQtdm9yLXVzLXNlbmF0b3Jlbi1hYi1ldHdhcy1kYXp3aXNjaGVuZ2Vrb21tZW4tODYzMzg3OTIuYmlsZC5odG1s0gEA?oc=5" target="_blank">Selenskyj sagt Auftritt vor US-Senatoren ab: „Etwas dazwischengekommen“</a >&nbsp;&nbsp;<font color="#6f6f6f">BILD </font ></li ><li ><a href="https://news.google.com/rss/articles/CBMic2h0dHBzOi8vd3d3LnQtb25saW5lLmRlL25hY2hyaWNodGVuL2F1c2xhbmQvdXNhL3VzLXdhaGwvaWRfMTAwMjk2MDQ4L3VzYS1oYWJlbi1rZWluLWdlbGQtbWVoci1mdWVyLWRpZS11a3JhaW5lLmh0bWzSAQA?oc=5" target="_blank">USA haben kein Geld mehr für die Ukraine </a >&nbsp;&nbsp;<font color="#6f6f6f">t-online </font ></li ><li ><a href="https://news.google.com/rss/articles/CBMibGh0dHBzOi8vd3d3Lm1vcmdlbnBvc3QuZGUvcG9saXRpay9hcnRpY2xlMjQwNzUyNTI2L1VrcmFpbmUtS3JpZWctQW1lcmlrYS1kYXJmLW5pY2h0LXZvbi1kZXItRmFobmUtZ2VoZW4uaHRtbNIBAA?oc=5" target="_blank">Ukraine-Krieg: Putins wichtigste Unterstützer sitzen in Washington </a >&nbsp;&nbsp;<font color="#6f6f6f">Berliner Morgenpost </font ></li ></ol >',
        author: "Tagesspiegel",
        publishedAt: 1701877080,
      },
    ]);
  } finally {
    fetchWithTimeoutSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZxYUdjU0FtUmxHZ0pFUlNnQVAB?hl=de&gl=DE&ceid=DE%3Ade",
      { method: "get" },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseUrl, { status: 200 }));
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
});

Deno.test("getGooglenewsFeed - Search", async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    "fetchWithTimeout",
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responseSearch, { status: 200 }));
      }),
    ]),
  );

  try {
    const { source, items } = await getGooglenewsFeed(
      supabaseClient,
      undefined,
      mockProfile,
      {
        ...mockSource,
        options: {
          googlenews: {
            type: "search",
            search: "Chemnitz",
            ceid: "DE:de",
            gl: "DE",
            hl: "de",
          },
        },
      },
      undefined,
    );
    feedutils.assertEqualsSource(source, {
      id: "googlenews-myuser-mycolumn-5ef472fe226393772d05c92261df68e1",
      columnId: "mycolumn",
      userId: "myuser",
      type: "googlenews",
      title: '"Chemnitz" - Google News',
      options: {
        googlenews: {
          type: "search",
          search: "Chemnitz",
          ceid: "DE:de",
          gl: "DE",
          hl: "de",
          url: "https://news.google.com/rss/search?q=Chemnitz&hl=de&gl=DE&ceid=DE:de",
        },
      },
      link: "https://news.google.com/search?q=Chemnitz &hl=de &gl=DE &ceid=DE:de",
    });
    feedutils.assertEqualsItems(items, [
      {
        id: "googlenews-myuser-mycolumn-5ef472fe226393772d05c92261df68e1-d834d987207ffda8946e25df15adea75",
        userId: "myuser",
        columnId: "mycolumn",
        sourceId: "googlenews-myuser-mycolumn-5ef472fe226393772d05c92261df68e1",
        title:
          'Chemnitz: Preisschock bei "eins energie"! Fernwärme wird 75 Prozent teurer - TAG24',
        link: "https://news.google.com/rss/articles/CBMibGh0dHBzOi8vd3d3LnRhZzI0LmRlL2NoZW1uaXR6L2xva2FsZXMvcHJlaXNzY2hvY2stYmVpLWVpbnMtZW5lcmdpZS1mZXJud2Flcm1lLXdpcmQtNzUtcHJvemVudC10ZXVyZXItMzAzMjA5MdIBcGh0dHBzOi8vd3d3LnRhZzI0LmRlL2FtcC9jaGVtbml0ei9sb2thbGVzL3ByZWlzc2Nob2NrLWJlaS1laW5zLWVuZXJnaWUtZmVybndhZXJtZS13aXJkLTc1LXByb3plbnQtdGV1cmVyLTMwMzIwOTE?oc=5",
        description:
          '<a href="https://news.google.com/rss/articles/CBMibGh0dHBzOi8vd3d3LnRhZzI0LmRlL2NoZW1uaXR6L2xva2FsZXMvcHJlaXNzY2hvY2stYmVpLWVpbnMtZW5lcmdpZS1mZXJud2Flcm1lLXdpcmQtNzUtcHJvemVudC10ZXVyZXItMzAzMjA5MdIBcGh0dHBzOi8vd3d3LnRhZzI0LmRlL2FtcC9jaGVtbml0ei9sb2thbGVzL3ByZWlzc2Nob2NrLWJlaS1laW5zLWVuZXJnaWUtZmVybndhZXJtZS13aXJkLTc1LXByb3plbnQtdGV1cmVyLTMwMzIwOTE?oc=5" target="_blank">Chemnitz: Preisschock bei "eins energie"! Fernwärme wird 75 Prozent teurer </a >&nbsp;&nbsp;<font color="#6f6f6f">TAG24 </font >',
        author: "TAG24",
        publishedAt: 1701837000,
      },
      {
        id: "googlenews-myuser-mycolumn-5ef472fe226393772d05c92261df68e1-f9fdb0be0cc37b302c47ad155e25ae7a",
        userId: "myuser",
        columnId: "mycolumn",
        sourceId: "googlenews-myuser-mycolumn-5ef472fe226393772d05c92261df68e1",
        title:
          "Ehemaliges Chemnitzer Straßenbahndepot wird zu Garagencampus - MDR",
        link: "https://news.google.com/rss/articles/CBMiN2h0dHBzOi8vd3d3Lm1kci5kZS92aWRlby9tZHItdmlkZW9zL2EvdmlkZW8tNzc5OTUyLmh0bWzSAQA?oc=5",
        description:
          '<a href="https://news.google.com/rss/articles/CBMiN2h0dHBzOi8vd3d3Lm1kci5kZS92aWRlby9tZHItdmlkZW9zL2EvdmlkZW8tNzc5OTUyLmh0bWzSAQA?oc=5" target="_blank">Ehemaliges Chemnitzer Straßenbahndepot wird zu Garagencampus </a >&nbsp;&nbsp;<font color="#6f6f6f">MDR </font >',
        author: "MDR",
        publishedAt: 1701890668,
      },
    ]);
  } finally {
    fetchWithTimeoutSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      "https://news.google.com/rss/search?q=Chemnitz&hl=de&gl=DE&ceid=DE:de",
      { method: "get" },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseSearch, { status: 200 }));
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
});
