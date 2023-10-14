import 'dart:async';

import 'package:flutter/foundation.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:feeddeck/models/profile.dart';
import 'package:feeddeck/utils/api_exception.dart';

enum FDProfileStatus {
  uninitialized,
  initialized,
}

/// The [ProfileRepository] is used to fetch and update a users profile data.
/// The users profile contains all the required information for the users
/// subscription status and the users connected accounts.
class ProfileRepository with ChangeNotifier {
  FDProfileStatus _status = FDProfileStatus.uninitialized;
  FDProfile? _profile;

  FDProfileStatus get status => _status;
  FDProfileTier get tier => _profile?.tier ?? FDProfileTier.free;
  FDProfileSubscriptionProvider? get subscriptionProvider =>
      _profile?.subscriptionProvider;
  bool get accountGithub => _profile?.accountGithub ?? false;

  /// [init] is used to fetch the users profile from the `profile-v2` edge
  /// function.
  Future<void> init(bool force) async {
    if (_status == FDProfileStatus.initialized && force == false) {
      return;
    }

    try {
      final result = await Supabase.instance.client.functions.invoke(
        'profile-v2/getProfile',
        method: HttpMethod.get,
      );

      if (result.status != 200) {
        throw ApiException(result.data['error'], result.status);
      }

      _profile = FDProfile.fromJson(result.data);
      _status = FDProfileStatus.initialized;
      notifyListeners();
    } catch (_) {
      _status = FDProfileStatus.uninitialized;
      notifyListeners();
    }
  }

  /// [setTier] is used to update the users tier. We do not have to make an API
  /// call to update the tier in the database, because this is done via Webhooks
  /// by the connected payment provider.
  ///
  /// This is only required to reflect the update in the Flutter app.
  void setTier(FDProfileTier tier) {
    _profile?.tier = tier;
    notifyListeners();
  }

  /// [githubAddAccount] is used to add a GitHub account to the users profile.
  /// For this the user must provide an private access token with the required
  /// scopes.
  Future<void> githubAddAccount(String token) async {
    final result = await Supabase.instance.client.functions.invoke(
      'profile-v2/githubAddAccount',
      method: HttpMethod.post,
      body: {
        'token': token,
      },
    );

    if (result.status != 200) {
      throw ApiException(result.data['error'], result.status);
    }

    _profile?.accountGithub = true;
    notifyListeners();
  }

  /// [githubDeleteAccount] deletes the users connected GitHub account. For that
  /// we delete the GitHub access token from the database.
  Future<void> githubDeleteAccount() async {
    final result = await Supabase.instance.client.functions.invoke(
      'profile-v2/githubDeleteAccount',
      method: HttpMethod.delete,
    );

    if (result.status != 200) {
      throw ApiException(result.data['error'], result.status);
    }

    _profile?.accountGithub = false;
    notifyListeners();
  }
}
