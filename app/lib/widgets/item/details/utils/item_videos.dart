import 'package:flutter/material.dart';

import 'package:media_kit/media_kit.dart';
import 'package:media_kit_video/media_kit_video.dart';

import 'package:feeddeck/utils/constants.dart';

/// The [ItemVideos] widget is used to display a list of videos, which can be
/// played by the user. If the [videos] list is empty or null, the widget will
/// not be displayed.
class ItemVideos extends StatelessWidget {
  const ItemVideos({
    super.key,
    required this.videos,
  });

  final List<String>? videos;

  @override
  Widget build(BuildContext context) {
    if (videos == null || videos!.isEmpty) {
      return Container();
    }

    return Container(
      padding: const EdgeInsets.only(
        bottom: Constants.spacingMiddle,
      ),
      child: ListView.separated(
        shrinkWrap: true,
        separatorBuilder: (context, index) {
          return const SizedBox(
            height: Constants.spacingMiddle,
          );
        },
        itemCount: videos!.length,
        itemBuilder: (context, index) {
          return ItemVideoPlayer(video: videos![index]);
        },
      ),
    );
  }
}

/// The [ItemVideoPlayer] widget is used to display a video, which can be played
/// by the user. It should be used in combination with the [ItemVideos] widget
/// and is responsible for the actual implementation of the video player.
class ItemVideoPlayer extends StatefulWidget {
  const ItemVideoPlayer({
    super.key,
    required this.video,
  });

  final String video;

  @override
  State<ItemVideoPlayer> createState() => _ItemVideoPlayerState();
}

class _ItemVideoPlayerState extends State<ItemVideoPlayer> {
  late final player = Player();
  late final controller = VideoController(player);

  @override
  void initState() {
    super.initState();
    player.open(
      Media(widget.video),
      play: false,
    );
  }

  @override
  void dispose() {
    player.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Center(
          child: SizedBox(
            width: constraints.maxWidth,
            height: constraints.maxWidth * 9.0 / 16.0,
            child: Video(controller: controller),
          ),
        );
      },
    );
  }
}
