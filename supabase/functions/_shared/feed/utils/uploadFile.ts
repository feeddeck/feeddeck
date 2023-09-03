import { SupabaseClient } from "@supabase/supabase-js";

import { ISource } from "../../models/source.ts";
import { IItem } from "../../models/item.ts";
import { fetchWithTimeout } from "../../utils/fetchWithTimeout.ts";
import { log } from "../../utils/log.ts";

/**
 * `uploadSourceIcon` uploads the `icon` of the provided `source` to the Supabase storage, to avoid CORS issues within
 * our web app and to make use of the built-in CDN. If the upload was successfull the path of the uploaded icon is
 * returned. If the upload failed `undefined` is returned.
 */
export const uploadSourceIcon = async (
  supabaseClient: SupabaseClient,
  source: ISource,
): Promise<string | undefined> => {
  if (!source.icon || source.icon === "") {
    return undefined;
  }

  return await uploadFile(
    supabaseClient,
    "sources",
    source.icon,
    `${source.userId}/${source.id}.${source.icon.split(".").pop()}`,
  );
};

/**
 * `uploadItemMedia` uploads the `media` of the provided `item` to the Supabase storage, to avoid CORS issues within our
 * web app and to make use of the built-in CDN. If the upload was successfull the path of the uploaded media is
 * returned. If the upload failed `undefined` is returned.
 */
export const uploadItemMedia = async (
  supabaseClient: SupabaseClient,
  item: IItem,
): Promise<string | undefined> => {
  if (!item.media || item.media === "") {
    return undefined;
  }

  return await uploadFile(
    supabaseClient,
    "items",
    item.media,
    `${item.userId}/${item.sourceId}/${item.id}.${item.media.split(".").pop()}`,
  );
};

/**
 * `uploadFile` uploads the provided file via it's `sourcePath` to the `targetPath` within the provided `bucket`. For
 * this we have to fetch the file first and then upload it to the Supabase storage.
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
      { method: "get" },
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
      log("error", "Failed to upload source icon", {
        "error": uploadError,
      });
      return undefined;
    }

    return uploadData?.path;
  } catch (err) {
    log("error", "Failed to upload source icon", { "error": err.toString() });
    return undefined;
  }
};
