import 'package:flutter/material.dart';

import 'package:just_audio/just_audio.dart';

import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/item/details/utils/item_audio_palyer/item_audio_player_utils.dart';

/// The [ItemAudioPlayerControlButtons] widget provides all the basic controls
/// for our audio player, these are a play / pause button and a slider to set
/// the volume / speed for the played audio file.
class ItemAudioPlayerControlButtons extends StatelessWidget {
  const ItemAudioPlayerControlButtons({
    super.key,
    required this.player,
  });

  final AudioPlayer player;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        /// Open a slider dialog via the [showSliderDialog] function to adjust
        /// the volume of the played audio file.
        Padding(
          padding: const EdgeInsets.only(right: Constants.spacingSmall),
          child: IconButton(
            icon: const Icon(Icons.volume_up),
            onPressed: () {
              showSliderDialog(
                context: context,
                title: 'Volume',
                divisions: 10,
                min: 0.0,
                max: 1.0,
                value: player.volume,
                stream: player.volumeStream,
                onChanged: player.setVolume,
              );
            },
          ),
        ),

        /// Display a replay button to replay the last 10 seconds in the
        /// currently playing audio file.
        ///
        /// NOTE: We do not use the same interval for replay and forward,
        /// because these values are taken from the Apple Podcast app, which is
        /// also using 30 seconds for forward and 10 seonds for replay.
        IconButton(
          icon: const Icon(
            Icons.replay_10,
            size: 32.0,
          ),
          onPressed: () =>
              player.seek(player.position - const Duration(seconds: 10)),
        ),

        /// This StreamBuilder rebuilds whenever the player state changes, which
        /// includes the playing / paused state and also the loading / buffering
        /// / ready state. Depending on the state we show the appropriate button
        /// or a loading indicator.
        StreamBuilder<PlayerState>(
          stream: player.playerStateStream,
          builder: (context, snapshot) {
            final playerState = snapshot.data;
            final processingState = playerState?.processingState;
            final playing = playerState?.playing;
            if (processingState == ProcessingState.loading ||
                processingState == ProcessingState.buffering) {
              return Container(
                margin: const EdgeInsets.all(Constants.spacingSmall),
                width: 48.0,
                height: 48.0,
                child: const CircularProgressIndicator(),
              );
            } else if (playing != true) {
              return IconButton(
                icon: const Icon(Icons.play_arrow),
                iconSize: 64.0,
                onPressed: player.play,
              );
            } else if (processingState != ProcessingState.completed) {
              return IconButton(
                icon: const Icon(Icons.pause),
                iconSize: 64.0,
                onPressed: player.pause,
              );
            } else {
              return IconButton(
                icon: const Icon(Icons.replay),
                iconSize: 64.0,
                onPressed: () => player.seek(Duration.zero),
              );
            }
          },
        ),

        /// Display a forward button to go 30 seonds forward in the currently
        /// playing audio file.
        IconButton(
          icon: const Icon(
            Icons.forward_30,
            size: 32.0,
          ),
          onPressed: () =>
              player.seek(player.position + const Duration(seconds: 30)),
        ),

        /// Open a slider dialog via the [showSliderDialog] function to adjust
        /// the speed of the played audio file.
        Padding(
          padding: const EdgeInsets.only(left: Constants.spacingSmall),
          child: StreamBuilder<double>(
            stream: player.speedStream,
            builder: (context, snapshot) => IconButton(
              icon: Text(
                '${snapshot.data?.toStringAsFixed(1)}x',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                ),
              ),
              onPressed: () {
                showSliderDialog(
                  context: context,
                  title: 'Speed',
                  divisions: 10,
                  min: 0.5,
                  max: 1.5,
                  value: player.speed,
                  stream: player.speedStream,
                  onChanged: player.setSpeed,
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}
