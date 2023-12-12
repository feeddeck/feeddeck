import { createClient } from '@supabase/supabase-js';
import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from 'std/testing/mock';

import { ISource } from '../models/source.ts';
import { IProfile } from '../models/profile.ts';
import { getStackoverflowFeed } from './stackoverflow.ts';
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

const responseTag = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:creativeCommons="http://backend.userland.com/creativeCommonsRssModule" xmlns:re="http://purl.org/atompub/rank/1.0">
   <title type="text">Newest questions tagged kubernetes - Stack Overflow</title>
   <link rel="self" href="https://stackoverflow.com/feeds/tag?tagnames=kubernetes&amp;sort=newest" type="application/atom+xml" />
   <link rel="alternate" href="https://stackoverflow.com/questions/tagged/?tagnames=kubernetes&amp;sort=newest" type="text/html" />
   <subtitle>most recent 30 from stackoverflow.com</subtitle>
   <updated>2023-12-10T17:21:25Z</updated>
   <id>https://stackoverflow.com/feeds/tag?tagnames=kubernetes&amp;sort=newest</id>
   <creativeCommons:license>https://creativecommons.org/licenses/by-sa/4.0/rdf</creativeCommons:license>
   <entry>
      <id>https://stackoverflow.com/q/77635559</id>
      <re:rank scheme="https://stackoverflow.com">0</re:rank>
      <title type="text">Kubernetes Ingress behind Cloud Load Balancer</title>
      <category scheme="https://stackoverflow.com/tags" term="kubernetes" />
      <category scheme="https://stackoverflow.com/tags" term="kubernetes-ingress" />
      <category scheme="https://stackoverflow.com/tags" term="ingress-controller" />
      <category scheme="https://stackoverflow.com/tags" term="hetzner-cloud" />
      <author>
         <name>Dominik.W</name>
         <uri>https://stackoverflow.com/users/23076575</uri>
      </author>
      <link rel="alternate" href="https://stackoverflow.com/questions/77635559/kubernetes-ingress-behind-cloud-load-balancer" />
      <published>2023-12-10T16:39:44Z</published>
      <updated>2023-12-10T16:39:44Z</updated>
      <summary type="html">&lt;p&gt;When using an Ingress Controller in Kubernetes the Ingress service is usually exposed via Load Balancer. Now I’m trining to understand on how this exactly works.
As I understand it the Ingress Controller is just running as an Pod like any other app and gets exposed via the Load Balancer.
When configuring the external load balancer what target do I set, the Worker nodes or the master nodes, or does this even matter because I use a Service and then it’s automatically internally Load balanced?&lt;/p&gt;
&lt;p&gt;I try to get this Right so I can setup a Kubernetes Cluster in the Hetzner Cloud, because it has no managed service I need to do basically everything on my on but it provides the services to theoretically host a full HA cluster.
So the plan is to have for the beginning 3 Master Nodes and 2/3 Worker Nodes and an Managed Load Balancer in front of everything.
I thought about having 2 Cloud Networks one lb-network for the master nodes and the load balancer and a second one cluster network for the master and worker nodes. But with that approach every incoming traffic needs to get through the Masters to get terminated at the Ingress Controller which is running on the Worker, I like that approach because it allows me to use fewer targets on the Load Balancer to save some money also I could mostly isolate the workers from incoming traffic on a network level. Is that approach possible and even best practices or what do you recommend?&lt;/p&gt;</summary>
   </entry>
   <entry>
      <id>https://stackoverflow.com/q/77635466</id>
      <re:rank scheme="https://stackoverflow.com">0</re:rank>
      <title type="text">Application (valhalla-server) not running (or accessible) )when exposed through clusterIP or NodePort service</title>
      <category scheme="https://stackoverflow.com/tags" term="kubernetes" />
      <category scheme="https://stackoverflow.com/tags" term="amazon-eks" />
      <category scheme="https://stackoverflow.com/tags" term="project-valhalla" />
      <author>
         <name>kubexplore</name>
         <uri>https://stackoverflow.com/users/23076494</uri>
      </author>
      <link rel="alternate" href="https://stackoverflow.com/questions/77635466/application-valhalla-server-not-running-or-accessible-when-exposed-through" />
      <published>2023-12-10T16:07:16Z</published>
      <updated>2023-12-10T16:33:29Z</updated>
      <summary type="html">&lt;p&gt;I have created a pod to deploy valhalla-server, yaml below:&lt;/p&gt;
