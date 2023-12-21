import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as supabase;

import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/repositories/settings_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/desktop_login_manager.dart';
import 'package:feeddeck/utils/fd_icons.dart';
import 'package:feeddeck/utils/sign_in_with_apple.dart';
import 'package:feeddeck/widgets/deck/deck_layout.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';
import 'package:feeddeck/widgets/general/logo.dart';
import 'package:feeddeck/widgets/set_settings/set_settings.dart';
import 'package:feeddeck/widgets/signin_with_feeddeck/signin_with_feeddeck.dart';

/// The [SignIn] widget displays all the availabe options which can be used by
/// a user to sign in into FeedDeck. These options are Apple, Google and
/// FeedDeck. The FeedDeck options allows a user to sign in via email and
/// password and redirects the user to the [SignInWithFeedDeck] widget.
class SignIn extends StatefulWidget {
  const SignIn({super.key});

  @override
  State<SignIn> createState() => _SignInState();
}

class _SignInState extends State<SignIn> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  String _error = '';

  /// [_signInWithGoogle] handles the sign in of a user via his Google account.
  Future<void> _signInWithGoogle() async {
    try {
      if (!kIsWeb && Platform.isAndroid) {
        const platform = MethodChannel('feeddeck.app');

        /// On Android we are using `signInWithIdToken` method of the Supabase
        /// client instead of the `signInWithOAuth` method, so that the user is
        /// not redirected for the sign in. Since the sign in is completly
        /// handled within the app we have to call the `init` method of the
        /// [AppRepository] to load the user data from Supabase.
        setState(() {
          _isLoading = true;
          _error = '';
        });

        /// To implement the sign in via Google One Tap, we have to call the
        /// native method `startSignIn` of the FeedDeckPlugin. This method
        /// implements a similar logic as the `google_one_tap_sign_in`
        /// (https://github.com/daewu14/google_one_tap_sign_in) package.
        ///
        /// Unfortunately we can not use this package since it doesn't work on
        /// web.
        final String idToken = await platform.invokeMethod(
          'startSignIn',
          <String, dynamic>{
            'webClientId': SettingsRepository().googleClientId,
          },
        );

        await supabase.Supabase.instance.client.auth.signInWithIdToken(
          provider: supabase.OAuthProvider.google,
          idToken: idToken,
        );

        if (!mounted) return;
        await Provider.of<AppRepository>(
          context,
          listen: false,
        ).init();

        setState(() {
          _isLoading = false;
          _error = '';
        });

        if (!mounted) return;
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(
            builder: (BuildContext context) => const DeckLayout(),
          ),
          (route) => false,
        );
      } else if (!kIsWeb &&
          (Platform.isLinux || Platform.isMacOS || Platform.isWindows)) {
        /// On Linux, macOS and Windows we have to use the
        /// [DesktopSignInManager] to handle the login via the users Google
        /// account. Once the sing in process is finished we have to call the
        /// init method of the [AppRepository] to load the users data.
        setState(() {
          _isLoading = true;
          _error = '';
        });

        await DesktopSignInManager(
          provider: supabase.OAuthProvider.google,
          queryParams: {
            'access_type': 'offline',
            'prompt': 'consent',
          },
        ).signIn();

        if (!mounted) return;
        await Provider.of<AppRepository>(
          context,
          listen: false,
        ).init();

        setState(() {
          _isLoading = false;
          _error = '';
        });

        if (!mounted) return;
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(
            builder: (BuildContext context) => const DeckLayout(),
          ),
          (route) => false,
        );
      } else {
        /// On the web and iOS we can directly call the `signInWithOAuth`
        /// method of the Supabase client.
        ///
        /// On the web the user will be redirected to the app so that init
        /// method of the [AppRepository] is automatically called. On iOS
        /// the authentication is the handled via the `singin-callback` route.
        await supabase.Supabase.instance.client.auth.signInWithOAuth(
          supabase.OAuthProvider.google,
          queryParams: {
            'access_type': 'offline',
            'prompt': 'consent',
          },
          redirectTo:
              kIsWeb ? null : 'app.feeddeck.feeddeck://signin-callback/',
        );
      }
    } catch (err) {
      setState(() {
        _isLoading = false;
        _error = 'Sign in failed: ${err.toString()}';
      });
    }
  }

  /// [_signInWithApple] handles the sign in of a user via his Apple account.
  Future<void> _signInWithApple() async {
    try {
      if (!kIsWeb && (Platform.isIOS || Platform.isMacOS)) {
        /// On iOS and macOS we are using the `signInWithApple` method of the
        /// Supabase client instead of the `signInWithOAuth` method, so that the
        /// user is not redirected for the sign in. Since the sign in is
        /// completly handled within the app we have to call the `init` method
        /// of the [AppRepository] to load the user data from Supabase.
        setState(() {
          _isLoading = true;
          _error = '';
        });

        await signInWithApple();

        if (!mounted) return;
        await Provider.of<AppRepository>(
          context,
          listen: false,
        ).init();

        setState(() {
          _isLoading = false;
          _error = '';
        });

        if (!mounted) return;
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(
            builder: (BuildContext context) => const DeckLayout(),
          ),
          (route) => false,
        );
      } else if (!kIsWeb && (Platform.isLinux || Platform.isWindows)) {
        /// On Linux and Windows we have to use the [DesktopSignInManager] to
        /// handle the login via the users Apple account. Once the sing in
        /// process is finished we have to call the init method of the
        /// [AppRepository] to load the users data.
        setState(() {
          _isLoading = true;
          _error = '';
        });

        await DesktopSignInManager(
          provider: supabase.OAuthProvider.apple,
          queryParams: null,
        ).signIn();

        if (!mounted) return;
        await Provider.of<AppRepository>(
          context,
          listen: false,
        ).init();

        setState(() {
          _isLoading = false;
          _error = '';
        });

        if (!mounted) return;
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(
            builder: (BuildContext context) => const DeckLayout(),
          ),
          (route) => false,
        );
      } else {
        /// On the web and Android we can directly call the `signInWithOAuth`
        /// method of the Supabase client.
        ///
        /// On the web the user will be redirected to the app so that init
        /// method of the [AppRepository] is automatically called. On Android
        /// the authentication is the handled via the `singin-callback` route.
        await supabase.Supabase.instance.client.auth.signInWithOAuth(
          supabase.OAuthProvider.apple,
          redirectTo:
              kIsWeb ? null : 'app.feeddeck.feeddeck://signin-callback/',
        );
      }
    } catch (err) {
      setState(() {
        _isLoading = false;
        _error = 'Sign in failed: ${err.toString()}';
      });
    }
  }

  /// [_buildError] returns a widget to display the [_error] when it is not an
  /// empty string.
  List<Widget> _buildError() {
    if (_error != '') {
      return [
        const SizedBox(
          height: Constants.spacingMiddle,
        ),
        Text(
          _error,
          style: const TextStyle(
            color: Constants.error,
          ),
        ),
      ];
    }

    return [];
  }

  /// [_buildLogo] returns a widget to display the logo of the app. On web we
  /// just display the logo, on mobile and desktop we wrap the logo in a
  /// [MouseRegion] and [GestureDetector] to enable the user to open the
  /// [SetSettings] widget to adjust the Supabase Url, Supabase Anon Key and the
  /// Supabase Site Url.
  ///
  /// This means if a user wants to self host the app, the web version must be
  /// build from source. In the opposit to this a user can reuse the official
  /// apps for mobile and desktop and just adjust the settings.
  Widget _buildLogo() {
    if (!kIsWeb) {
      return MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onDoubleTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (BuildContext context) => const SetSettings(),
              ),
            );
          },
          child: const Logo(size: Constants.centeredFormLogoSize),
        ),
      );
    }

    return const Logo(size: Constants.centeredFormLogoSize);
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        child: Center(
          child: Container(
            constraints: const BoxConstraints(
              maxWidth: Constants.centeredFormMaxWidth,
            ),
            padding: const EdgeInsets.all(
              Constants.spacingMiddle,
            ),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLogo(),
                  const SizedBox(
                    height: Constants.spacingExtraLarge,
                  ),

                  /// Display an button, which allows the user to sign in with
                  /// his Google account.
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xff4285f4),
                      foregroundColor: const Color(0xffffffff),
                      maximumSize: const Size.fromHeight(
                        Constants.elevatedButtonSize,
                      ),
                      minimumSize: const Size.fromHeight(
                        Constants.elevatedButtonSize,
                      ),
                    ),
                    label: const Text('Sign in with Google'),
                    onPressed: _isLoading ? null : () => _signInWithGoogle(),
                    icon: _isLoading
                        ? const ElevatedButtonProgressIndicator()
                        : const Icon(FDIcons.google),
                  ),
                  const SizedBox(
                    height: Constants.spacingMiddle,
                  ),

                  /// Display an button, which allows the user to sign in with
                  /// his Apple account.
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xffffffff),
                      foregroundColor: const Color(0xff000000),
                      maximumSize: const Size.fromHeight(
                        Constants.elevatedButtonSize,
                      ),
                      minimumSize: const Size.fromHeight(
                        Constants.elevatedButtonSize,
                      ),
                    ),
                    label: const Text('Sign in with Apple'),
                    onPressed: _isLoading ? null : () => _signInWithApple(),
                    icon: _isLoading
                        ? const ElevatedButtonProgressIndicator()
                        : const Icon(FDIcons.apple),
                  ),
                  const SizedBox(
                    height: Constants.spacingMiddle,
                  ),

                  /// Display an button, which allows the user to sign in with
                  /// his FeedDeck account.
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Constants.primary,
                      foregroundColor: Constants.onPrimary,
                      maximumSize: const Size.fromHeight(
                        Constants.elevatedButtonSize,
                      ),
                      minimumSize: const Size.fromHeight(
                        Constants.elevatedButtonSize,
                      ),
                    ),
                    label: const Text('Sign in with FeedDeck'),
                    onPressed: _isLoading
                        ? null
                        : () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (BuildContext context) =>
                                    const SignInWithFeedDeck(),
                              ),
                            );
                          },
                    icon: _isLoading
                        ? const ElevatedButtonProgressIndicator()
                        : const Icon(FDIcons.feeddeck),
                  ),
                  const SizedBox(
                    height: Constants.spacingMiddle,
                  ),

                  ..._buildError(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
