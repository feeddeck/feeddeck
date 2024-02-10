import 'package:flutter/material.dart';

import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/item/details/utils/item_description.dart';
import 'package:feeddeck/widgets/item/details/utils/item_media_gallery.dart';
import 'package:feeddeck/widgets/item/details/utils/item_subtitle.dart';
import 'package:feeddeck/widgets/item/details/utils/item_videos.dart';
import 'package:feeddeck/widgets/item/details/utils/item_youtube/item_youtube_video.dart';

class ItemDetailsMastodon extends StatelessWidget {
  const ItemDetailsMastodon({
    super.key,
    required this.item,
    required this.source,
  });

  final FDItem item;
  final FDSource source;

  /// [_getYoutubeUrl] returns a YouTube url when the provided [description]
  /// contains a YouTube link. If the [description] does not contain a YouTube
  /// link, the function returns `null`.
  String? _getYoutubeUrl(String description) {
    final exp = RegExp(r'(?:(?:https?|ftp):\/\/)?[\w/\-?=%.]+\.[\w/\-?=%.]+');
    final matches = exp.allMatches(description);

    for (var match in matches) {
      final url = description.substring(match.start, match.end);
      if (url.startsWith('https://youtu.be/') ||
          url.startsWith('https://www.youtube.com/watch?') ||
          url.startsWith('https://m.youtube.com/watch?')) {
        return url;
      }
    }

    return null;
  }

  /// [_buildDescription] builds the description widget for the item. If the
  /// description contains a YouTube link, we render the [ItemYoutubeVideo]
  /// and the [ItemDescription] widgets. If the description does not contain a
  /// YouTube link, we render the [ItemDescription], [ItemMediaGallery] and
  /// [ItemVideos] widget.
  List<Widget> _buildDescription() {
    final youtubeUrl =
        item.description != null ? _getYoutubeUrl(item.description!) : null;

    if (youtubeUrl != null) {
      return [
        ItemYoutubeVideo(
          item.media,
          youtubeUrl,
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
        itemMedias: item.options != null &&
                item.options!.containsKey('media') &&
                item.options!['media'] != null
            ? (item.options!['media'] as List)
                .map((item) => item as String)
                .toList()
            : null,
      ),
      ItemVideos(
        videos: item.options != null &&
                item.options!.containsKey('videos') &&
                item.options!['videos'] != null
            ? (item.options!['videos'] as List)
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
