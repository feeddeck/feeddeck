import 'dart:io';

import 'package:flutter/foundation.dart';
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

    return ListView.builder(
      shrinkWrap: true,
      itemCount: videos!.length,
      itemBuilder: (context, index) {
        return ItemVideoPlayer(video: videos![index]);
      },
    );
  }
}

/// The [ItemVideoQuality] class is used to store the different qualities of a
/// video. It is used in combination with the [ItemVideoPlayer] widget.
class ItemVideoQuality {
  const ItemVideoQuality({
    required this.quality,
    required this.video,
  });

  final String quality;
  final String video;
}

/// The [ItemVideoPlayer] widget is used to display a video, which can be played
/// by the user. It should be used in combination with the [ItemVideos] widget
/// and is responsible for the actual implementation of the video player.
///
/// If the provided [video] doesn't contain the audio stream it can be passed
/// via the [audio] parameter.
///
/// The optional [qualities] parameter can be used to display a list of
/// different qualities for the video, so that a user can select a lower quality
/// if the video is not loading fast enough.
class ItemVideoPlayer extends StatefulWidget {
  const ItemVideoPlayer({
    super.key,
    required this.video,
    this.audio,
    this.qualities,
  });

  final String video;
  final String? audio;
  final List<ItemVideoQuality>? qualities;

  @override
  State<ItemVideoPlayer> createState() => _ItemVideoPlayerState();
}

class _ItemVideoPlayerState extends State<ItemVideoPlayer> {
  late final player = Player();
  late final controller = VideoController(player);

  /// [_buildQualityButton] returns a button which can be used to display a list
  /// of different qualities for the video, so that a user can select a lower
  /// quality if the video is not loading fast enough.
  Widget _buildQualityButton() {
    return IconButton(
      onPressed: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          isDismissible: true,
          useSafeArea: true,
          elevation: 0,
          backgroundColor: Colors.transparent,
          constraints: const BoxConstraints(
            maxWidth: Constants.centeredFormMaxWidth,
          ),
          builder: (BuildContext context) {
            return Container(
              margin: const EdgeInsets.all(
                Constants.spacingMiddle,
              ),
              padding: const EdgeInsets.only(
                left: Constants.spacingMiddle,
                right: Constants.spacingMiddle,
              ),
              decoration: const BoxDecoration(
                color: Constants.background,
                borderRadius: BorderRadius.all(
                  Radius.circular(Constants.spacingMiddle),
                ),
              ),
              child: Wrap(
                alignment: WrapAlignment.center,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: widget.qualities!
                    .asMap()
                    .entries
                    .map((quality) {
                      if (quality.key == widget.qualities!.length - 1) {
                        return [
                          ListTile(
                            mouseCursor: SystemMouseCursors.click,
                            onTap: () async {
                              Navigator.of(context).pop();
                              await _playerOpen(quality.value.video);
                            },
                            title: Text(quality.value.quality),
                          ),
                        ];
                      }

                      return [
                        ListTile(
                          mouseCursor: SystemMouseCursors.click,
                          onTap: () async {
                            Navigator.of(context).pop();
                            await _playerOpen(quality.value.video);
                          },
                          title: Text(quality.value.quality),
                        ),
                        const Divider(
                          color: Constants.dividerColor,
                          height: 1,
                          thickness: 1,
                        ),
                      ];
                    })
                    .expand((e) => e)
                    .toList(),
              ),
            );
          },
        );
      },
      icon: const Icon(Icons.tune),
    );
  }

  /// [_buildBottomButtonBar] returns the list of buttons which are displayed in
  /// the bottom button bar of the video player. If the [qualities] parameter is
  /// not null, a button to select the quality of the video is added to the
  /// bottom button bar. If the [isMobile] parameter is true, the bottom button
  /// bar contains the default buttons from the [MaterialVideoControlsThemeData]
  /// theme, if it is false it contains the default buttons from the
  /// [MaterialDesktopVideoControlsThemeData] theme.
  List<Widget> _buildBottomButtonBar(bool isMobile) {
    if (isMobile) {
      if (widget.qualities != null) {
        return [
          const MaterialPositionIndicator(),
          const Spacer(),
          _buildQualityButton(),
          const MaterialFullscreenButton(),
        ];
      }

      return const [
        MaterialPositionIndicator(),
        Spacer(),
        MaterialFullscreenButton(),
      ];
    }

    if (widget.qualities != null) {
      return [
        const MaterialDesktopSkipPreviousButton(),
        const MaterialDesktopPlayOrPauseButton(),
        const MaterialDesktopSkipNextButton(),
        const MaterialDesktopVolumeButton(),
        const MaterialDesktopPositionIndicator(),
        const Spacer(),
        _buildQualityButton(),
        const MaterialDesktopFullscreenButton(),
      ];
    }

    return const [
      MaterialDesktopSkipPreviousButton(),
      MaterialDesktopPlayOrPauseButton(),
      MaterialDesktopSkipNextButton(),
      MaterialDesktopVolumeButton(),
      MaterialDesktopPositionIndicator(),
      Spacer(),
      MaterialDesktopFullscreenButton(),
    ];
  }

  /// [_playerOpen] opens the video player with the provided [video] and sets
  /// the audio track if it is provided via the [audio] parameter.
  Future<void> _playerOpen(String video) async {
    await player.open(
      Media(video),
      play: false,
    );

    /// Load an external audio track when it is provided via the [audio]
    /// parameter.
    /// See: https://github.com/media-kit/media-kit?tab=readme-ov-file#load-external-audio-track
    if (widget.audio != null) {
      await player.setAudioTrack(
        AudioTrack.uri(
          widget.audio!,
        ),
      );
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _playerOpen(widget.video);
    });
  }

  @override
  void dispose() {
    player.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(
        bottom: Constants.spacingMiddle,
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          return Center(
            child: SizedBox(
              width: constraints.maxWidth,
              height: constraints.maxWidth * 9.0 / 16.0,
              child: MaterialDesktopVideoControlsTheme(
                normal: MaterialDesktopVideoControlsThemeData(
                  bottomButtonBar: _buildBottomButtonBar(false),
                  seekBarPositionColor: Constants.primary,
                  seekBarThumbColor: Constants.primary,
                ),
                fullscreen: const MaterialDesktopVideoControlsThemeData(
                  seekBarPositionColor: Constants.primary,
                  seekBarThumbColor: Constants.primary,
                ),
                child: MaterialVideoControlsTheme(
                  normal: MaterialVideoControlsThemeData(
                    bottomButtonBar: _buildBottomButtonBar(true),
                    seekBarPositionColor: Constants.primary,
                    seekBarThumbColor: Constants.primary,
                  ),
                  fullscreen: const MaterialVideoControlsThemeData(
                    seekBarPositionColor: Constants.primary,
                    seekBarThumbColor: Constants.primary,
                  ),
                  child: Video(
                    controller: controller,
                    controls: kIsWeb ||
                            Platform.isLinux ||
                            Platform.isMacOS ||
                            Platform.isWindows
                        ? MaterialDesktopVideoControls
                        : MaterialVideoControls,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