&lt;pre&gt;&lt;code&gt;apiVersion: v1
kind: Pod
metadata:
  name: valahalla-pod
  labels:
    app: valahalla-app-pod  # Updated label name
spec:
  containers:
  - name: docker-valahalla
    image: ghcr.io/gis-ops/docker-valhalla/valhalla
    env:
      - name: tile_urls
        value: &amp;quot;https://download.geofabrik.de/europe/andorra-latest.osm.pbf ghcr.io/gis-ops/docker-valhalla/valhalla:latest&amp;quot;
    ports:
    - containerPort: 8002
    volumeMounts:
    - name: my-local-folder
      mountPath: /custom_files
  volumes:
  - name: my-local-folder
    hostPath:
      path: /home/ubuntu/custom_files
&lt;/code&gt;&lt;/pre&gt;
&lt;p&gt;When I exec into this pod, I am able to access the valhalla server on localhost on port 8002. But I have created a service for the pod, yaml below:&lt;/p&gt;
&lt;pre&gt;&lt;code&gt;apiVersion: v1
kind: Service
metadata:
  name: valahalla-service
spec:
  selector:
    app: valahalla-app-pod
  ports:
    - protocol: TCP
      port: 80  # Port exposed by the service
      targetPort: 8002
  type: NodePort
&lt;/code&gt;&lt;/pre&gt;
&lt;p&gt;I am not able to access my application through this! It gives output when I curl by going into the pod but not when I try to access it from outisde.&lt;/p&gt;
&lt;p&gt;I am using EKS on AWS for this.&lt;/p&gt;
&lt;p&gt;I was using deployment before, I've tried using pod instead and changed service from clusterIP to NodePort.&lt;/p&gt;</summary>
   </entry>
