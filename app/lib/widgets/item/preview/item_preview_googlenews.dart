import 'package:flutter/material.dart';

import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/utils/image_url.dart';
import 'package:feeddeck/widgets/item/preview/utils/details.dart';
import 'package:feeddeck/widgets/item/preview/utils/item_actions.dart';
import 'package:feeddeck/widgets/item/preview/utils/item_description.dart';
import 'package:feeddeck/widgets/item/preview/utils/item_source.dart';
import 'package:feeddeck/widgets/item/preview/utils/item_title.dart';

class ItemPreviewGooglenews extends StatelessWidget {
  const ItemPreviewGooglenews({
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
      onTap: () => openDetails(context, item),
      children: [
        ItemSource(
          sourceTitle: item.author ?? '',
          sourceSubtitle: '${source.type.toLocalizedString()}: ${source.title}',
          sourceType: source.type,
          sourceIcon: item.media,
          sourceIconType: FDImageType.item,
          itemPublishedAt: item.publishedAt,
          itemIsRead: item.isRead,
        ),
        ItemTitle(
          itemTitle: item.title,
        ),
        ItemDescription(
          itemDescription: item.description,
          sourceFormat: DescriptionFormat.html,
          tagetFormat: DescriptionFormat.markdown,
        ),
      ],
    );
  }
}
