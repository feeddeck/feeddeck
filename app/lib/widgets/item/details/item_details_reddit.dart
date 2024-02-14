import 'package:flutter/material.dart';

import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/widgets/item/details/utils/item_description.dart';
import 'package:feeddeck/widgets/item/details/utils/item_piped/item_piped_video.dart';
import 'package:feeddeck/widgets/item/details/utils/item_subtitle.dart';
import 'package:feeddeck/widgets/item/details/utils/item_title.dart';
import 'package:feeddeck/widgets/item/details/utils/item_youtube/item_youtube_video.dart';

class ItemDetailsReddit extends StatelessWidget {
  const ItemDetailsReddit({
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

  /// [_getPipedUrl] returns a Piped url when the provided [description]
  /// contains a Piped link. If the [description] does not contain a Piped link,
  /// the function returns `null`.
  String? _getPipedUrl(String description) {
    final exp = RegExp(r'(?:(?:https?|ftp):\/\/)?[\w/\-?=%.]+\.[\w/\-?=%.]+');
    final matches = exp.allMatches(description);

    for (var match in matches) {
      final url = description.substring(match.start, match.end);
      if (url.startsWith('https://piped.video/watch?v=') ||
          url.startsWith('https://piped.video/')) {
        return url;
      }
    }

    return null;
  }

  /// [_buildDescription] builds the description widget for the item. If the
  /// description contains a YouTube link, we render the [ItemYoutubeVideo]
  /// and the [ItemDescription] widgets. If the description contains a Piped
  /// link, we render the [ItemPipedVideo] and the [ItemDescription] widget. If
  /// the description does not contain a YouTube or Piped link, we only render
  /// the [ItemDescription] widget.
  ///
  /// If the description containes a YouTube link we also have to disable the
  /// rendering of images within the [ItemDescription] widget.
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

    final pipedUrl =
        item.description != null ? _getPipedUrl(item.description!) : null;

    if (pipedUrl != null) {
      return [
        ItemPipedVideo(
          item.media,
          pipedUrl,
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
      ),
    ];
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
        ..._buildDescription(),
      ],
    );
  }
}
