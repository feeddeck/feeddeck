import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';

import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:flutter_web_plugins/url_strategy.dart';
import 'package:just_audio_background/just_audio_background.dart';
import 'package:media_kit/media_kit.dart';
import 'package:provider/provider.dart';
import 'package:window_manager/window_manager.dart';

import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/repositories/layout_repository.dart';
import 'package:feeddeck/repositories/profile_repository.dart';
import 'package:feeddeck/repositories/settings_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/confirmation/confirmation.dart';
import 'package:feeddeck/widgets/home/home.dart';
import 'package:feeddeck/widgets/item/details/utils/item_audio_palyer/item_audio_player_init/item_audio_player_init.dart';
import 'package:feeddeck/widgets/reset_password/reset_password.dart';

/// Before we are calling [runApp] we have to ensure that the widget bindings
/// are initialized, so that we can preserve the splash screen until we are done
/// with the initalization of the app.
void main() async {
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);

  /// We have to initialize the [windowManager] before we are calling [runApp]
  /// on all desktop platforms, so we can set the window size, title and so on.
  if (!kIsWeb && (Platform.isLinux || Platform.isMacOS || Platform.isWindows)) {
    await windowManager.ensureInitialized();

    WindowOptions windowOptions = const WindowOptions(
      size: Size(1024, 768),
      center: true,
      backgroundColor: Colors.transparent,
      skipTaskbar: false,
      titleBarStyle: TitleBarStyle.normal,
    );

    windowManager.waitUntilReadyToShow(windowOptions, () async {
      await windowManager.setTitle('FeedDeck');
      await windowManager.show();
      await windowManager.focus();
    });
  }

  /// Initialize the [media_kit] packages, so that we can play audio and video
  /// files.
  MediaKit.ensureInitialized();
  if (!kIsWeb && (Platform.isLinux || Platform.isWindows)) {
    ItemAudioPlayerInit().init();
  }

  /// Initialize the [just_audio_background] package, so that we can play audio
  /// files in the background.
  ///
  /// We can not initialize the [just_audio_background] package on Windows and
  /// Linux, because then the returned duration in the `_player.durationStream`
  /// isn't working correctly in the [ItemAudioPlayer] widget.
  if (kIsWeb || Platform.isAndroid || Platform.isIOS || Platform.isMacOS) {
    await JustAudioBackground.init(
      androidNotificationChannelId: 'com.ryanheise.bg_demo.channel.audio',
      androidNotificationChannelName: 'Audio playback',
      androidNotificationOngoing: true,
    );
  }

  /// For the ewb we have to use the path url strategy, so that the redirect
  /// within Supabase is working in all cases. On all other platforms this is a
  /// noop.
  usePathUrlStrategy();

  /// We also have to initialize the [SettingsRepository], which contains all
  /// the settings, to use the app with Supabase. This way a user can also use
  /// his own Supabase backend.
  await SettingsRepository().init();

  runApp(const FeedDeckApp());
}

/// [FeedDeckScrollBehavior] changes the scrolling behavior of the app. This is
/// required to enable scrolling on desktop via drag, which is the only way that
/// a user can scroll vertically with a mouse via drag.
///
/// E.g. this is required for the [ColumnLayoutSources] widget, where we rely on
/// the drag gesture to scroll the list of sources.
class FeedDeckScrollBehavior extends MaterialScrollBehavior {
  @override
  Set<PointerDeviceKind> get dragDevices => {
        PointerDeviceKind.touch,
        PointerDeviceKind.mouse,
        PointerDeviceKind.trackpad,
        PointerDeviceKind.stylus,
        PointerDeviceKind.unknown,
      };
}

/// [onGenerateRoute] is used in `onGenerateRoute` and `onGenerateInitialRoutes`
/// of the [MaterialApp] to add handling for some special routes were do not
/// want to render the [Home] widget (e.g. set a new password).
///
/// For that we have to check the current path and when the user call one of
/// this "special" routes we render the corresponding widget and pass all the
/// required values from the query paramters to this widget.
Route onGenerateRoute(RouteSettings settings) {
  if (settings.name != null) {
    var uriData = Uri.parse(settings.name!);

    switch (uriData.path) {
      case '/confirmation':
        return MaterialPageRoute(
          builder: (_) => Confirmation(
            template: uriData.queryParameters['template'] ?? '',
            confirmationUrl: uriData.queryParameters['confirmation_url'] ?? '',
          ),
        );
      case '/reset-password':
        return MaterialPageRoute(
          builder: (_) => const ResetPassword(),
        );
    }
  }

  return MaterialPageRoute(
    builder: (_) => const Home(),
  );
}

/// The [FeedDeckApp] is the root widget of the app. The widget is used to
/// initialize some of our providers via the [MultiProvider] widget and to set
/// the theme for the app.
class FeedDeckApp extends StatelessWidget {
  const FeedDeckApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LayoutRepository()),
        ChangeNotifierProvider(create: (_) => AppRepository()),
        ChangeNotifierProvider(create: (_) => ProfileRepository()),
      ],
      child: TooltipVisibility(
        visible: false,
        child: MaterialApp(
          title: 'FeedDeck',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            useMaterial3: true,
            colorScheme: const ColorScheme(
              brightness: Constants.brightness,
              primary: Constants.primary,
              onPrimary: Constants.onPrimary,
              secondary: Constants.secondary,
              onSecondary: Constants.onSecondary,
              error: Constants.error,
              onError: Constants.onError,
              surface: Constants.surface,
              onSurface: Constants.onSurface,
            ),
            canvasColor: Constants.canvasColor,
            appBarTheme: const AppBarTheme(
              centerTitle: true,
              backgroundColor: Constants.appBarBackgroundColor,
              scrolledUnderElevation: Constants.scrolledUnderElevation,
              elevation: Constants.appBarElevation,
            ),
            snackBarTheme: const SnackBarThemeData(
              backgroundColor: Constants.secondary,
              contentTextStyle: TextStyle(
                color: Constants.onSurface,
              ),
            ),
            dialogTheme: const DialogTheme(
              backgroundColor: Constants.surface,
              surfaceTintColor: Constants.surface,
              contentTextStyle: TextStyle(
                color: Constants.onSurface,
              ),
            ),
            popupMenuTheme: const PopupMenuThemeData(
              color: Constants.surface,
              surfaceTintColor: Constants.surface,
              textStyle: TextStyle(
                color: Constants.onSurface,
              ),
            ),
            drawerTheme: const DrawerThemeData(
              backgroundColor: Constants.surface,
              surfaceTintColor: Constants.surface,
            ),
            bottomSheetTheme: const BottomSheetThemeData(
              backgroundColor: Constants.surface,
              surfaceTintColor: Constants.surface,
            ),
            pageTransitionsTheme: const PageTransitionsTheme(
              builders: {
                TargetPlatform.android: CupertinoPageTransitionsBuilder(),
                TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
                TargetPlatform.linux: CupertinoPageTransitionsBuilder(),
                TargetPlatform.macOS: CupertinoPageTransitionsBuilder(),
                TargetPlatform.windows: CupertinoPageTransitionsBuilder(),
              },
            ),
          ),
          scrollBehavior: FeedDeckScrollBehavior(),
          onGenerateInitialRoutes: (initialRoute) =>
              [onGenerateRoute(RouteSettings(name: initialRoute))],
          onGenerateRoute: (RouteSettings settings) =>
              onGenerateRoute(settings),
        ),
      ),
    );
  }
}
