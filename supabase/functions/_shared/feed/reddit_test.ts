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
import { getRedditFeed, isRedditUrl } from './reddit.ts';
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

const responseSubreddit = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
   <category term="kubernetes" label="r/kubernetes" />
   <updated>2023-12-10T17:06:31+00:00</updated>
   <icon>https://www.redditstatic.com/icon.png/</icon>
   <id>/r/kubernetes.rss</id>
   <link rel="self" href="https://www.reddit.com/r/kubernetes.rss" type="application/atom+xml" />
   <link rel="alternate" href="https://www.reddit.com/r/kubernetes" type="text/html" />
   <subtitle>Kubernetes discussion, news, support, and link sharing.</subtitle>
   <title>Kubernetes</title>
   <entry>
      <author>
         <name>/u/gctaylor</name>
         <uri>https://www.reddit.com/user/gctaylor</uri>
      </author>
      <category term="kubernetes" label="r/kubernetes" />
      <content type="html">&lt;!-- SC_OFF --&gt;&lt;div class="md"&gt;&lt;p&gt;This monthly post can be used to share Kubernetes-related job openings within &lt;strong&gt;your&lt;/strong&gt; company. Please include:&lt;/p&gt; &lt;ul&gt; &lt;li&gt;Name of the company&lt;/li&gt; &lt;li&gt;Location requirements (or lack thereof)&lt;/li&gt; &lt;li&gt;At least one of: a link to a job posting/application page or contact details&lt;br/&gt;&lt;/li&gt; &lt;/ul&gt; &lt;p&gt;If you are interested in a job, please contact the poster directly. &lt;/p&gt; &lt;p&gt;Common reasons for comment removal:&lt;/p&gt; &lt;ul&gt; &lt;li&gt;Not meeting the above requirements&lt;/li&gt; &lt;li&gt;Recruiter post / recruiter listings&lt;/li&gt; &lt;li&gt;Negative, inflammatory, or abrasive tone&lt;/li&gt; &lt;/ul&gt; &lt;/div&gt;&lt;!-- SC_ON --&gt; &amp;#32; submitted by &amp;#32; &lt;a href="https://www.reddit.com/user/gctaylor"&gt; /u/gctaylor &lt;/a&gt; &lt;br/&gt; &lt;span&gt;&lt;a href="https://www.reddit.com/r/kubernetes/comments/18895rv/monthly_who_is_hiring/"&gt;[link]&lt;/a&gt;&lt;/span&gt; &amp;#32; &lt;span&gt;&lt;a href="https://www.reddit.com/r/kubernetes/comments/18895rv/monthly_who_is_hiring/"&gt;[Kommentare]&lt;/a&gt;&lt;/span&gt;</content>
      <id>t3_18895rv</id>
      <link href="https://www.reddit.com/r/kubernetes/comments/18895rv/monthly_who_is_hiring/" />
      <updated>2023-12-01T11:00:17+00:00</updated>
      <published>2023-12-01T11:00:17+00:00</published>
      <title>Monthly: Who is hiring?</title>
   </entry>
   <entry>
      <author>
         <name>/u/gctaylor</name>
         <uri>https://www.reddit.com/user/gctaylor</uri>
      </author>
      <category term="kubernetes" label="r/kubernetes" />
      <content type="html">&lt;!-- SC_OFF --&gt;&lt;div class="md"&gt;&lt;p&gt;Got something working? Figure something out? Make progress that you are excited about? Share here!&lt;/p&gt; &lt;/div&gt;&lt;!-- SC_ON --&gt; &amp;#32; submitted by &amp;#32; &lt;a href="https://www.reddit.com/user/gctaylor"&gt; /u/gctaylor &lt;/a&gt; &lt;br/&gt; &lt;span&gt;&lt;a href="https://www.reddit.com/r/kubernetes/comments/18dkeyn/weekly_share_your_victories_thread/"&gt;[link]&lt;/a&gt;&lt;/span&gt; &amp;#32; &lt;span&gt;&lt;a href="https://www.reddit.com/r/kubernetes/comments/18dkeyn/weekly_share_your_victories_thread/"&gt;[Kommentare]&lt;/a&gt;&lt;/span&gt;</content>
      <id>t3_18dkeyn</id>
      <link href="https://www.reddit.com/r/kubernetes/comments/18dkeyn/weekly_share_your_victories_thread/" />
      <updated>2023-12-08T11:00:13+00:00</updated>
      <published>2023-12-08T11:00:13+00:00</published>
      <title>Weekly: Share your victories thread</title>
   </entry>
   <entry>
      <author>
         <name>/u/Lanky-Ad4698</name>
         <uri>https://www.reddit.com/user/Lanky-Ad4698</uri>
      </author>
      <category term="kubernetes" label="r/kubernetes" />
      <content type="html">&lt;!-- SC_OFF --&gt;&lt;div class="md"&gt;&lt;p&gt;My environment plan:&lt;/p&gt; &lt;p&gt;Local: KinD&lt;/p&gt; &lt;p&gt;Dev: Hetzner Single VPS&lt;/p&gt; &lt;p&gt;Prod: Hetzner Multiple Servers&lt;/p&gt; &lt;p&gt;What is the best way to deploy K8s on a single VPS to save money in dev environment? Control plane, worker nodes all on single VPS. The goal is to have the dev environment as similar to Prod (portable), but want to save money on cheap single VPS.&lt;/p&gt; &lt;p&gt;I plan on self managing K8s. I know somebody in the comments is just going to be like, just do managed K8s. On that budget mode and want to learn. I really don’t think self managing K8s is that bad and only considered scary because most people just jump straight to managed immediately. I mean I will possibly do managed on PRD, but then Dev and PRD not portable.&lt;/p&gt; &lt;p&gt;In terms of stateful Pods, I want dev to have all that in K8s. But PRD most likely will be managed database and session store. Unless having state full things in K8s isn’t that bad. But from what I’ve read nobody likes keeping state full things in K8s. You can kind of see my problem, making dev cheap makes it not as portable to PRD.&lt;/p&gt; &lt;p&gt;Yes I’m aware that single VPS K8s is not HA, but that’s not a problem for Dev environment.&lt;/p&gt; &lt;p&gt;I see so many tools for self managed K8s, and idk what is the way. Kops? Kubespray?&lt;/p&gt; &lt;/div&gt;&lt;!-- SC_ON --&gt; &amp;#32; submitted by &amp;#32; &lt;a href="https://www.reddit.com/user/Lanky-Ad4698"&gt; /u/Lanky-Ad4698 &lt;/a&gt; &lt;br/&gt; &lt;span&gt;&lt;a href="https://www.reddit.com/r/kubernetes/comments/18f3d7o/best_way_to_deploy_k8s_to_single_vps_for_dev/"&gt;[link]&lt;/a&gt;&lt;/span&gt; &amp;#32; &lt;span&gt;&lt;a href="https://www.reddit.com/r/kubernetes/comments/18f3d7o/best_way_to_deploy_k8s_to_single_vps_for_dev/"&gt;[Kommentare]&lt;/a&gt;&lt;/span&gt;</content>
      <id>t3_18f3d7o</id>
      <link href="https://www.reddit.com/r/kubernetes/comments/18f3d7o/best_way_to_deploy_k8s_to_single_vps_for_dev/" />
      <updated>2023-12-10T13:13:56+00:00</updated>
      <published>2023-12-10T13:13:56+00:00</published>
      <title>Best way to deploy K8s to single VPS for dev environment</title>
   </entry>
   <entry>
      <author>
         <name>/u/abexami</name>
         <uri>https://www.reddit.com/user/abexami</uri>
      </author>
      <category term="kubernetes" label="r/kubernetes" />
      <content type="html">&lt;!-- SC_OFF --&gt;&lt;div class="md"&gt;&lt;p&gt;In our company, we utilize VMWare VSphere as our virtualization solution and a NetApp SAN for storage. The NetApp SAN is connected to VCenter, which is running in FC (Fibre Channel) mode. We have chosen not to support iSCSI or any TCP/IP bound protocol.&lt;/p&gt; &lt;p&gt;Currently, we have a production-ready Kubernetes cluster running on nodes from VCenter, which supports our stateless applications. However, we encountered a challenge when we wanted to migrate our stateful workloads (databases, object storages, etc.) to K8S. We are in need of a resilient solution to provide PersistentVolumes in our cluster, and we prefer not to use hostpath. Therefore, we require a CSI plugin that can provide dynamic volumes.&lt;/p&gt; &lt;p&gt;After exploring different options, it appears that the NetApp&amp;#39;s CSI plugin (Trident) is not yet production-ready and does not support FC mode. This information is based on the documentation and an issue raised on the Trident GitHub repository.&lt;/p&gt; &lt;p&gt;There is a CSI plugin compatible with FC SAN for Dell products, but it seems to be specific to Dell.&lt;/p&gt; &lt;p&gt;Overall, we didn&amp;#39;t find a proper way to connect the NetApp SAN directly to K8S and went for another solution and we reached VMWare CNS (Cloud Native Storage) plugin for VSphere, conceptually, it can do the job for us (in conjunction with VSphere CSI and/or VSphere CPI), but it seems that it only support vSAN as storage backend and not the SAN luns (I&amp;#39;m not sure, it was not clear enough in the docs).&lt;/p&gt; &lt;p&gt;I have two (or maybe three questions now):&lt;/p&gt; &lt;ol&gt; &lt;li&gt;Is there any CSI plugin for NetApp SAN FC mode to directly use it in K8S?&lt;/li&gt; &lt;li&gt;Is it possible to connect the CNS directly to SAN and to the VSphere CSI in K8S?&lt;/li&gt; &lt;li&gt;If the answer to neither of the above is yes, what can we do to provide K8S storages with our existing hardware?&lt;/li&gt; &lt;/ol&gt; &lt;/div&gt;&lt;!-- SC_ON --&gt; &amp;#32; submitted by &amp;#32; &lt;a href="https://www.reddit.com/user/abexami"&gt; /u/abexami &lt;/a&gt; &lt;br/&gt; &lt;span&gt;&lt;a href="https://www.reddit.com/r/kubernetes/comments/18f5b8v/how_to_use_netapp_san_storage_to_provide/"&gt;[link]&lt;/a&gt;&lt;/span&gt; &amp;#32; &lt;span&gt;&lt;a href="https://www.reddit.com/r/kubernetes/comments/18f5b8v/how_to_use_netapp_san_storage_to_provide/"&gt;[Kommentare]&lt;/a&gt;&lt;/span&gt;</content>
      <id>t3_18f5b8v</id>
      <link href="https://www.reddit.com/r/kubernetes/comments/18f5b8v/how_to_use_netapp_san_storage_to_provide/" />
      <updated>2023-12-10T14:56:01+00:00</updated>
      <published>2023-12-10T14:56:01+00:00</published>
      <title>How to use NetApp SAN storage to provide Kubernetes Persistent Volumes?</title>
   </entry>
   <entry>
      <author>
         <name>/u/ekayan</name>
         <uri>https://www.reddit.com/user/ekayan</uri>
      </author>
      <category term="kubernetes" label="r/kubernetes" />
      <content type="html">&lt;!-- SC_OFF --&gt;&lt;div class="md"&gt;&lt;p&gt;Wanted some opinion on CPU limits in the K8s world.&lt;/p&gt; &lt;p&gt;I understand CPU is a compressible resource.&lt;/p&gt; &lt;p&gt;&amp;#x200B;&lt;/p&gt; &lt;p&gt;There are some school of thoughts which advocate NOT setting limits on CPU and let pods overuse when they need.&lt;/p&gt; &lt;ul&gt; &lt;li&gt;advocated in - Kubernetes Patterns, 2nd Edition book - &lt;a href="https://learning.oreilly.com/library/view/kubernetes-patterns-2nd/9781098131678/"&gt;link&lt;/a&gt;&lt;/li&gt; &lt;li&gt;an year write up here - &lt;a href="https://home.robusta.dev/blog/stop-using-cpu-limits"&gt;link&lt;/a&gt;&lt;/li&gt; &lt;li&gt;some old discussion here with POC-- &lt;a href="https://www.reddit.com/r/kubernetes/comments/ulx54i/k8s_without_cpu_limits_we_put_it_on_the_lab_to/"&gt;link&lt;/a&gt;&lt;/li&gt; &lt;/ul&gt; &lt;p&gt;&amp;#x200B;&lt;/p&gt; &lt;p&gt;However, on the documentation, I see that the containers without limits could use all the resouces on the worker node.&lt;/p&gt; &lt;p&gt;&lt;a href="https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/#if-you-do-not-specify-a-cpu-limit"&gt;https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/#if-you-do-not-specify-a-cpu-limit&lt;/a&gt;&lt;/p&gt; &lt;pre&gt;&lt;code&gt;The Container has no upper bound on the CPU resources it can use. The Container could use all of the CPU resources available on the Node where it is running. &lt;/code&gt;&lt;/pre&gt; &lt;p&gt;&amp;#x200B;&lt;/p&gt; &lt;p&gt;My question is :&lt;/p&gt; &lt;ul&gt; &lt;li&gt;If I don&amp;#39;t set CPU limits, will the containers use all the CPU resources on the worker node ONLY if the worker node has the free/unused resource available?&lt;/li&gt; &lt;li&gt;in the extreme scenario if CPU resources are exhausted, will all pods will get proportionally their cut &amp;quot;according to the CPU requests you set.&amp;quot; ?&lt;/li&gt; &lt;/ul&gt; &lt;p&gt;Just being cautious if other containers in the worker node will suffer if I remove the CPU limits.&lt;/p&gt; &lt;p&gt;&amp;#x200B;&lt;/p&gt; &lt;p&gt;Thanks much for any thoughts in advance.&lt;/p&gt; &lt;/div&gt;&lt;!-- SC_ON --&gt; &amp;#32; submitted by &amp;#32; &lt;a href="https://www.reddit.com/user/ekayan"&gt; /u/ekayan &lt;/a&gt; &lt;br/&gt; &lt;span&gt;&lt;a href="https://www.reddit.com/r/kubernetes/comments/18exirq/request_for_opinion_cpu_limits_in_the_k8s_world/"&gt;[link]&lt;/a&gt;&lt;/span&gt; &amp;#32; &lt;span&gt;&lt;a href="https://www.reddit.com/r/kubernetes/comments/18exirq/request_for_opinion_cpu_limits_in_the_k8s_world/"&gt;[Kommentare]&lt;/a&gt;&lt;/span&gt;</content>
      <id>t3_18exirq</id>
      <link href="https://www.reddit.com/r/kubernetes/comments/18exirq/request_for_opinion_cpu_limits_in_the_k8s_world/" />
      <updated>2023-12-10T06:40:08+00:00</updated>
      <published>2023-12-10T06:40:08+00:00</published>
      <title>[Request for opinion] : CPU limits in the K8s world</title>
   </entry>
