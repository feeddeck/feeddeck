import 'dart:io' show Platform;

import 'package:flutter/foundation.dart' show kIsWeb;

/// [getMonospaceFontFamily] returns the correct monospace font family for the
/// current platform.
String getMonospaceFontFamily() {
  if (kIsWeb) {
    return 'Courier';
  }

  if (Platform.isIOS || Platform.isMacOS) {
    return 'Courier';
  }

  return 'monospace';
}
