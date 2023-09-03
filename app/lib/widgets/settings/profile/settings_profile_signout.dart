import 'package:flutter/material.dart';

import 'package:supabase_flutter/supabase_flutter.dart' as supabase;

import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';
import 'package:feeddeck/widgets/signin/signin.dart';

/// The [SettingsProfileSignOut] displays a sign out button which can be used by
/// a user to sign out from all devices where he is currently signed in.
class SettingsProfileSignOut extends StatefulWidget {
  const SettingsProfileSignOut({super.key});

  @override
  State<SettingsProfileSignOut> createState() => _SettingsProfileSignOutState();
}

class _SettingsProfileSignOutState extends State<SettingsProfileSignOut> {
  bool _isLoading = false;

  /// [_signOut] signs out the currently authenticated user and redirects him
  /// to the [SignIn] screen. This will sign out the user from all devices.
  Future<void> _signOut() async {
    setState(() {
      _isLoading = true;
    });

    try {
      await supabase.Supabase.instance.client.auth.signOut();

      setState(() {
        _isLoading = false;
      });

      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(
          builder: (BuildContext context) => const SignIn(),
        ),
        (route) => false,
      );
    } catch (_) {
      setState(() {
        _isLoading = false;
      });
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
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () => _signOut(),
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
                            Characters('Sign Out')
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
                      const Icon(Icons.logout),
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
