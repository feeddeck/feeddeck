import 'dart:async';

import 'package:flutter/material.dart';

import 'package:audioplayers/audioplayers.dart';

import 'package:feeddeck/utils/constants.dart';

/// The [ItemAudioPlayerInternal] widget provides all the basic controls
/// for our audio player, these are a play / pause button, a slider to set
/// the volume / speed for the played audio file and a seek bar to control the
/// position in the audio file.
class ItemAudioPlayerInternal extends StatefulWidget {
  const ItemAudioPlayerInternal({
    super.key,
    required this.player,
  });

  final AudioPlayer player;

  @override
  State<ItemAudioPlayerInternal> createState() =>
      _ItemAudioPlayerInternalState();
}

class _ItemAudioPlayerInternalState extends State<ItemAudioPlayerInternal> {
  PlayerState? _playerState;
  Duration? _duration;
  Duration? _position;

  StreamSubscription? _durationSubscription;
  StreamSubscription? _positionSubscription;
  StreamSubscription? _playerCompleteSubscription;
  StreamSubscription? _playerStateChangeSubscription;

  bool get _isPlaying => _playerState == PlayerState.playing;
  Duration? get _remaining =>
      _duration != null && _position != null ? _duration! - _position! : null;
  AudioPlayer get _player => widget.player;

  /// [_initStreams] initializes all the streams for the [_player] to update
  /// the UI whenever the state of the player changes.
  void _initStreams() {
    _durationSubscription = _player.onDurationChanged.listen((duration) {
      setState(() => _duration = duration);
    });

    _positionSubscription = _player.onPositionChanged.listen(
      (p) => setState(() => _position = p),
    );

    _playerCompleteSubscription = _player.onPlayerComplete.listen((event) {
      setState(() {
        _playerState = PlayerState.stopped;
        _position = Duration.zero;
      });
    });

    _playerStateChangeSubscription =
        _player.onPlayerStateChanged.listen((state) {
      setState(() {
        _playerState = state;
      });
    });
  }

  /// [_printDuration] prints the provided [duration] in a human readable format
  /// `HH:mm:ss`.
  String _printDuration(Duration duration) {
    String negativeSign = duration.isNegative ? '-' : '';
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    String twoDigitMinutes = twoDigits(duration.inMinutes.remainder(60).abs());
    String twoDigitSeconds = twoDigits(duration.inSeconds.remainder(60).abs());
    return '$negativeSign${twoDigits(duration.inHours)}:$twoDigitMinutes:$twoDigitSeconds';
  }

  /// Use initial values from [_player] to initialize the [_playerState], the
  /// [_duration] and the [_position] state.
  @override
  void initState() {
    super.initState();
    _playerState = _player.state;
    _player.getDuration().then(
          (value) => setState(() {
            _duration = value;
          }),
        );
    _player.getCurrentPosition().then(
          (value) => setState(() {
            _position = value;
          }),
        );
    _initStreams();
  }

  /// Subscriptions can only be closed asynchronously, therefore events can
  /// occur after widget has been disposed.
  @override
  void setState(VoidCallback fn) {
    if (mounted) {
      super.setState(fn);
    }
  }

