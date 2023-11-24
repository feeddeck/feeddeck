import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'package:package_info_plus/package_info_plus.dart';

import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/fd_icons.dart';
import 'package:feeddeck/utils/openurl.dart';

/// The [SettingsInfo] widget implements the info section of the settings page.
/// Here the user can find information the version of the app and the links to
/// the website, the GitHub repository and the X account.
class SettingsInfo extends StatefulWidget {
  const SettingsInfo({super.key});

  @override
  State<SettingsInfo> createState() => _SettingsInfoState();
}

class _SettingsInfoState extends State<SettingsInfo> {
  String _version = '';

  /// [_getVersion] sets the [_version] variable via the [PackageInfo] package.
  /// The [_version] is then displayed within the information items. When we are
  /// not able to get the version of the app we log an error and leave the
  /// version unset.
  Future<void> _getVersion() async {
    try {
      PackageInfo packageInfo = await PackageInfo.fromPlatform();
      setState(() {
        _version = packageInfo.version;
      });
    } catch (_) {}
  }

  /// [_buildItem] returns a single information item. The item contains a title,
  /// an icon and an onTap function. The onTap function is called when the user
  /// clicks on the item.
  Widget _buildItem(String title, Widget icon, void Function()? onTap) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: onTap,
        child: Card(
          color: Constants.secondary,
          margin: const EdgeInsets.only(
            bottom: Constants.spacingSmall,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.all(
                  Constants.spacingMiddle,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            Characters(
                              title,
                            )
                                .replaceAll(
                                  Characters(''),
                                  Characters('\u{200B}'),
                                )
                                .toString(),
                            maxLines: 1,
                            style: const TextStyle(
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                    icon,
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _getVersion();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Info',
          style: TextStyle(
            fontSize: 20.0,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(
          height: Constants.spacingSmall,
        ),
        _buildItem(
          'Version',
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(6),
              color: Constants.primary,
            ),
            padding: const EdgeInsets.all(
              Constants.spacingExtraSmall,
            ),
            child: Text(
              _version,
              style: const TextStyle(
                color: Constants.onPrimary,
              ),
            ),
          ),
          null,
        ),
        _buildItem(
          'Website',
          const Icon(FDIcons.browser),
          () {
            try {
              openUrl('https://feeddeck.app');
            } catch (_) {}
          },
        ),
        _buildItem(
          'GitHub',
          const Icon(FDIcons.github),
          () {
            try {
              openUrl('https://github.com/feeddeck/feeddeck');
            } catch (_) {}
          },
        ),
        _buildItem(
          'X',
          const Icon(FDIcons.x),
          () {
            try {
              openUrl('https://x.com/feeddeckapp');
            } catch (_) {}
          },
        ),
        _buildItem(
          'Get Started',
          const Icon(Icons.help),
          () {
            try {
              if (kIsWeb ||
                  Platform.isLinux ||
                  Platform.isMacOS ||
                  Platform.isWindows) {
                openUrl('https://feeddeck.app/get-started/desktop');
              } else {
                openUrl('https://feeddeck.app/get-started/mobile');
              }
            } catch (_) {}
          },
        ),
        _buildItem(
          'Terms & Conditions',
          const Icon(Icons.policy),
          () {
            try {
              openUrl('https://feeddeck.app/terms-and-conditions');
            } catch (_) {}
          },
        ),
        _buildItem(
          'Privacy Policy',
          const Icon(Icons.security),
          () {
            try {
              openUrl('https://feeddeck.app/privacy-policy');
            } catch (_) {}
          },
        ),
      ],
    );
  }
}
