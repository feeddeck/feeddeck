import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:timeago/timeago.dart' as timeago;

/// The [SettingsRepository] is a singleton class that is used to store the
/// settings of the app and to initialize the `timeago` package and the Supabase
/// client. The [SettingsRepository] must be initialized in our main function by
/// calling the [init] method.
class SettingsRepository {
  static final SettingsRepository _instance = SettingsRepository._internal();

  /// The [supabaseUrl], [supabaseAnonKey], [supabaseSiteUrl] and
  /// [googleClientId] can be adjusted during build time or by a user during
  /// runtime. By default the values of our production instance will be used.
  String supabaseUrl = 'https://ityjucpsrasavriepscr.supabase.co';
  String supabaseAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eWp1Y3BzcmFzYXZyaWVwc2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQwMjY0NjIsImV4cCI6MjAwOTYwMjQ2Mn0.IDo7j9Kh8-5kHLtrZtHTvLf8lUkj7jiLynpIXSZbRFs';
  String supabaseSiteUrl = 'https://app.feeddeck.app';
  String googleClientId =
      '296452997087-2o1qasg1gdbe39b1l39dds1doq3t6h2e.apps.googleusercontent.com';

  /// By default the [subscriptionEnabled] variable is set to `true`, so that a
  /// user can subscribe to FeedDeck Premium. If the variable is set to `false`
  /// the user can not subscribe to FeedDeck Premium.
  bool subscriptionEnabled = true;

  /// The [revenueCatAppStoreKey] and [revenueCatGooglePlayKey] are used for the
  /// in-app purchases. The [revenueCatAppStoreKey] is used for the Apple App
  /// Store on iOS and macOS. The [revenueCatGooglePlayKey] is used for the
  /// Google Play Store on Android.
  final String revenueCatAppStoreKey = 'appl_kThbIaMkylDBtCEmsfczvgCBram';
  final String revenueCatGooglePlayKey = 'goog_tBFPbLbygjioviXRIlGlmUOKZYA';

  factory SettingsRepository() {
    return _instance;
  }

  SettingsRepository._internal();

  /// The [init] method initializes the [SettingsRepository] by reading the
  /// the values which can be configured by the user from the shared preferences
  /// and by reading the values from the environment variables. When all values
  /// were set by a user they will be used. If not we check if all environment
  /// variables are set and use them. If not we use the default values.
  Future<void> init() async {
    try {
      timeago.setLocaleMessages('en', timeago.EnShortMessages());
      timeago.setDefaultLocale('en');

      final SharedPreferences prefs = await SharedPreferences.getInstance();
      final String? supabaseUrlPrefs = prefs.getString('supabaseUrl');
      final String? supabaseAnonKeyPrefs = prefs.getString('supabaseAnonKey');
      final String? supabaseSiteUrlPrefs = prefs.getString('supabaseSiteUrl');
      final String? googleClientIdPrefs = prefs.getString('googleClientId');

      const supabaseUrlEnv = String.fromEnvironment('SUPABASE_URL');
      const supabaseAnonKeyEnv = String.fromEnvironment('SUPABASE_ANON_KEY');
      const supabaseSiteUrlEnv = String.fromEnvironment('SUPABASE_SITE_URL');
      const googleClientIdEnv = String.fromEnvironment('GOOGLE_CLIENT_ID');

      if (supabaseUrlPrefs != null &&
          supabaseAnonKeyPrefs != null &&
          supabaseSiteUrlPrefs != null &&
          googleClientIdPrefs != null) {
        /// Store the user provided values within the [SettingsRepository] and
        /// use them to initialize the Supabase client.
        ///
        /// Also set the [subscriptionEnabled] variabel to `false`, so that the
        /// user can not subscribe to FeedDeck Premium.
        supabaseUrl = supabaseUrlPrefs;
        supabaseAnonKey = supabaseAnonKeyPrefs;
        supabaseSiteUrl = supabaseSiteUrlPrefs;
        googleClientId = googleClientIdPrefs;

        subscriptionEnabled = false;

        await Supabase.initialize(
          url: supabaseUrlPrefs,
          anonKey: supabaseAnonKeyPrefs,
        );
      } else if (supabaseUrlEnv != '' &&
          supabaseAnonKeyEnv != '' &&
          supabaseSiteUrlEnv != '' &&
          googleClientIdEnv != '') {
        /// Store the values provided during the build time within the
        /// [SettingsRepository] and use them to initialize the Supabase client.
        supabaseUrl = supabaseUrlEnv;
        supabaseAnonKey = supabaseAnonKeyEnv;
        supabaseSiteUrl = supabaseSiteUrlEnv;
        googleClientId = googleClientIdEnv;

        await Supabase.initialize(
          url: supabaseUrlEnv,
          anonKey: supabaseAnonKeyEnv,
        );
      } else {
        /// Use the default values to initialize the Supabase client.
        await Supabase.initialize(
          url: supabaseUrl,
          anonKey: supabaseAnonKey,
        );
      }
    } catch (_) {}
  }

  /// [save] can be used to store the user provided values within the shared
  /// preferences. This will not automatically use the provided values for the
  /// Supabase client and a user must restart the app first.
  Future<void> save(
    String newSupabaseUrl,
    String newSupabaseAnonKey,
    String newSupabaseSiteUrl,
    String newGoogleClientId,
  ) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('supabaseUrl', newSupabaseUrl);
    await prefs.setString('supabaseAnonKey', newSupabaseAnonKey);
    await prefs.setString('supabaseSiteUrl', newSupabaseSiteUrl);
    await prefs.setString('googleClientId', newGoogleClientId);
  }

  /// [delete] can be used to delete all values from the shared preferences.
  /// This will not automatically use the default values for the Supabase client
  /// and a user must restart the app first.
  Future<void> delete() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove('supabaseUrl');
    await prefs.remove('supabaseAnonKey');
    await prefs.remove('supabaseSiteUrl');
    await prefs.remove('googleClientId');
  }
}
