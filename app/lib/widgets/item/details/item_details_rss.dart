import 'package:flutter/material.dart';

import 'package:html/parser.dart' show parse;

import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/widgets/item/details/utils/item_description.dart';
import 'package:feeddeck/widgets/item/details/utils/item_media.dart';
import 'package:feeddeck/widgets/item/details/utils/item_subtitle.dart';
import 'package:feeddeck/widgets/item/details/utils/item_title.dart';

class ItemDetailsRSS extends StatelessWidget {
  const ItemDetailsRSS({
    super.key,
    required this.item,
    required this.source,
  });

  final FDItem item;
  final FDSource source;

  /// [_buildImage] renders the [item.media] when the [shouldBeRendered] is
  /// `true`. If it is `false` an empty container is returned.
  Widget _buildImage(bool shouldBeRendered) {
    if (!shouldBeRendered) {
      return Container();
    }

    return ItemMedia(
      itemMedia: item.media,
    );
  }

  @override
  Widget build(BuildContext context) {
    /// Check if the description of the RSS feed contains an image. If this is
    /// the case we do not render the image from the [item.media] because the
    /// image is already rendered in the [ItemDescription] widget.
    final descriptionContainImage =
        parse(item.description).querySelectorAll('img').isNotEmpty;

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
        _buildImage(!descriptionContainImage),
        ItemDescription(
          itemDescription: item.description,
          sourceFormat: DescriptionFormat.html,
          tagetFormat: DescriptionFormat.markdown,
        ),
      ],
    );
  }
}
