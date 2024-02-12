import { FEEDDECK_SUPABASE_SITE_URL } from '../_shared/utils/constants.ts';
import { log } from '../_shared/utils/log.ts';
import { fetchWithTimeout } from '../_shared/utils/fetchWithTimeout.ts';

const imageCorsHeaders = {
  'Access-Control-Allow-Origin': FEEDDECK_SUPABASE_SITE_URL,
  'Access-Control-Allow-Headers':
    'authorization,x-client-info,apikey,content-type',
};

/**
 * The `image-proxy-v1` edge function is used to proxy images from external
 * sources. This is required to avoid CORS errors in the web app.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: imageCorsHeaders });
  }

  try {
    const url = new URL(req.url);
    const media = url.searchParams.get('media');

    log('debug', 'Image request', { media: media });

    if (!media) {
      return new Response(
        JSON.stringify({ error: 'Failed to get "media" parameter' }),
        {
          headers: {
            ...imageCorsHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          status: 400,
        },
      );
    }

    let response = await fetchWithTimeout(media, { method: 'get' }, 5000);
    response = new Response(response.body, response);
    response.headers.set(
      'Access-Control-Allow-Origin',
      FEEDDECK_SUPABASE_SITE_URL,
    );
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000',
    );
    return response;
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: {
        ...imageCorsHeaders,
        'Content-Type': 'application/json; charset=utf-8',
      },
      status: 400,
    });
  }
});
