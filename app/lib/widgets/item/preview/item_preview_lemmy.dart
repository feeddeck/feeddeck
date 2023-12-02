import 'package:flutter/material.dart';

import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/widgets/item/preview/utils/details.dart';
import 'package:feeddeck/widgets/item/preview/utils/item_actions.dart';
import 'package:feeddeck/widgets/item/preview/utils/item_description.dart';
import 'package:feeddeck/widgets/item/preview/utils/item_media.dart';
import 'package:feeddeck/widgets/item/preview/utils/item_source.dart';
import 'package:feeddeck/widgets/item/preview/utils/item_title.dart';

class ItemPreviewLemmy extends StatelessWidget {
  const ItemPreviewLemmy({
    super.key,
    required this.item,
    required this.source,
  });

  final FDItem item;
  final FDSource source;

  /// [_buildMedia] returns the media of the item if the item has media file.
  /// Since we save images and videos within the media property we have to
  /// filter out all videos.
  ///
  /// See the `getMedia` function in the `lemmy.ts` file, for a list of
  /// extension which are a image / video.
  Widget _buildMedia() {
    if (item.media != null && item.media! != '') {
      final mediaUrl = Uri.parse(item.media!);

      if (mediaUrl.path.endsWith('.jpg') ||
          mediaUrl.path.endsWith('.jpeg') ||
          mediaUrl.path.endsWith('.png') ||
          mediaUrl.path.endsWith('.gif')) {
        return ItemMedia(
          itemMedia: item.media,
        );
      }
    }

    return Container();
  }

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
        _buildMedia(),
        ItemDescription(
          itemDescription: item.description,
          sourceFormat: DescriptionFormat.html,
          tagetFormat: DescriptionFormat.plain,
        ),
      ],
    );
  }
}
