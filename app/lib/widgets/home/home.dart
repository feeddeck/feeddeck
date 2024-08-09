import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'package:app_links/app_links.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:provider/provider.dart';

import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/widgets/deck/deck_layout.dart';
import 'package:feeddeck/widgets/signin/signin.dart';

/// [Home] is the central widget of our app. If the user is already
/// authenticated is shows the [DeckLayout] widget otherwise the [SignIn]
/// widget. To check if the user is authenticated we have to call the `init`
/// method from the [AppRepository].
///
/// While the method is running we show a [CircularProgressIndicator]. On iOS,
/// Android and Web we do not really display the [CircularProgressIndicator]
/// instead we show the native splash screen until the method is finished.
class Home extends StatefulWidget {
  const Home({super.key});

  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  final _appLinks = AppLinks();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<AppRepository>(context, listen: false)
          .init()
          .then((_) => FlutterNativeSplash.remove());
    });

    if (!kIsWeb && (Platform.isIOS || Platform.isAndroid)) {
      _appLinks.uriLinkStream.listen((uri) {
        if (uri
            .toString()
            .startsWith('app.feeddeck.feeddeck://signin-callback/')) {
          if (mounted) {
            Provider.of<AppRepository>(context, listen: false)
                .signInWithCallback(uri)
                .then((_) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(
                    builder: (BuildContext context) => const DeckLayout(),
                  ),
                  (route) => false,
                );
              });
            }).catchError((_) {});
          }
        }
      });
    }
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    AppRepository app = Provider.of<AppRepository>(
      context,
      listen: true,
    );

    switch (app.status) {
      case FDAppStatus.unauthenticated:
        return const SignIn();
      case FDAppStatus.authenticated:
        return const DeckLayout();
      default:
        return const Scaffold(
          body: Center(
            child: SingleChildScrollView(
              child: CircularProgressIndicator(),
            ),
          ),
        );
    }
  }
}
