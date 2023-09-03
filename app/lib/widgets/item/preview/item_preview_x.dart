import 'package:flutter/material.dart';

import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/widgets/item/preview/utils/details.dart';
import 'package:feeddeck/widgets/item/preview/utils/item_actions.dart';
import 'package:feeddeck/widgets/item/preview/utils/item_description.dart';
import 'package:feeddeck/widgets/item/preview/utils/item_media_gallery.dart';
import 'package:feeddeck/widgets/item/preview/utils/item_source.dart';

class ItemPreviewX extends StatelessWidget {
  const ItemPreviewX({
    super.key,
    required this.item,
    required this.source,
  });

  final FDItem item;
  final FDSource source;

  @override
  Widget build(BuildContext context) {
    return ItemActions(
      item: item,
      onTap: () => showDetails(context, item, source),
      children: [
        ItemSource(
          sourceTitle: item.author ?? '',
          sourceSubtitle: '${source.type.toLocalizedString()}: ${source.title}',
          sourceType: source.type,
          sourceIcon: source.icon,
          itemPublishedAt: item.publishedAt,
          itemIsRead: item.isRead,
        ),
        ItemDescription(
          itemDescription: item.description,
          sourceFormat: DescriptionFormat.html,
          tagetFormat: DescriptionFormat.markdown,
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
