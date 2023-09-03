import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:timeago/timeago.dart' as timeago;

/// The [SettingsRepository] is a singleton class that is used to store the
/// settings of the app. This includes the url and anon key of the Supabase. The
/// [SettingsRepository] must be initialized in our main function by calling the
/// [init] method.
class SettingsRepository {
  static final SettingsRepository _instance = SettingsRepository._internal();

  String supabaseUrl = '';
  String supabaseAnonKey = '';
  String supabaseSiteUrl = '';
  String googleClientId = '';

  factory SettingsRepository() {
    return _instance;
  }

  SettingsRepository._internal();

  /// The [init] method initializes the [SettingsRepository] by reading the
  /// Supabase url and anon key from the shared preferences. If the Supabase url
  /// and anon key are not stored in the shared preferences, the values from the
  /// environment variables are used.
  Future<void> init() async {
    try {
      timeago.setLocaleMessages('en', timeago.EnShortMessages());
      timeago.setDefaultLocale('en');

      final SharedPreferences prefs = await SharedPreferences.getInstance();
      final String? supabaseUrlPrefs = prefs.getString('supabaseUrl');
      final String? supabaseAnonKeyPrefs = prefs.getString('supabaseAnonKey');
      final String? supabaseSiteUrlPrefs = prefs.getString('supabaseSiteUrl');
      final String? googleClientIdPrefs = prefs.getString('googleClientId');

      if (supabaseUrlPrefs != null &&
          supabaseAnonKeyPrefs != null &&
          supabaseSiteUrlPrefs != null &&
          googleClientIdPrefs != null) {
        supabaseUrl = supabaseUrlPrefs;
        supabaseAnonKey = supabaseAnonKeyPrefs;
        supabaseSiteUrl = supabaseSiteUrlPrefs;
        googleClientId = googleClientIdPrefs;

        await Supabase.initialize(
          url: supabaseUrlPrefs,
          anonKey: supabaseAnonKeyPrefs,
        );
      } else {
        const supabaseUrlEnv = String.fromEnvironment('SUPABASE_URL');
        const supabaseAnonKeyEnv = String.fromEnvironment('SUPABASE_ANON_KEY');
        const supabaseSiteUrlEnv = String.fromEnvironment('SUPABASE_SITE_URL');
        const googleClientIdEnv = String.fromEnvironment('GOOGLE_CLIENT_ID');

        supabaseUrl = supabaseUrlEnv;
        supabaseAnonKey = supabaseAnonKeyEnv;
        supabaseSiteUrl = supabaseSiteUrlEnv;
        googleClientId = googleClientIdEnv;

        await Supabase.initialize(
          url: supabaseUrlEnv,
          anonKey: supabaseAnonKeyEnv,
        );
      }
    } catch (_) {}
  }

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

  Future<void> delete() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove('supabaseUrl');
    await prefs.remove('supabaseAnonKey');
    await prefs.remove('supabaseSiteUrl');
    await prefs.remove('googleClientId');
  }
}
