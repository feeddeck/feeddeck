import 'package:flutter/material.dart';

import 'package:supabase_flutter/supabase_flutter.dart' as supabase;

import 'package:feeddeck/repositories/items_repository.dart';
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
  /// to the [SignIn] screen. If the provided scope is
  /// [supabase.SignOutScope.local] the user will be signed out from the current
  /// device. If the scope in [supabase.SignOutScope.global] the user will be
  /// signed out from all devices.
  ///
  /// Before the user is signed out the [ItemsRepositoryStore] is cleared, to
  /// trigger a reload of the items once the user is signed in again.
  Future<void> _signOut(supabase.SignOutScope scope) async {
    setState(() {
      _isLoading = true;
    });

    try {
      ItemsRepositoryStore().clear();
      await supabase.Supabase.instance.client.auth.signOut(scope: scope);

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
        onTap: () {
          /// Show a modal bottom sheet with the [SettingsProfileSignOutActions]
          /// widget, where the user can select the scope of the sign out
          /// action.
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
              return SettingsProfileSignOutActions(
                signOut: _signOut,
              );
            },
          );
        },
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

/// The [SettingsProfileSignOutActions] widget displays a list of actions which
/// can be used to sign out the user from the current device or from all
/// devices.
class SettingsProfileSignOutActions extends StatelessWidget {
  const SettingsProfileSignOutActions({
    super.key,
    required this.signOut,
  });

  final Future<void> Function(supabase.SignOutScope scope) signOut;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
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
          children: [
            ListTile(
              mouseCursor: SystemMouseCursors.click,
              onTap: () {
                Navigator.of(context).pop();
                signOut(supabase.SignOutScope.local);
              },
              leading: const Icon(
                Icons.logout,
              ),
              title: const Text(
                'From current device',
              ),
            ),
            const Divider(
              color: Constants.dividerColor,
              height: 1,
              thickness: 1,
            ),
            ListTile(
              mouseCursor: SystemMouseCursors.click,
              onTap: () {
                Navigator.of(context).pop();
                signOut(supabase.SignOutScope.global);
              },
              leading: const Icon(
                Icons.logout,
                color: Constants.error,
              ),
              title: const Text(
                'From all devices',
                style: TextStyle(
                  color: Constants.error,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
