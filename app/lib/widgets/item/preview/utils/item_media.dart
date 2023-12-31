import 'package:flutter/material.dart';

import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/utils/cached_network_image.dart';

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

    return Container(
      padding: const EdgeInsets.only(
        bottom: Constants.spacingExtraSmall,
      ),
      child: CachedNetworkImage(
        width: double.infinity,
        height: 200,
        fit: BoxFit.cover,
        imageUrl: itemMedia!,
        placeholder: (context, url) => Container(),
        errorWidget: (context, url, error) => Container(),
      ),
    );
  }
}
