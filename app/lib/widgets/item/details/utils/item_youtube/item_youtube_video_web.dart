import 'dart:html'; // ignore: avoid_web_libraries_in_flutter

import 'dart:ui' as ui;

import 'package:flutter/material.dart';

import 'package:feeddeck/utils/constants.dart';
import 'item_youtube_video.dart';

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
  final IFrameElement _iframeElement = IFrameElement();

  @override
  void initState() {
    super.initState();
    _iframeElement.src =
        'https://www.youtube-nocookie.com/embed/${widget.videoUrl.replaceFirst(
      'https://www.youtube.com/watch?v=',
      '',
    )}';
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
      padding: const EdgeInsets.only(
        bottom: Constants.spacingMiddle,
      ),
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
    ItemYoutubeVideoWeb(
      imageUrl: imageUrl,
      videoUrl: videoUrl,
    );
