import 'package:flutter/material.dart';

import 'package:html/parser.dart' show parse;

import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/widgets/item/details/utils/item_description.dart';
import 'package:feeddeck/widgets/item/details/utils/item_media.dart';
import 'package:feeddeck/widgets/item/details/utils/item_subtitle.dart';
import 'package:feeddeck/widgets/item/details/utils/item_title.dart';
import 'package:feeddeck/widgets/item/details/utils/item_videos.dart';

class ItemDetailsRSS extends StatelessWidget {
  const ItemDetailsRSS({
    super.key,
    required this.item,
    required this.source,
  });

  final FDItem item;
  final FDSource source;

  /// [_buildMedia] renders an image or video for the item. If the description
  /// of the item contains an image we do not render the image, because it could
  /// already be rendered via the description.
  ///
  /// Videos are currently always rendered, because they will not be rendered,
  /// by the [MarkdownBody] widget.
  Widget _buildMedia() {
    if (item.options != null &&
        item.options!.containsKey('video') &&
        item.options!['video'] != null) {
      return ItemVideos(videos: [item.options!['video']]);
    }

    /// Check if the description of the RSS feed contains an image. If this is
    /// the case we do not render the image from the [item.media] because the
    /// image is already rendered in the [ItemDescription] widget.
    if (parse(item.description).querySelectorAll('img').isNotEmpty) {
      return Container();
    }

    return ItemMedia(
      itemMedia: item.media,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        ItemTitle(
          itemTitle: item.title,
        ),
        ItemSubtitle(
          item: item,
          source: source,
        ),
        _buildMedia(),
        ItemDescription(
          itemDescription: item.description,
          sourceFormat: DescriptionFormat.html,
          tagetFormat: DescriptionFormat.markdown,
        ),
      ],
    );
  }
}
