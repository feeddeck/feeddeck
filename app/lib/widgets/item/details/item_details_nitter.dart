import 'package:flutter/material.dart';

import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/item/details/utils/item_description.dart';
import 'package:feeddeck/widgets/item/details/utils/item_media_gallery.dart';
import 'package:feeddeck/widgets/item/details/utils/item_piped/item_piped_video.dart';
import 'package:feeddeck/widgets/item/details/utils/item_subtitle.dart';

class ItemDetailsNitter extends StatelessWidget {
  const ItemDetailsNitter({
    super.key,
    required this.item,
    required this.source,
  });

  final FDItem item;
  final FDSource source;

  /// [_getPipedUrl] returns a Piped url when the provided [description]
  /// contains a Piped link. If the [description] does not contain a Piped link,
  /// the function returns `null`.
  String? _getPipedUrl(String description) {
    final exp = RegExp(r'(?:(?:https?|ftp):\/\/)?[\w/\-?=%.]+\.[\w/\-?=%.]+');
    final matches = exp.allMatches(description);

    for (var match in matches) {
      final url = description.substring(match.start, match.end);
      if (url.startsWith('https://piped.video/watch?v=') ||
          url.startsWith('https://piped.video/')) {
        return url;
      }
    }

    return null;
  }

  /// [_buildDescription] builds the description widget for the item. If the
  /// description contains a Piped link, we render the [ItemPipedVideo] and the
  /// [ItemDescription] widgets. If the description does not contain a Piped
  /// link, we render the [ItemDescription] and [ItemMediaGallery] widget.
  List<Widget> _buildDescription() {
    final pipedUrl =
        item.description != null ? _getPipedUrl(item.description!) : null;

    if (pipedUrl != null) {
      return [
        ItemPipedVideo(
          item.media,
          pipedUrl,
        ),
        ItemDescription(
          itemDescription: item.description,
          sourceFormat: DescriptionFormat.html,
          tagetFormat: DescriptionFormat.markdown,
          disableImages: true,
        ),
      ];
    }

    return [
      ItemDescription(
        itemDescription: item.description,
        sourceFormat: DescriptionFormat.html,
        tagetFormat: DescriptionFormat.markdown,
        disableImages: true,
      ),
      const SizedBox(
        height: Constants.spacingExtraSmall,
      ),
      ItemMediaGallery(
        itemMedias: item.options != null && item.options!.containsKey('media')
            ? (item.options!['media'] as List)
                .map((item) => item as String)
                .toList()
            : null,
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        ItemSubtitle(
          item: item,
          source: source,
        ),
        ..._buildDescription(),
      ],
    );
  }
}
