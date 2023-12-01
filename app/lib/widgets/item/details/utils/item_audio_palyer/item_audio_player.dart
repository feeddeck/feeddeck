import 'package:flutter/material.dart';

import 'package:just_audio/just_audio.dart';
import 'package:just_audio_background/just_audio_background.dart';
import 'package:rxdart/rxdart.dart';

import 'package:feeddeck/widgets/item/details/utils/item_audio_palyer/item_audio_player_controlbuttons.dart';
import 'package:feeddeck/widgets/item/details/utils/item_audio_palyer/item_audio_player_seekbar.dart';
import 'package:feeddeck/widgets/item/details/utils/item_audio_palyer/item_audio_player_utils.dart';

/// The [ItemAudioPlayer] widget can be used to play an audio file within the
/// app. The returns audio player provides some basic interaction for playing
/// audio files, like a play / pause button, a seek bar and volume and speed
/// controlls.
class ItemAudioPlayer extends StatefulWidget {
  const ItemAudioPlayer({
    super.key,
    required this.audioId,
    required this.audioFile,
    required this.audioTitle,
    required this.audioArtist,
    required this.audioArt,
  });

  final String audioId;
  final String audioFile;
  final String audioTitle;
  final String audioArtist;
  final String? audioArt;

  @override
  State<ItemAudioPlayer> createState() => _ItemAudioPlayerState();
}

class _ItemAudioPlayerState extends State<ItemAudioPlayer> {
  final _player = AudioPlayer();

  /// [_init] initializes a new [_player] with the provided [widget.audioFile].
  /// We do not preload the audio file, until the user presses the play button
  /// in the [ItemAudioPlayerControlButtons] widget.
  Future<void> _init() async {
    try {
      await _player.setAudioSource(
        AudioSource.uri(
          Uri.parse(widget.audioFile),
          tag: MediaItem(
            id: widget.audioId,
            title: widget.audioTitle,
            artist: widget.audioArtist,
            artUri: widget.audioArt != null && widget.audioArt != ''
                ? Uri.parse(widget.audioArt!)
                : null,
          ),
        ),
        preload: false,
      );
    } catch (_) {}
  }

  @override
  void initState() {
    super.initState();
    _init();
  }

  @override
  void dispose() {
    /// We have to dispose the [_player] when the widget is disposed, otherwise
    /// the audio will continue to play in the background.
    ///
    /// On Linux and Windows the audio will continue to play even if the
    /// [_player] is disposed, so that we also call the `pause` method of the
    /// [_player] to stop the audio.
    _player.pause();
    _player.dispose();
    super.dispose();
  }

  /// [_positionDataStream] combines the 3 streams required for the
  /// [ItemAudioPlayerSeekBar] widget into one stream via the combine feature of
  /// rx_dart.
  ///
  /// The 3 streams of interest are the [_player.positionStream], the
  /// [_player.bufferedPositionStream] and the [_player.durationStream].
  Stream<PositionData> get _positionDataStream =>
      Rx.combineLatest3<Duration, Duration, Duration?, PositionData>(
        _player.positionStream,
        _player.bufferedPositionStream,
        _player.durationStream,
        (
          position,
          bufferedPosition,
          duration,
        ) =>
            PositionData(
          position,
          bufferedPosition,
          duration ?? Duration.zero,
        ),
      );

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        /// Display play / pause button and volume / speed sliders.
        ItemAudioPlayerControlButtons(player: _player),

        /// Display a seek bar. Using [StreamBuilder] this widget rebuilds each
        /// time the position, buffered position or duration changes.
        StreamBuilder<PositionData>(
          stream: _positionDataStream,
          builder: (context, snapshot) {
            final positionData = snapshot.data;
            return ItemAudioPlayerSeekBar(
              duration: positionData?.duration ?? Duration.zero,
              position: positionData?.position ?? Duration.zero,
              bufferedPosition: positionData?.bufferedPosition ?? Duration.zero,
              onChangeEnd: _player.seek,
            );
          },
        ),
      ],
    );
  }
}
