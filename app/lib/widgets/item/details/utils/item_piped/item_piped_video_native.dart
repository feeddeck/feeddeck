import 'package:flutter/material.dart';

import 'package:piped_client/piped_client.dart';

import 'package:feeddeck/widgets/item/details/utils/item_media.dart';
import 'package:feeddeck/widgets/item/details/utils/item_videos.dart';
import 'item_piped_video.dart';

/// The [ItemVideoQuality] class represents a list of video qualities for the
/// requested Piped video and the corresponding audio stream.
class ItemVideoQualitiesAndAudio {
  const ItemVideoQualitiesAndAudio({
    required this.qualities,
    required this.audio,
  });

  final List<ItemVideoQuality> qualities;
  final String audio;
}

/// [_getVideoId] returns the id of the provide video url, which can be used to
/// get the video streams via the Piped API.
String _getVideoId(String videoUrl) {
  if (videoUrl.startsWith('https://piped.video/watch?v=')) {
    return videoUrl.replaceFirst(
      'https://piped.video/watch?v=',
      '',
    );
  }

  if (videoUrl.startsWith('https://piped.video/')) {
    return videoUrl.replaceFirst(
      'https://piped.video/',
      '',
    );
  }

  return videoUrl;
}

class ItemPipedVideoNative extends StatefulWidget implements ItemPipedVideo {
  const ItemPipedVideoNative({
    super.key,
    required this.imageUrl,
    required this.videoUrl,
  });

  final String? imageUrl;
  final String videoUrl;

  @override
  State<ItemPipedVideoNative> createState() => _ItemPipedVideoNativeState();
}

class _ItemPipedVideoNativeState extends State<ItemPipedVideoNative> {
  final piped = PipedClient();
  late Future<ItemVideoQualitiesAndAudio> _futureFetchVideoAndAudioUrls;

  /// [_fetchVideoAndAudioUrls] fetches the video and audio urls for the
  /// requested Piped video. Since the video streams do not contain the audio
  /// stream, we have to fetch the audio stream separately.
  Future<ItemVideoQualitiesAndAudio> _fetchVideoAndAudioUrls() async {
    final streams = await piped.streams(_getVideoId(widget.videoUrl));

    return ItemVideoQualitiesAndAudio(
      qualities: streams.videoStreams
          .where(
            (element) =>
                element.mimeType == 'video/mp4' &&
                element.format == PipedVideoStreamFormat.mp4,
          )
          .map(
            (element) => ItemVideoQuality(
              quality: element.quality,
              video: element.url,
            ),
          )
          .toList(),
      audio: streams.audioStreams
          .where((element) => element.mimeType == 'audio/mp4')
          .map((element) => element.url)
          .first,
    );
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    setState(() {
      _futureFetchVideoAndAudioUrls = _fetchVideoAndAudioUrls();
    });
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: _futureFetchVideoAndAudioUrls,
      builder: (
        BuildContext context,
        AsyncSnapshot<ItemVideoQualitiesAndAudio> snapshot,
      ) {
        if (snapshot.connectionState == ConnectionState.none ||
            snapshot.connectionState == ConnectionState.waiting ||
            snapshot.hasError ||
            snapshot.data == null ||
            snapshot.data!.qualities.isEmpty ||
            snapshot.data!.audio.isEmpty) {
          return ItemMedia(itemMedia: widget.imageUrl);
        }

        return ItemVideoPlayer(
          video: snapshot.data!.qualities.first.video,
          audio: snapshot.data!.audio,
          qualities: snapshot.data!.qualities,
        );
      },
    );
  }
}

ItemPipedVideo getItemPipedVideo(String? imageUrl, String videoUrl) =>
    ItemPipedVideoNative(
      imageUrl: imageUrl,
      videoUrl: videoUrl,
    );
