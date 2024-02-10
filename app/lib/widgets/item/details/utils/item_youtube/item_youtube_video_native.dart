import 'package:flutter/material.dart';

import 'package:youtube_explode_dart/youtube_explode_dart.dart';

import 'package:feeddeck/widgets/item/details/utils/item_media.dart';
import 'package:feeddeck/widgets/item/details/utils/item_videos.dart';
import 'item_youtube_video.dart';

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
  late Future<List<ItemVideoQuality>> _futureFetchVideoUrls;

  Future<List<ItemVideoQuality>> _fetchVideoUrls() async {
    final streamManifest = await yt.videos.streamsClient.getManifest(
      widget.videoUrl,
    );
    return streamManifest.muxed
        .sortByVideoQuality()
        .map(
          (element) => ItemVideoQuality(
            quality: element.qualityLabel,
            video: element.url.toString(),
          ),
        )
        .toList();
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
        AsyncSnapshot<List<ItemVideoQuality>> snapshot,
      ) {
        if (snapshot.connectionState == ConnectionState.none ||
            snapshot.connectionState == ConnectionState.waiting ||
            snapshot.hasError ||
            snapshot.data == null ||
            snapshot.data!.isEmpty) {
          return ItemMedia(itemMedia: widget.imageUrl);
        }

        return ItemVideoPlayer(
          video: snapshot.data!.first.video,
          qualities: snapshot.data,
        );
      },
    );
  }
}

ItemYoutubeVideo getItemYoutubeVideo(String? imageUrl, String videoUrl) =>
    ItemYoutubeVideoNative(
      imageUrl: imageUrl,
      videoUrl: videoUrl,
    );
