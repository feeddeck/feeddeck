import 'package:flutter/material.dart';

import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/item/details/utils/item_media.dart';
import 'package:feeddeck/widgets/utils/cached_network_image.dart';

/// The [ItemMediaGallery] widget can be used to display multiple media files in
/// a gallery. Similar to the [ItemMedia] widget the provided [itemMedias]
/// values can be displayed from the Supabase storage or directly from the
/// provided url.
class ItemMediaGallery extends StatelessWidget {
  const ItemMediaGallery({
    super.key,
    required this.itemMedias,
  });

  final List<String>? itemMedias;

  /// [_buildSingleMedia] displays a single media file in the gallery. Based on
  /// the provided [itemMedia] value the media file is displayed from the
  /// Supabase storage or directly from the provided url via the
  /// [CachedNetworkImage] widget. If the app is running in the web, the url is
  /// proxied through the Supabase functions.
  Widget _buildSingleMedia(BuildContext context, String itemMedia) {
    return CachedNetworkImage(
      width: MediaQuery.of(context).size.width,
      fit: BoxFit.cover,
      imageUrl: itemMedia,
      placeholder: (context, url) => Container(),
      errorWidget: (context, url, error) => Container(),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (itemMedias == null || itemMedias!.isEmpty) {
      return Container();
    }

    switch (itemMedias!.length) {
      case 1:
        return _buildSingleMedia(context, itemMedias![0]);
      case 2:
        return Container(
          padding: const EdgeInsets.only(
            bottom: Constants.spacingExtraSmall,
          ),
          child: AspectRatio(
            aspectRatio: 3.0 / 2.0,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(
                  child: _buildSingleMedia(context, itemMedias![0]),
                ),
                const VerticalDivider(
                  color: Constants.secondary,
                  width: 1.0,
                ),
                Expanded(
                  child: _buildSingleMedia(context, itemMedias![1]),
                ),
              ],
            ),
          ),
        );
      case 3:
        return Container(
          padding: const EdgeInsets.only(
            bottom: Constants.spacingExtraSmall,
          ),
          child: AspectRatio(
            aspectRatio: 3.0 / 2.0,
            child: Row(
              children: [
                Expanded(
                  child: _buildSingleMedia(context, itemMedias![0]),
                ),
                const VerticalDivider(
                  color: Constants.secondary,
                  width: 1.0,
                ),
                Expanded(
                  child: Column(
                    children: [
                      Expanded(
                        child: _buildSingleMedia(context, itemMedias![1]),
                      ),
                      const Divider(
                        color: Constants.secondary,
                        height: 1.0,
                      ),
                      Expanded(
                        child: _buildSingleMedia(context, itemMedias![2]),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      default:
        return Container(
          padding: const EdgeInsets.only(
            bottom: Constants.spacingExtraSmall,
          ),
          child: AspectRatio(
            aspectRatio: 1.0,
            child: GridView.builder(
              physics: const NeverScrollableScrollPhysics(),
              itemCount: 4,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 1.0,
                crossAxisSpacing: 1.0,
                mainAxisSpacing: 1.0,
              ),
              itemBuilder: (BuildContext context, int index) {
                return _buildSingleMedia(context, itemMedias![index]);
              },
            ),
          ),
        );
    }
  }
}
