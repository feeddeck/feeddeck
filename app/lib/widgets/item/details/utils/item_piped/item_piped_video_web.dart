import 'dart:ui_web' as ui;

import 'package:flutter/material.dart';

import 'package:web/web.dart';

import 'package:feeddeck/utils/constants.dart';
import 'item_piped_video.dart';

/// [_convertVideoUrl] converts the video url to a format that can be used to
/// embed the video in an iframe.
String _convertVideoUrl(String videoUrl) {
  if (videoUrl.startsWith('https://piped.video/watch?v=')) {
    return videoUrl.replaceFirst(
      'https://piped.video/watch?v=',
      'https://piped.video/embed/',
    );
  }

  if (videoUrl.startsWith('https://piped.video/')) {
    return videoUrl.replaceFirst(
      'https://piped.video/',
      'https://piped.video/embed/',
    );
  }

  return videoUrl;
}

class ItemPipedVideoWeb extends StatefulWidget implements ItemPipedVideo {
  const ItemPipedVideoWeb({
    super.key,
    required this.imageUrl,
    required this.videoUrl,
  });

  final String? imageUrl;
  final String videoUrl;

  @override
  State<ItemPipedVideoWeb> createState() => _ItemPipedVideoWebState();
}

class _ItemPipedVideoWebState extends State<ItemPipedVideoWeb> {
  final HTMLIFrameElement _iframeElement = HTMLIFrameElement();

  @override
  void initState() {
    super.initState();

    _iframeElement.src = _convertVideoUrl(widget.videoUrl);
    _iframeElement.style.border = 'none';
    _iframeElement.allowFullscreen = true;

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

ItemPipedVideo getItemPipedVideo(String? imageUrl, String videoUrl) =>
    ItemPipedVideoWeb(imageUrl: imageUrl, videoUrl: videoUrl);
