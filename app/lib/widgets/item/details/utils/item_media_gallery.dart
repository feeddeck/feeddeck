import 'package:flutter/material.dart';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:carousel_slider/carousel_slider.dart';

import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/image_url.dart';
import 'package:feeddeck/widgets/item/details/utils/item_media.dart';

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

  /// [_buildSingleMedia] displays a single media file in the gallery. If the
  /// app runs on the web, we proxy the url through the Supabase functions.
  Widget _buildSingleMedia(BuildContext context, int itemMediaIndex) {
    final imageUrl = getImageUrl(FDImageType.item, itemMedias![itemMediaIndex]);

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            isDismissible: true,
            useSafeArea: true,
            backgroundColor: Colors.black,
            builder: (BuildContext context) {
              return ItemMediaGalleryModal(
                initialItemMediaIndex: itemMediaIndex,
                itemMedias: itemMedias,
              );
            },
          );
        },
        child: CachedNetworkImage(
          width: MediaQuery.of(context).size.width,
          fit: BoxFit.cover,
          imageUrl: imageUrl,
          placeholder: (context, url) => Container(),
          errorWidget: (context, url, error) => Container(),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (itemMedias == null || itemMedias!.isEmpty) {
      return Container();
    }

    switch (itemMedias!.length) {
      case 1:
        return _buildSingleMedia(context, 0);
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
                  child: _buildSingleMedia(context, 0),
                ),
                const VerticalDivider(
                  color: Constants.secondary,
                  width: 1.0,
                ),
                Expanded(
                  child: _buildSingleMedia(context, 1),
                )
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
                  child: _buildSingleMedia(context, 0),
                ),
                const VerticalDivider(
                  color: Constants.secondary,
                  width: 1.0,
                ),
                Expanded(
                  child: Column(
                    children: [
                      Expanded(
                        child: _buildSingleMedia(context, 1),
                      ),
                      const Divider(
                        color: Constants.secondary,
                        height: 1.0,
                      ),
                      Expanded(
                        child: _buildSingleMedia(context, 2),
                      )
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
          child: GridView.builder(
            physics: const NeverScrollableScrollPhysics(),
            shrinkWrap: true,
            itemCount: itemMedias!.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 1.0,
              crossAxisSpacing: 1.0,
              mainAxisSpacing: 1.0,
            ),
            itemBuilder: (BuildContext context, int index) {
              return _buildSingleMedia(context, index);
            },
          ),
        );
    }
  }
}

/// The [ItemMediaGalleryModal] widget is used to display the selected media
/// file in a modal. If the media gallery contains multiple media files, the
/// user can swipe through the media files.
class ItemMediaGalleryModal extends StatelessWidget {
  const ItemMediaGalleryModal({
    super.key,
    required this.initialItemMediaIndex,
    required this.itemMedias,
  });

  final int initialItemMediaIndex;
  final List<String>? itemMedias;

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          CarouselSlider(
            options: CarouselOptions(
              height: height,
              viewportFraction: 1.0,
              enlargeCenterPage: false,
              initialPage: initialItemMediaIndex,
            ),
            items: itemMedias!
                .map(
                  (itemMedia) => Center(
                    child: CachedNetworkImage(
                      fit: BoxFit.contain,
                      imageUrl: getImageUrl(FDImageType.item, itemMedia),
                      placeholder: (context, url) => Container(),
                      errorWidget: (context, url, error) => Container(),
                    ),
                  ),
                )
                .toList(),
          ),
          Positioned(
            top: Constants.spacingExtraSmall,
            right: Constants.spacingExtraSmall,
            child: IconButton(
              icon: const Icon(
                Icons.close,
              ),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ),
        ],
      ),
    );
  }
}
