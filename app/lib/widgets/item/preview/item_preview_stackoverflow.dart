import 'package:flutter/material.dart';

import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/widgets/item/preview/utils/details.dart';
import 'package:feeddeck/widgets/item/preview/utils/item_actions.dart';
import 'package:feeddeck/widgets/item/preview/utils/item_description.dart';
import 'package:feeddeck/widgets/item/preview/utils/item_media.dart';
import 'package:feeddeck/widgets/item/preview/utils/item_source.dart';
import 'package:feeddeck/widgets/item/preview/utils/item_title.dart';

class ItemPreviewStackoverflow extends StatelessWidget {
  const ItemPreviewStackoverflow({
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
          sourceTitle: source.title,
          sourceSubtitle: source.type.toLocalizedString(),
          sourceType: source.type,
          sourceIcon: source.icon,
          itemPublishedAt: item.publishedAt,
          itemIsRead: item.isRead,
        ),
        ItemTitle(
          itemTitle: item.title,
        ),
        ItemMedia(
          itemMedia: item.media,
        ),
        ItemDescription(
          itemDescription: item.description,
          sourceFormat: DescriptionFormat.html,
          tagetFormat: DescriptionFormat.plain,
        ),
      ],
    );
  }
}
