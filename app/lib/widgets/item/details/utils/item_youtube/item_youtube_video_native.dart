import 'package:flutter/material.dart';

import 'package:youtube_explode_dart/youtube_explode_dart.dart';

import 'package:feeddeck/widgets/item/details/utils/item_media.dart';
import 'package:feeddeck/widgets/item/details/utils/item_videos.dart';
import 'item_youtube_video.dart';

/// [FeFetchVideoUrlsResponse] is the model returned by the [_fetchVideoUrls]
/// function. It contains a list of [videos] and an optional [audio] file.
class FetchVideoUrlsResponse {
  const FetchVideoUrlsResponse({required this.videos, required this.audio});

  final List<ItemVideoQuality> videos;
  final String? audio;
}

class ItemYoutubeVideoNative extends StatefulWidget
    implements ItemYoutubeVideo {
  const ItemYoutubeVideoNative({
    super.key,
    required this.imageUrl,
    required this.videoUrl,
  });

  final String? imageUrl;
  final String videoUrl;

  @override
  State<ItemYoutubeVideoNative> createState() => _ItemYoutubeVideoNativeState();
}

class _ItemYoutubeVideoNativeState extends State<ItemYoutubeVideoNative> {
  final yt = YoutubeExplode();
  late Future<FetchVideoUrlsResponse> _futureFetchVideoUrls;

  /// [_fetchVideoUrls] fetches all video urls from YouTube via the
  /// [youtube_explode_dart] package. If the `muxed` field contains any items,
  /// we use them to return the video, because it contains the video and audio
  /// file. If the list is empty we use the `videoOnly` list to get the list of
  /// videos and the `audioOnly` field to get a corresponding audio track.
  Future<FetchVideoUrlsResponse> _fetchVideoUrls() async {
    final streamManifest = await yt.videos.streamsClient.getManifest(
      widget.videoUrl,
    );

    if (streamManifest.muxed.isNotEmpty) {
      return FetchVideoUrlsResponse(
        videos:
            streamManifest.video
                .sortByVideoQuality()
                .map(
                  (element) => ItemVideoQuality(
                    quality: element.qualityLabel,
                    video: element.url.toString(),
                  ),
                )
                .toList(),
        audio: null,
      );
    }

    return FetchVideoUrlsResponse(
      videos:
          streamManifest.videoOnly
              .sortByVideoQuality()
              .map(
                (element) => ItemVideoQuality(
                  quality: element.qualityLabel,
                  video: element.url.toString(),
                ),
              )
              .toList(),
      audio: streamManifest.audioOnly.sortByBitrate()[1].url.toString(),
    );
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    setState(() {
      _futureFetchVideoUrls = _fetchVideoUrls();
    });
  }

  @override
  void dispose() {
    yt.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: _futureFetchVideoUrls,
      builder: (
        BuildContext context,
        AsyncSnapshot<FetchVideoUrlsResponse> snapshot,
      ) {
        if (snapshot.connectionState == ConnectionState.none ||
            snapshot.connectionState == ConnectionState.waiting ||
            snapshot.hasError ||
            snapshot.data == null ||
            snapshot.data!.videos.isEmpty) {
          return ItemMedia(itemMedia: widget.imageUrl);
        }

        return ItemVideoPlayer(
          video: snapshot.data!.videos.first.video,
          audio: snapshot.data!.audio,
          qualities: snapshot.data!.videos,
        );
      },
    );
  }
}

ItemYoutubeVideo getItemYoutubeVideo(String? imageUrl, String videoUrl) =>
    ItemYoutubeVideoNative(imageUrl: imageUrl, videoUrl: videoUrl);
