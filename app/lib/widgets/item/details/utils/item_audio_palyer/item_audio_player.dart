import 'package:flutter/material.dart';

import 'package:audioplayers/audioplayers.dart';

import 'package:feeddeck/widgets/item/details/utils/item_audio_palyer/item_audio_player_internal.dart';

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
  Future<void> _init() async {
    try {
      await _player.setSource(UrlSource(widget.audioFile));
    } catch (_) {}
  }

  @override
  void initState() {
    super.initState();
    _init();
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ItemAudioPlayerInternal(player: _player);
  }
}
