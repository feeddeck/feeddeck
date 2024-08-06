import 'package:just_audio_media_kit/just_audio_media_kit.dart';

import 'item_audio_player_init.dart';

class ItemAudioPlayerInitNative implements ItemAudioPlayerInit {
  @override
  void init() {
    JustAudioMediaKit.ensureInitialized();
  }
}

ItemAudioPlayerInit getItemAudioPlayerInit() => ItemAudioPlayerInitNative();
