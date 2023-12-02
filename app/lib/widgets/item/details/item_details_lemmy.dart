import 'package:flutter/material.dart';

import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/widgets/item/details/utils/item_description.dart';
import 'package:feeddeck/widgets/item/details/utils/item_media.dart';
import 'package:feeddeck/widgets/item/details/utils/item_subtitle.dart';
import 'package:feeddeck/widgets/item/details/utils/item_title.dart';
import 'package:feeddeck/widgets/item/details/utils/item_videos.dart';
import 'package:feeddeck/widgets/item/details/utils/item_youtube/item_youtube_video.dart';

class ItemDetailsLemmy extends StatelessWidget {
  const ItemDetailsLemmy({
    super.key,
    required this.item,
    required this.source,
  });

  final FDItem item;
  final FDSource source;

  /// [_buildMedia] builds the media widget for the item. The media widget can
  /// display an image, a video or y YouTube video.
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

      if (mediaUrl.path.endsWith('.mp4')) {
        return ItemVideoPlayer(
          video: item.media!,
        );
      }

      if (item.media!.startsWith('https://youtu.be/') ||
          item.media!.startsWith('https://www.youtube.com/watch?') ||
          item.media!.startsWith('https://m.youtube.com/watch?')) {
        return ItemYoutubeVideo(
          null,
          item.media!,
        );
      }
    }

    return Container();
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
