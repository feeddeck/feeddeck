import 'package:web/web.dart';

import 'dart:ui' as ui;

import 'package:flutter/material.dart';

import 'package:feeddeck/utils/constants.dart';
import 'item_youtube_video.dart';

/// [_convertVideoUrl] converts the video url to a format that can be used to
/// embed the video in an iframe.
String _convertVideoUrl(String videoUrl) {
  if (videoUrl.startsWith('https://youtu.be/')) {
    return videoUrl.replaceFirst(
      'https://youtu.be/',
      'https://www.youtube-nocookie.com/embed/',
    );
  }

  if (videoUrl.startsWith('https://www.youtube.com/watch?v=')) {
    return 'https://www.youtube-nocookie.com/embed/${videoUrl.replaceFirst('https://www.youtube.com/watch?v=', '')}';
  }

  if (videoUrl.startsWith('https://m.youtube.com/watch?v=')) {
    return 'https://www.youtube-nocookie.com/embed/${videoUrl.replaceFirst('https://m.youtube.com/watch?v=', '')}';
  }

  return videoUrl;
}

class ItemYoutubeVideoWeb extends StatefulWidget implements ItemYoutubeVideo {
  const ItemYoutubeVideoWeb({
    super.key,
    required this.imageUrl,
    required this.videoUrl,
  });

  final String? imageUrl;
  final String videoUrl;

  @override
  State<ItemYoutubeVideoWeb> createState() => _ItemYoutubeVideoWebState();
}

class _ItemYoutubeVideoWebState extends State<ItemYoutubeVideoWeb> {
  final HTMLIFrameElement _iframeElement = HTMLIFrameElement();

  @override
  void initState() {
    super.initState();

    _iframeElement.src = _convertVideoUrl(widget.videoUrl);
    _iframeElement.style.border = 'none';
    _iframeElement.allowFullscreen = true;

    // ignore: undefined_prefixed_name
    ui.platformViewRegistry.registerViewFactory(
      widget.videoUrl,
      (int viewId) => _iframeElement,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(bottom: Constants.spacingMiddle),
      child: LayoutBuilder(
        builder: (context, constraints) {
          return Center(
            child: SizedBox(
              width: constraints.maxWidth,
              height: constraints.maxWidth * 9.0 / 16.0,
              child: HtmlElementView(
                key: Key(widget.videoUrl),
                viewType: widget.videoUrl,
              ),
            ),
          );
        },
      ),
    );
  }
}

ItemYoutubeVideo getItemYoutubeVideo(String? imageUrl, String videoUrl) =>
    ItemYoutubeVideoWeb(imageUrl: imageUrl, videoUrl: videoUrl);
