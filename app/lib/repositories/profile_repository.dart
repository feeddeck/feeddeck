import 'dart:async';

import 'package:flutter/foundation.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:feeddeck/models/profile.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/utils/api_exception.dart';

enum FDProfileStatus {
  uninitialized,
  initialized,
}

class ProfileRepository with ChangeNotifier {
  FDProfileStatus _status = FDProfileStatus.uninitialized;
  FDProfile? _profile;

  FDProfileStatus get status => _status;
  FDProfileTier get tier => _profile?.tier ?? FDProfileTier.free;
  FDProfileSubscriptionProvider? get subscriptionProvider =>
      _profile?.subscriptionProvider;
  bool get accountGithub => _profile?.accountGithub ?? false;

  Future<void> init(bool force) async {
    if (_status == FDProfileStatus.initialized && force == false) {
      return;
    }

    try {
      final result = await Supabase.instance.client.functions.invoke(
        'profile-v1',
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

  void setTier(FDProfileTier tier) {
    _profile?.tier = tier;
    notifyListeners();
  }

  Future<void> addGithubAccount(String token) async {
    final result = await Supabase.instance.client.functions.invoke(
      'profile-v1',
      method: HttpMethod.post,
      body: {
        'action': 'add-account',
        'sourceType': FDSourceType.github.toShortString(),
        'options': {
          'token': token,
        }
      },
    );

    if (result.status != 200) {
      throw ApiException(result.data['error'], result.status);
    }

    _profile?.accountGithub = true;
    notifyListeners();
  }

  Future<void> deleteGithubAccount() async {
    final result = await Supabase.instance.client.functions.invoke(
      'profile-v1',
      method: HttpMethod.post,
      body: {
        'action': 'delete-account',
        'sourceType': FDSourceType.github.toShortString(),
      },
    );

    if (result.status != 200) {
      throw ApiException(result.data['error'], result.status);
    }

    _profile?.accountGithub = false;
    notifyListeners();
  }
}