</feed>`;

Deno.test('getStackoverflowFeed', async () => {
  const fetchWithTimeoutSpy = stub(
    utils,
    'fetchWithTimeout',
    returnsNext([
      new Promise((resolve) => {
        resolve(new Response(responseTag, { status: 200 }));
      }),
    ]),
  );

  try {
    const { source, items } = await getStackoverflowFeed(
      supabaseClient,
      undefined,
      mockProfile,
      {
        ...mockSource,
        options: {
          stackoverflow: { type: 'tag', tag: 'kubernetes', sort: 'newest' },
        },
      },
    );
    feedutils.assertEqualsSource(source, {
      'id': 'stackoverflow-myuser-mycolumn-b33aefc859cbc9c75f22dc8de83b59e7',
      'columnId': 'mycolumn',
      'userId': 'myuser',
      'type': 'stackoverflow',
      'title': 'Newest questions tagged kubernetes - Stack Overflow',
      'options': {
        'stackoverflow': {
          'type': 'tag',
          'tag': 'kubernetes',
          'sort': 'newest',
          'url':
            'https://stackoverflow.com/feeds/tag?tagnames=kubernetes&sort=newest',
        },
      },
      'link':
        'https://stackoverflow.com/feeds/tag?tagnames=kubernetes&sort=newest',
    });
    feedutils.assertEqualsItems(items, [{
      'id':
        'stackoverflow-myuser-mycolumn-b33aefc859cbc9c75f22dc8de83b59e7-4ccc40394df08fa6092fa370ad44fa79',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId':
        'stackoverflow-myuser-mycolumn-b33aefc859cbc9c75f22dc8de83b59e7',
      'title': 'Kubernetes Ingress behind Cloud Load Balancer',
      'link':
        'https://stackoverflow.com/questions/77635559/kubernetes-ingress-behind-cloud-load-balancer',
      'description':
        '<p>When using an Ingress Controller in Kubernetes the Ingress service is usually exposed via Load Balancer. Now I’m trining to understand on how this exactly works.\nAs I understand it the Ingress Controller is just running as an Pod like any other app and gets exposed via the Load Balancer.\nWhen configuring the external load balancer what target do I set, the Worker nodes or the master nodes, or does this even matter because I use a Service and then it’s automatically internally Load balanced?</p>\n<p>I try to get this Right so I can setup a Kubernetes Cluster in the Hetzner Cloud, because it has no managed service I need to do basically everything on my on but it provides the services to theoretically host a full HA cluster.\nSo the plan is to have for the beginning 3 Master Nodes and 2/3 Worker Nodes and an Managed Load Balancer in front of everything.\nI thought about having 2 Cloud Networks one lb-network for the master nodes and the load balancer and a second one cluster network for the master and worker nodes. But with that approach every incoming traffic needs to get through the Masters to get terminated at the Ingress Controller which is running on the Worker, I like that approach because it allows me to use fewer targets on the Load Balancer to save some money also I could mostly isolate the workers from incoming traffic on a network level. Is that approach possible and even best practices or what do you recommend?</p>',
      'publishedAt': 1702226384,
    }, {
      'id':
        'stackoverflow-myuser-mycolumn-b33aefc859cbc9c75f22dc8de83b59e7-6f932d7a7105a5e38fa70de9bbad6fe5',
      'userId': 'myuser',
      'columnId': 'mycolumn',
      'sourceId':
        'stackoverflow-myuser-mycolumn-b33aefc859cbc9c75f22dc8de83b59e7',
      'title':
        'Application (valhalla-server) not running (or accessible) )when exposed through clusterIP or NodePort service',
      'link':
        'https://stackoverflow.com/questions/77635466/application-valhalla-server-not-running-or-accessible-when-exposed-through',
      'description':
        '<p>I have created a pod to deploy valhalla-server, yaml below:</p>\n<pre><code>apiVersion: v1\nkind: Pod\nmetadata:\n  name: valahalla-pod\n  labels:\n    app: valahalla-app-pod  # Updated label name\nspec:\n  containers:\n  - name: docker-valahalla\n    image: ghcr.io/gis-ops/docker-valhalla/valhalla\n    env:\n      - name: tile_urls\n        value: "https://download.geofabrik.de/europe/andorra-latest.osm.pbf ghcr.io/gis-ops/docker-valhalla/valhalla:latest"\n    ports:\n    - containerPort: 8002\n    volumeMounts:\n    - name: my-local-folder\n      mountPath: /custom_files\n  volumes:\n  - name: my-local-folder\n    hostPath:\n      path: /home/ubuntu/custom_files\n</code></pre>\n<p>When I exec into this pod, I am able to access the valhalla server on localhost on port 8002. But I have created a service for the pod, yaml below:</p>\n<pre><code>apiVersion: v1\nkind: Service\nmetadata:\n  name: valahalla-service\nspec:\n  selector:\n    app: valahalla-app-pod\n  ports:\n    - protocol: TCP\n      port: 80  # Port exposed by the service\n      targetPort: 8002\n  type: NodePort\n</code></pre>\n<p>I am not able to access my application through this! It gives output when I curl by going into the pod but not when I try to access it from outisde.</p>\n<p>I am using EKS on AWS for this.</p>\n<p>I was using deployment before, I\'ve tried using pod instead and changed service from clusterIP to NodePort.</p>',
      'publishedAt': 1702224436,
    }]);
  } finally {
    fetchWithTimeoutSpy.restore();
  }

  assertSpyCall(fetchWithTimeoutSpy, 0, {
    args: [
      'https://stackoverflow.com/feeds/tag?tagnames=kubernetes&sort=newest',
      { method: 'get' },
      5000,
    ],
    returned: new Promise((resolve) => {
      resolve(new Response(responseTag, { status: 200 }));
    }),
  });
  assertSpyCalls(fetchWithTimeoutSpy, 1);
});
