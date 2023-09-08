import 'package:flutter/foundation.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:feeddeck/repositories/settings_repository.dart';

/// [FDImageType] is a enum value which defines the image type. An image can be
/// related to an item or a source.
enum FDImageType {
  item,
  source,
}

/// [getImageUrl] returns the correct image url to use for the provided image
/// url:
/// - If the [imageType] is [FDImageType.source] the image is always requested
///   from the Supabase storage.
/// - If the [imageType] is [FDImageType.item] and the app runs on the web, the
///   image is proxied through the Supabase functions.
/// - If the [imageType] is [FDImageType.item] and the app runs on a mobile or
///   desktop device, the image is requested directly from the provided url.
String getImageUrl(FDImageType imageType, String imageUrl) {
  if (imageType == FDImageType.source) {
    return '${SettingsRepository().supabaseUrl}/storage/v1/object/public/sources/$imageUrl';
  }

  if (kIsWeb) {
    return '${Supabase.instance.client.functionsUrl}/image-proxy-v1?media=${Uri.encodeQueryComponent(imageUrl)}';
  }

  return imageUrl;
}
