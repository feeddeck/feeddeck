import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:feeddeck/repositories/settings_repository.dart';
import 'package:feeddeck/utils/constants.dart';

/// The [ItemMedia] widget displays the media of an item. Based on the provided
/// [itemMedia] value the media is displayed from the Supabase storage or
/// directly from the provided url.
class ItemMedia extends StatelessWidget {
  const ItemMedia({
    super.key,
    required this.itemMedia,
  });

  final String? itemMedia;

  @override
  Widget build(BuildContext context) {
    if (itemMedia == null || itemMedia == '') {
      return Container();
    }

    /// [itemMedia] is the url to the image of the an item. If the url does not
    /// start with `https://` it is assumed that the image is stored in the
    /// Supabase storage and the url is generated accordingly. If the app is
    /// running in the web, the url is proxied through the Supabase functions.
    String imageUrl = itemMedia!;
    if (!imageUrl.startsWith('https://')) {
      imageUrl =
          '${SettingsRepository().supabaseUrl}/storage/v1/object/public/items/$imageUrl';
    } else if (kIsWeb) {
      imageUrl =
          '${Supabase.instance.client.functionsUrl}/image-proxy-v1?media=${Uri.encodeQueryComponent(imageUrl)}';
    }

    return Container(
      padding: const EdgeInsets.only(
        bottom: Constants.spacingExtraSmall,
      ),
      child: CachedNetworkImage(
        width: double.infinity,
        height: 200,
        fit: BoxFit.cover,
        imageUrl: imageUrl,
        placeholder: (context, url) => Container(),
        errorWidget: (context, url, error) => Container(),
      ),
    );
  }
}
