import 'package:flutter/material.dart';

import 'item_piped_video_stub.dart'
    if (dart.library.io) 'item_piped_video_native.dart'
    if (dart.library.html) 'item_piped_video_web.dart';

/// The [ItemPipedVideo] class implements a widget that displays a video from
/// Piped.
///
/// This is required because we are using different implementations for the web
/// and for all other target platforms (Android, iOS, macOS, Windows, Linux). On
/// the web we display the Piped video via an `iframe` element. On all other
/// platforms we are using the [piped_client] package to fetch the url of the
/// Piped video, which can then be displayed via our [ItemVideoPlayer] widget.
abstract class ItemPipedVideo implements StatefulWidget {
  factory ItemPipedVideo(String? imageUrl, String videoUrl) =>
      getItemPipedVideo(imageUrl, videoUrl);
}
