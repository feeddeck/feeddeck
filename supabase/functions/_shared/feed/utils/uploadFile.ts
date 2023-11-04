import { SupabaseClient } from '@supabase/supabase-js';

import { ISource } from '../../models/source.ts';
import { fetchWithTimeout } from '../../utils/fetchWithTimeout.ts';
import { log } from '../../utils/log.ts';

/**
 * `uploadSourceIcon` uploads the `icon` of the provided `source` to the
 * Supabase storage, to avoid CORS issues within our web app and to make use of
 * the built-in CDN. If the upload was successfull the path of the uploaded icon
 * is returned. If the upload failed we return the original `icon` path, so that
 * we can still display the icon, from it's original source.
 */
export const uploadSourceIcon = async (
  supabaseClient: SupabaseClient,
  source: ISource,
): Promise<string | undefined> => {
  if (
    !source.icon || source.icon === '' || (!source.icon.startsWith('http://') &&
      !source.icon.startsWith('https://'))
  ) {
    return undefined;
  }

  try {
    const cdnIcon = await uploadFile(
      supabaseClient,
      'sources',
      source.icon,
      `${source.userId}/${source.id}.${source.icon.split('.').pop()}`,
    );

    if (cdnIcon) {
      return cdnIcon;
    }

    return source.icon;
  } catch (_) {
    return source.icon;
  }
};

/**
 * `uploadFile` uploads the provided file via it's `sourcePath` to the
 * `targetPath` within the provided `bucket`. For this we have to fetch the file
 * first and then upload it to the Supabase storage.
 */
const uploadFile = async (
  supabaseClient: SupabaseClient,
  bucket: string,
  sourcePath: string,
  targetPath: string,
): Promise<string | undefined> => {
  try {
    const fileResponse = await fetchWithTimeout(
      sourcePath,
      { method: 'get' },
      5000,
    );
    const file = await fileResponse.blob();

    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage.from(bucket)
      .upload(
        targetPath,
        file,
        {
          upsert: true,
        },
      );
    if (uploadError) {
      log('error', 'Failed to upload source icon', {
        'error': uploadError,
      });
      return undefined;
    }

    return uploadData?.path;
  } catch (err) {
    log('error', 'Failed to upload source icon', { 'error': err.toString() });
    return undefined;
  }
};
