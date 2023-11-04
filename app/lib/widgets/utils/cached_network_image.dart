import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'package:cached_network_image/cached_network_image.dart' as cni;
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:feeddeck/repositories/settings_repository.dart';

/// [getImageUrl] returns the "correct" image url for the provided [imageUrl].
/// "Correct" means that depending on the provided [imageUrl] and the current
/// platform, the image url will be pointed to the Supabase storage or will be
/// proxied via the "image-proxy-v1" Supabase function.
String getImageUrl(String imageUrl) {
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    if (kIsWeb) {
      return '${Supabase.instance.client.functionsUrl}/image-proxy-v1?media=${Uri.encodeQueryComponent(imageUrl)}';
    }

    return imageUrl;
  }

  return '${SettingsRepository().supabaseUrl}/storage/v1/object/public/sources/$imageUrl';
}

/// The [CachedNetworkImage] is a wrapper around the [cni.CachedNetworkImage]
/// widget, which will automatically use the correct url to display the image,
/// via the [getImageUrl] function.
//
/// TODO: Once the media handling is changed everywhere, this is the place where
/// we want to add a custom cache handler, so that the images are only stored
/// for seven days to save storage space.
class CachedNetworkImage extends StatelessWidget {
  final String imageUrl;

  final double? width;
  final double? height;
  final BoxFit? fit;
  final Widget Function(BuildContext, String)? placeholder;
  final Widget Function(BuildContext, String, Object)? errorWidget;
  const CachedNetworkImage({
    super.key,
    required this.imageUrl,
    this.width,
    this.height,
    this.fit,
    this.placeholder,
    this.errorWidget,
  });

  @override
  Widget build(BuildContext context) {
    return cni.CachedNetworkImage(
      imageUrl: getImageUrl(imageUrl),
      width: width,
      height: height,
      fit: fit,
      placeholder: placeholder,
      errorWidget: errorWidget,
    );
  }
}