  @override
  void dispose() {
    _durationSubscription?.cancel();
    _positionSubscription?.cancel();
    _playerCompleteSubscription?.cancel();
    _playerStateChangeSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            /// Open a slider dialog to adjust the volume of the played audio
            /// file.
            Padding(
              padding: const EdgeInsets.only(right: Constants.spacingSmall),
              child: IconButton(
                icon: const Icon(Icons.volume_up),
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (context) {
                      double volume = _player.volume;

                      return StatefulBuilder(
                        builder: (context, setState) {
                          return AlertDialog(
                            title: const Text(
                              'Volume',
                              textAlign: TextAlign.center,
                            ),
                            content: SizedBox(
                              height: 100.0,
                              child: Column(
                                children: [
                                  Text(
                                    volume.toStringAsFixed(1),
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 24.0,
                                    ),
                                  ),
                                  Slider(
                                    divisions: 10,
                                    min: 0,
                                    max: 1,
                                    value: volume,
                                    onChanged: (double value) async {
                                      try {
                                        await _player.setVolume(value);
                                        setState(() {
                                          volume = value;
                                        });
                                      } catch (_) {}
                                    },
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      );
                    },
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
              onPressed: () async {
                try {
                  final currentPosition = await _player.getCurrentPosition();
                  if (currentPosition != null) {
                    _player.seek(currentPosition - const Duration(seconds: 10));
                  }
                } catch (_) {}
              },
            ),

            /// Display a play / pause button to play / pause the currently
            /// playing audio file.
            (() {
              if (_isPlaying) {
                return IconButton(
                  icon: const Icon(Icons.pause),
                  iconSize: 64.0,
                  onPressed: () async {
                    try {
                      await _player.pause();
                      setState(() => _playerState = PlayerState.paused);
                    } catch (_) {}
                  },
                );
              }

              return IconButton(
                icon: const Icon(Icons.play_arrow),
                iconSize: 64.0,
                onPressed: () async {
                  try {
                    final position = _position;
                    if (position != null && position.inMilliseconds > 0) {
                      await _player.seek(position);
                    }
                    await _player.resume();
                    setState(() => _playerState = PlayerState.playing);
                  } catch (_) {}
                },
              );
            }()),

            /// Display a forward button to go 30 seonds forward in the
            /// currently playing audio file.
            IconButton(
              icon: const Icon(
                Icons.forward_30,
                size: 32.0,
              ),
              onPressed: () async {
                try {
                  final currentPosition = await _player.getCurrentPosition();
                  if (currentPosition != null) {
                    _player.seek(currentPosition + const Duration(seconds: 30));
                  }
                } catch (_) {}
              },
            ),

            /// Open a slider dialog to  adjust the speed of the played audio
            /// file.
            Padding(
              padding: const EdgeInsets.only(left: Constants.spacingSmall),
              child: IconButton(
                icon: Text(
                  '${_player.playbackRate.toStringAsFixed(1)}x',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (context) {
                      double speed = _player.playbackRate;

                      return StatefulBuilder(
                        builder: (context, setState) {
                          return AlertDialog(
                            title: const Text(
                              'Speed',
                              textAlign: TextAlign.center,
                            ),
                            content: SizedBox(
                              height: 100.0,
                              child: Column(
                                children: [
                                  Text(
                                    speed.toStringAsFixed(1),
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 24.0,
                                    ),
                                  ),
                                  Slider(
                                    divisions: 10,
                                    min: 0.5,
                                    max: 1.5,
                                    value: speed,
                                    onChanged: (double value) async {
                                      try {
                                        await _player.setPlaybackRate(value);
                                        setState(() {
                                          speed = value;
                                        });
                                      } catch (_) {}
                                    },
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),

        /// Display a seek bar to control the position in the currently playing
        /// audio file. The seek bar also displays the current position and the
        /// remaining time in the audio file.
        Stack(
          children: [
            Slider(
              onChanged: (v) {
                final duration = _duration;
                if (duration == null) {
                  return;
                }
                final position = v * duration.inMilliseconds;
                _player.seek(Duration(milliseconds: position.round()));
              },
              value: (_position != null &&
                      _duration != null &&
                      _position!.inMilliseconds > 0 &&
                      _position!.inMilliseconds < _duration!.inMilliseconds)
                  ? _position!.inMilliseconds / _duration!.inMilliseconds
                  : 0.0,
            ),
            Positioned(
              left: Constants.spacingMiddle,
              bottom: 0.0,
              child: Text(
                _printDuration(_position ?? Duration.zero),
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
            Positioned(
              right: Constants.spacingMiddle,
              bottom: 0.0,
              child: Text(
                _printDuration(_remaining ?? Duration.zero),
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
