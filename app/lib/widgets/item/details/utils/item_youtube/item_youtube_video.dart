library item_youtube_video;

import 'package:flutter/material.dart';

import 'item_youtube_video_stub.dart'
    if (dart.library.io) 'item_youtube_video_native.dart'
    if (dart.library.html) 'item_youtube_video_web.dart';

/// The [ItemYoutubeVideo] class implements a widget that displays a video from
/// YouTube.
///
/// This is required because we are using different implementations for the web
/// and for all other target platforms (Android, iOS, macOS, Windows, Linux). On
/// the web we display the YouTube video via an `iframe` element. On all other
/// platforms we are using the [youtube_explode_dart] package to fetch the url
/// of the YouTube video, which can then be displayed via our [ItemVideoPlayer]
/// widget.
///
/// We decided for this implementation, because on the web we would have to
/// proxy the calls from the [youtube_explode_dart] because of CORS errors.
/// Further with the former implementation via the [youtube_player_iframe]
/// package we were not able to display the video on macOS, Windows and Linux
/// and we were not able to display the video in fullscreen.
abstract class ItemYoutubeVideo implements StatefulWidget {
  factory ItemYoutubeVideo(String? imageUrl, String videoUrl) =>
      getItemYoutubeVideo(imageUrl, videoUrl);
}
