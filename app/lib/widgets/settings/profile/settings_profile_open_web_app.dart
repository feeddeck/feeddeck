import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:feeddeck/utils/api_exception.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/openurl.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';

/// The [SettingsProfileOpenWebApp] widget displays a button which allows
/// a user to open the web app in the browser.
class SettingsProfileOpenWebApp extends StatefulWidget {
  const SettingsProfileOpenWebApp({super.key});

  @override
  State<SettingsProfileOpenWebApp> createState() =>
      _SettingsProfileOpenWebAppState();
}

class _SettingsProfileOpenWebAppState extends State<SettingsProfileOpenWebApp> {
  bool _isLoading = false;

  /// [_openWebApp] generates a new magic link and opens it in the browser.
  Future<void> _openWebApp() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final result = await Supabase.instance.client.functions.invoke(
        'generate-magic-link-v1',
        method: HttpMethod.get,
      );

      if (result.status != 200) {
        throw ApiException(result.data['error'], result.status);
      }

      setState(() {
        _isLoading = false;
      });

      await openUrl(result.data['url']);
    } catch (_) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          duration: Duration(seconds: 10),
          backgroundColor: Constants.error,
          showCloseIcon: true,
          content: Text(
            'Web app link could not be generated. Please try again later.',
            style: TextStyle(color: Constants.onError),
          ),
        ),
      );
    }
  }

  /// [buildIcon] return the provided icon or when the [_isLoading] state is
  /// `true` is returns a circular progress indicator.
  Widget buildIcon(Icon icon) {
    if (_isLoading) return const ElevatedButtonProgressIndicator();
    return icon;
  }

  @override
  Widget build(BuildContext context) {
    if (kIsWeb || Platform.isLinux || Platform.isMacOS || Platform.isWindows) {
      return Container();
    }

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () => _openWebApp(),
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
                            Characters('Open Web App')
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
                    buildIcon(
                      const Icon(Icons.open_in_browser),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
