import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:provider/provider.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as supabase;

import 'package:feeddeck/models/profile.dart';
import 'package:feeddeck/repositories/profile_repository.dart';
import 'package:feeddeck/repositories/settings_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';

class SettingsPremiumInAppRestore extends StatefulWidget {
  const SettingsPremiumInAppRestore({super.key});

  @override
  State<SettingsPremiumInAppRestore> createState() =>
      _SettingsPremiumInAppRestoreState();
}

class _SettingsPremiumInAppRestoreState
    extends State<SettingsPremiumInAppRestore> {
  bool _isLoading = false;

  Future<void> _restore() async {
    try {
      setState(() {
        _isLoading = true;
      });

      if (Platform.isAndroid) {
        await Purchases.configure(
          PurchasesConfiguration(
            SettingsRepository().revenueCatGooglePlayKey,
          )..appUserID = supabase.Supabase.instance.client.auth.currentUser!.id,
        );
      } else if (Platform.isMacOS || Platform.isIOS) {
        await Purchases.configure(
          PurchasesConfiguration(
            SettingsRepository().revenueCatAppStoreKey,
          )..appUserID = supabase.Supabase.instance.client.auth.currentUser!.id,
        );
      } else {
        return;
      }

      CustomerInfo customerInfo = await Purchases.restorePurchases();
      setState(() {
        _isLoading = false;
      });

      if (!customerInfo.entitlements.all.containsKey('FeedDeck Premium')) {
        throw Exception('FeedDeck Premium entitlement not found.');
      }

      if (customerInfo.entitlements.all['FeedDeck Premium']!.isActive) {
        if (!mounted) return;
        Provider.of<ProfileRepository>(
          context,
          listen: false,
        ).setTier(FDProfileTier.premium);
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          duration: Duration(seconds: 10),
          backgroundColor: Constants.primary,
          showCloseIcon: true,
          content: Text(
            'FeedDeck Premium was restored.',
            style: TextStyle(color: Constants.onPrimary),
          ),
        ),
      );
    } on PlatformException catch (err) {
      setState(() {
        _isLoading = false;
      });
      final errorCode = PurchasesErrorHelper.getErrorCode(err);
      if (errorCode == PurchasesErrorCode.purchaseCancelledError) {
        return;
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            duration: const Duration(seconds: 10),
            backgroundColor: Constants.error,
            showCloseIcon: true,
            content: Text(
              'Restore purchase failed: ${err.message}',
              style: const TextStyle(color: Constants.onError),
            ),
          ),
        );
      }
    } catch (err) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          duration: const Duration(seconds: 10),
          backgroundColor: Constants.error,
          showCloseIcon: true,
          content: Text(
            'Restore purchase failed: ${err.toString()}',
            style: const TextStyle(color: Constants.onError),
          ),
        ),
      );
    }
  }

  /// [buildIcon] return the provided icon or when the [_isLoading] state is
  /// `true` is returns a circular progress indicator.
  Widget buildIcon() {
    if (_isLoading) return const ElevatedButtonProgressIndicator();
    return Container();
  }

  @override
  Widget build(BuildContext context) {
    ProfileRepository profile = Provider.of<ProfileRepository>(
      context,
      listen: true,
    );

    /// We do not display the restore button when subscriptions are disabled,
    /// the profile isn't initalized yet or a user is already subscribed to
    /// FeedDeck Premium.
    if (!SettingsRepository().subscriptionEnabled) {
      return Container();
    }

    if (profile.status == FDProfileStatus.uninitialized) {
      return Container();
    }

    if (profile.tier != FDProfileTier.free) {
      return Container();
    }

    if (!kIsWeb && (Platform.isMacOS || Platform.isAndroid || Platform.isIOS)) {
      return MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTap: () => _restore(),
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
                              Characters('Restore Purchases')
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
                      buildIcon(),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Container();
  }
}
