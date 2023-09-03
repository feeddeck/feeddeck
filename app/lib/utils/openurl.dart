import 'dart:io' show Platform;

import 'package:flutter/foundation.dart' show kIsWeb;

import 'package:url_launcher/url_launcher.dart';

/// [openUrl] can be used to open the given [url] in the platforms default
/// browser.
///
/// On Android we are not using the default launch mode
/// (`LaunchMode.platformDefault`), because the opened In-App-Browser is very
/// limited, so that we decided to use `LaunchMode.externalApplication` to open
/// the url.
Future<void> openUrl(String url) async {
  var launchMode = LaunchMode.platformDefault;

  if (!kIsWeb) {
    if (Platform.isAndroid) {
      launchMode = LaunchMode.externalApplication;
    }
  }

  await launchUrl(
    Uri.parse(url),
    mode: launchMode,
  );
}
