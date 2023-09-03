import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'package:youtube_player_iframe/youtube_player_iframe.dart';

import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/item/details/utils/item_description.dart';
import 'package:feeddeck/widgets/item/details/utils/item_media.dart';
import 'package:feeddeck/widgets/item/details/utils/item_subtitle.dart';
import 'package:feeddeck/widgets/item/details/utils/item_title.dart';

class ItemDetailsYoutube extends StatelessWidget {
  const ItemDetailsYoutube({
    super.key,
    required this.item,
    required this.source,
  });

  final FDItem item;
  final FDSource source;

  /// [_buildMedia] returns the media element for the item. On the web we are
  /// using the [YoutubeVideo] widget to render the video, so that a user can
  /// directly play the YouTube video. On all other platforms we display the
  /// thumbnail of the video.
  Widget _buildMedia() {
    if (kIsWeb || Platform.isAndroid || Platform.isIOS) {
      return YoutubeVideo(
        videoUrl: item.link,
      );
    }

    return ItemMedia(
      itemMedia: item.media,
    );
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
          sourceFormat: DescriptionFormat.plain,
          tagetFormat: DescriptionFormat.plain,
        ),
      ],
    );
  }
}

class YoutubeVideo extends StatefulWidget {
  const YoutubeVideo({
    super.key,
    required this.videoUrl,
  });

  final String videoUrl;

  @override
  State<YoutubeVideo> createState() => _YoutubeVideoState();
}

class _YoutubeVideoState extends State<YoutubeVideo> {
  late YoutubePlayerController _controller;

  @override
  void initState() {
    super.initState();
    _controller = YoutubePlayerController(
      params: const YoutubePlayerParams(
        showControls: true,
        showFullscreenButton: false,
      ),
    );

    _controller.cueVideoByUrl(mediaContentUrl: widget.videoUrl);
    _controller.cueVideoById(
      videoId: widget.videoUrl.replaceFirst(
        'https://www.youtube.com/watch?v=',
        '',
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(
        bottom: Constants.spacingMiddle,
      ),
      child: YoutubePlayer(
        controller: _controller,
        aspectRatio: 16 / 9,
      ),
    );
  }
}
