import 'package:flutter/material.dart';

import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/item/details/utils/item_description.dart';
import 'package:feeddeck/widgets/item/details/utils/item_media_gallery.dart';
import 'package:feeddeck/widgets/item/details/utils/item_subtitle.dart';

class ItemDetailsX extends StatelessWidget {
  const ItemDetailsX({
    super.key,
    required this.item,
    required this.source,
  });

  final FDItem item;
  final FDSource source;

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
        ItemDescription(
          itemDescription: item.description,
          sourceFormat: DescriptionFormat.html,
          tagetFormat: DescriptionFormat.markdown,
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
      ],
    );
  }
}
