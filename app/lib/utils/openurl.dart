import 'dart:io' show Platform;

import 'package:flutter/foundation.dart' show kIsWeb;

import 'package:url_launcher/url_launcher.dart';

/// [openUrl] can be used to open the given [url] in the specified launch mode.
/// For iOS and Android we are using the In-App-Browser to launch the url, for
/// all other platforms we are using the external browser.
///
/// We do not have to check if the launch mode is really supported, because
/// `launchUrl` will fallback to a supported launch mode, when our preferred
/// mode is not supported.
Future<void> openUrl(String url) async {
  var launchMode = LaunchMode.platformDefault;

  if (kIsWeb) {
    launchMode = LaunchMode.externalApplication;
  } else if (Platform.isAndroid) {
    launchMode = LaunchMode.inAppBrowserView;
  } else if (Platform.isIOS) {
    launchMode = LaunchMode.inAppBrowserView;
  } else if (Platform.isMacOS) {
    launchMode = LaunchMode.externalApplication;
  } else if (Platform.isLinux) {
    launchMode = LaunchMode.externalApplication;
  } else if (Platform.isWindows) {
    launchMode = LaunchMode.externalApplication;
  }

  await launchUrl(Uri.parse(url), mode: launchMode);
}
