import 'package:flutter/material.dart';

import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/widgets/item/details/utils/item_description.dart';
import 'package:feeddeck/widgets/item/details/utils/item_subtitle.dart';
import 'package:feeddeck/widgets/item/details/utils/item_title.dart';
import 'package:feeddeck/widgets/item/details/utils/item_youtube/item_youtube_video.dart';

class ItemDetailsYoutube extends StatelessWidget {
  const ItemDetailsYoutube({
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
        ItemTitle(
          itemTitle: item.title,
        ),
        ItemSubtitle(
          item: item,
          source: source,
        ),
        ItemYoutubeVideo(
          item.media,
          item.link,
        ),
        ItemDescription(
          itemDescription: item.description,
          sourceFormat: DescriptionFormat.plain,
          tagetFormat: DescriptionFormat.plain,
        ),
      ],
    );
  }
}
