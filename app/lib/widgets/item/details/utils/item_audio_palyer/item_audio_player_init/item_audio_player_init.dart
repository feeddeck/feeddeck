library item_audio_player_init;

import 'item_audio_player_init_stub.dart'
    if (dart.library.io) 'item_audio_player_init_native.dart'
    if (dart.library.html) 'item_audio_player_init_web.dart';

abstract class ItemAudioPlayerInit {
  void init();

  factory ItemAudioPlayerInit() => getItemAudioPlayerInit();
}