</feed>`;

Deno.test('isRedditUrl', () => {
  assertEquals(
    isRedditUrl('https://www.reddit.com/r/kubernetes/'),
    true,
  );
  assertEquals(isRedditUrl('https://www.google.de/'), false);
});

Deno.test('getRedditFeed', async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    'fetchWithTimeout',
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responseSubreddit, { status: 200 }));
      }),
    ]),
  );

  try {
    const { source, items } = await getRedditFeed(
      supabaseClient,
      undefined,
      mockProfile,
      {
        ...mockSource,
        options: { reddit: '/r/kubernetes' },
      },
      undefined,
    );
    feedutils.assertEqualsSource(source, {
      'id': 'reddit-myuser-mycolumn-87e62a33042b3fdf4eac36ae57d55fc8',
      'columnId': 'mycolumn',
      'userId': 'myuser',
      'type': 'reddit',
      'title': 'Kubernetes',
      'options': { 'reddit': 'https://www.reddit.com/r/kubernetes.rss' },
      'link': 'https://www.reddit.com/r/kubernetes.rss',
    });
    feedutils.assertEqualsItems(items, [{
      'id':
        'reddit-myuser-mycolumn-87e62a33042b3fdf4eac36ae57d55fc8-109de6824b3a6446882072dce0d4539d',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'reddit-myuser-mycolumn-87e62a33042b3fdf4eac36ae57d55fc8',
      'title': 'Monthly: Who is hiring?',
      'link':
        'https://www.reddit.com/r/kubernetes/comments/18895rv/monthly_who_is_hiring/',
      'description':
        '<!-- SC_OFF --><div class="md"><p>This monthly post can be used to share Kubernetes-related job openings within <strong>your</strong> company. Please include:</p> <ul> <li>Name of the company</li> <li>Location requirements (or lack thereof)</li> <li>At least one of: a link to a job posting/application page or contact details<br/></li> </ul> <p>If you are interested in a job, please contact the poster directly. </p> <p>Common reasons for comment removal:</p> <ul> <li>Not meeting the above requirements</li> <li>Recruiter post / recruiter listings</li> <li>Negative, inflammatory, or abrasive tone</li> </ul> </div><!-- SC_ON --> &#32; submitted by &#32; <a href="https://www.reddit.com/user/gctaylor"> /u/gctaylor </a> <br/> <span><a href="https://www.reddit.com/r/kubernetes/comments/18895rv/monthly_who_is_hiring/">[link]</a></span> &#32; <span><a href="https://www.reddit.com/r/kubernetes/comments/18895rv/monthly_who_is_hiring/">[Kommentare]</a></span>',
      'author': '/u/gctaylor',
      'publishedAt': 1701428417,
    }, {
      'id':
        'reddit-myuser-mycolumn-87e62a33042b3fdf4eac36ae57d55fc8-eb77579ebc7a3ef77471fe91fb4feecc',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'reddit-myuser-mycolumn-87e62a33042b3fdf4eac36ae57d55fc8',
      'title': 'Weekly: Share your victories thread',
      'link':
        'https://www.reddit.com/r/kubernetes/comments/18dkeyn/weekly_share_your_victories_thread/',
      'description':
        '<!-- SC_OFF --><div class="md"><p>Got something working? Figure something out? Make progress that you are excited about? Share here!</p> </div><!-- SC_ON --> &#32; submitted by &#32; <a href="https://www.reddit.com/user/gctaylor"> /u/gctaylor </a> <br/> <span><a href="https://www.reddit.com/r/kubernetes/comments/18dkeyn/weekly_share_your_victories_thread/">[link]</a></span> &#32; <span><a href="https://www.reddit.com/r/kubernetes/comments/18dkeyn/weekly_share_your_victories_thread/">[Kommentare]</a></span>',
      'author': '/u/gctaylor',
      'publishedAt': 1702033213,
    }, {
      'id':
        'reddit-myuser-mycolumn-87e62a33042b3fdf4eac36ae57d55fc8-081da9534f66b5a2f9f345747197319d',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'reddit-myuser-mycolumn-87e62a33042b3fdf4eac36ae57d55fc8',
      'title': 'Best way to deploy K8s to single VPS for dev environment',
      'link':
        'https://www.reddit.com/r/kubernetes/comments/18f3d7o/best_way_to_deploy_k8s_to_single_vps_for_dev/',
      'description':
        '<!-- SC_OFF --><div class="md"><p>My environment plan:</p> <p>Local: KinD</p> <p>Dev: Hetzner Single VPS</p> <p>Prod: Hetzner Multiple Servers</p> <p>What is the best way to deploy K8s on a single VPS to save money in dev environment? Control plane, worker nodes all on single VPS. The goal is to have the dev environment as similar to Prod (portable), but want to save money on cheap single VPS.</p> <p>I plan on self managing K8s. I know somebody in the comments is just going to be like, just do managed K8s. On that budget mode and want to learn. I really don’t think self managing K8s is that bad and only considered scary because most people just jump straight to managed immediately. I mean I will possibly do managed on PRD, but then Dev and PRD not portable.</p> <p>In terms of stateful Pods, I want dev to have all that in K8s. But PRD most likely will be managed database and session store. Unless having state full things in K8s isn’t that bad. But from what I’ve read nobody likes keeping state full things in K8s. You can kind of see my problem, making dev cheap makes it not as portable to PRD.</p> <p>Yes I’m aware that single VPS K8s is not HA, but that’s not a problem for Dev environment.</p> <p>I see so many tools for self managed K8s, and idk what is the way. Kops? Kubespray?</p> </div><!-- SC_ON --> &#32; submitted by &#32; <a href="https://www.reddit.com/user/Lanky-Ad4698"> /u/Lanky-Ad4698 </a> <br/> <span><a href="https://www.reddit.com/r/kubernetes/comments/18f3d7o/best_way_to_deploy_k8s_to_single_vps_for_dev/">[link]</a></span> &#32; <span><a href="https://www.reddit.com/r/kubernetes/comments/18f3d7o/best_way_to_deploy_k8s_to_single_vps_for_dev/">[Kommentare]</a></span>',
      'author': '/u/Lanky-Ad4698',
      'publishedAt': 1702214036,
    }, {
      'id':
        'reddit-myuser-mycolumn-87e62a33042b3fdf4eac36ae57d55fc8-ea9508517c2f840daf415352c2c2eaf1',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'reddit-myuser-mycolumn-87e62a33042b3fdf4eac36ae57d55fc8',
      'title':
        'How to use NetApp SAN storage to provide Kubernetes Persistent Volumes?',
      'link':
        'https://www.reddit.com/r/kubernetes/comments/18f5b8v/how_to_use_netapp_san_storage_to_provide/',
      'description':
        '<!-- SC_OFF --><div class="md"><p>In our company, we utilize VMWare VSphere as our virtualization solution and a NetApp SAN for storage. The NetApp SAN is connected to VCenter, which is running in FC (Fibre Channel) mode. We have chosen not to support iSCSI or any TCP/IP bound protocol.</p> <p>Currently, we have a production-ready Kubernetes cluster running on nodes from VCenter, which supports our stateless applications. However, we encountered a challenge when we wanted to migrate our stateful workloads (databases, object storages, etc.) to K8S. We are in need of a resilient solution to provide PersistentVolumes in our cluster, and we prefer not to use hostpath. Therefore, we require a CSI plugin that can provide dynamic volumes.</p> <p>After exploring different options, it appears that the NetApp\'s CSI plugin (Trident) is not yet production-ready and does not support FC mode. This information is based on the documentation and an issue raised on the Trident GitHub repository.</p> <p>There is a CSI plugin compatible with FC SAN for Dell products, but it seems to be specific to Dell.</p> <p>Overall, we didn\'t find a proper way to connect the NetApp SAN directly to K8S and went for another solution and we reached VMWare CNS (Cloud Native Storage) plugin for VSphere, conceptually, it can do the job for us (in conjunction with VSphere CSI and/or VSphere CPI), but it seems that it only support vSAN as storage backend and not the SAN luns (I\'m not sure, it was not clear enough in the docs).</p> <p>I have two (or maybe three questions now):</p> <ol> <li>Is there any CSI plugin for NetApp SAN FC mode to directly use it in K8S?</li> <li>Is it possible to connect the CNS directly to SAN and to the VSphere CSI in K8S?</li> <li>If the answer to neither of the above is yes, what can we do to provide K8S storages with our existing hardware?</li> </ol> </div><!-- SC_ON --> &#32; submitted by &#32; <a href="https://www.reddit.com/user/abexami"> /u/abexami </a> <br/> <span><a href="https://www.reddit.com/r/kubernetes/comments/18f5b8v/how_to_use_netapp_san_storage_to_provide/">[link]</a></span> &#32; <span><a href="https://www.reddit.com/r/kubernetes/comments/18f5b8v/how_to_use_netapp_san_storage_to_provide/">[Kommentare]</a></span>',
      'author': '/u/abexami',
      'publishedAt': 1702220161,
    }, {
      'id':
        'reddit-myuser-mycolumn-87e62a33042b3fdf4eac36ae57d55fc8-a0c951151b5cfea0d6f9281c791ade02',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId': 'reddit-myuser-mycolumn-87e62a33042b3fdf4eac36ae57d55fc8',
      'title': '[Request for opinion] : CPU limits in the K8s world',
      'link':
        'https://www.reddit.com/r/kubernetes/comments/18exirq/request_for_opinion_cpu_limits_in_the_k8s_world/',
      'description':
        '<!-- SC_OFF --><div class="md"><p>Wanted some opinion on CPU limits in the K8s world.</p> <p>I understand CPU is a compressible resource.</p> <p>&#x200B;</p> <p>There are some school of thoughts which advocate NOT setting limits on CPU and let pods overuse when they need.</p> <ul> <li>advocated in - Kubernetes Patterns, 2nd Edition book - <a href="https://learning.oreilly.com/library/view/kubernetes-patterns-2nd/9781098131678/">link</a></li> <li>an year write up here - <a href="https://home.robusta.dev/blog/stop-using-cpu-limits">link</a></li> <li>some old discussion here with POC-- <a href="https://www.reddit.com/r/kubernetes/comments/ulx54i/k8s_without_cpu_limits_we_put_it_on_the_lab_to/">link</a></li> </ul> <p>&#x200B;</p> <p>However, on the documentation, I see that the containers without limits could use all the resouces on the worker node.</p> <p><a href="https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/#if-you-do-not-specify-a-cpu-limit">https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/#if-you-do-not-specify-a-cpu-limit</a></p> <pre><code>The Container has no upper bound on the CPU resources it can use. The Container could use all of the CPU resources available on the Node where it is running. </code></pre> <p>&#x200B;</p> <p>My question is :</p> <ul> <li>If I don\'t set CPU limits, will the containers use all the CPU resources on the worker node ONLY if the worker node has the free/unused resource available?</li> <li>in the extreme scenario if CPU resources are exhausted, will all pods will get proportionally their cut "according to the CPU requests you set." ?</li> </ul> <p>Just being cautious if other containers in the worker node will suffer if I remove the CPU limits.</p> <p>&#x200B;</p> <p>Thanks much for any thoughts in advance.</p> </div><!-- SC_ON --> &#32; submitted by &#32; <a href="https://www.reddit.com/user/ekayan"> /u/ekayan </a> <br/> <span><a href="https://www.reddit.com/r/kubernetes/comments/18exirq/request_for_opinion_cpu_limits_in_the_k8s_world/">[link]</a></span> &#32; <span><a href="https://www.reddit.com/r/kubernetes/comments/18exirq/request_for_opinion_cpu_limits_in_the_k8s_world/">[Kommentare]</a></span>',
      'author': '/u/ekayan',
      'publishedAt': 1702190408,
    }]);
  } finally {
    fetchWithTimeoutSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      'https://www.reddit.com/r/kubernetes.rss',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseSubreddit, { status: 200 }));
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
});
