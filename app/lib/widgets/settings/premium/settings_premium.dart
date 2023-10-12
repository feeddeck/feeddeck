import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/models/profile.dart';
import 'package:feeddeck/repositories/profile_repository.dart';
import 'package:feeddeck/repositories/settings_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/fd_icons.dart';
import 'package:feeddeck/widgets/general/logo.dart';
import 'package:feeddeck/widgets/settings/premium/settings_premium_inapp.dart';
import 'package:feeddeck/widgets/settings/premium/settings_premium_inapp_restore.dart';
import 'package:feeddeck/widgets/settings/premium/settings_premium_stripe.dart';

class SettingsPremium extends StatelessWidget {
  const SettingsPremium({super.key});

  /// [_showPaymentModal] show a modal to subscribe to FeedDeck Premium via
  /// Stripe on the web, Linux and Windows. On macOS, Android and iOS the modal
  /// to subscribe via in-app purchases is shown.
  void _showPaymentModal(BuildContext context) {
    if (kIsWeb || Platform.isLinux || Platform.isWindows) {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        isDismissible: true,
        useSafeArea: true,
        backgroundColor: Colors.transparent,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(Constants.spacingMiddle),
          ),
        ),
        clipBehavior: Clip.antiAliasWithSaveLayer,
        constraints: const BoxConstraints(
          maxWidth: Constants.centeredFormMaxWidth,
        ),
        builder: (BuildContext context) {
          return const SettingsPremiumStripe();
        },
      );
    } else if (Platform.isMacOS || Platform.isAndroid || Platform.isIOS) {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        isDismissible: true,
        useSafeArea: true,
        backgroundColor: Colors.transparent,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(Constants.spacingMiddle),
          ),
        ),
        clipBehavior: Clip.antiAliasWithSaveLayer,
        constraints: const BoxConstraints(
          maxWidth: Constants.centeredFormMaxWidth,
        ),
        builder: (BuildContext context) {
          return const SettingsPremiumInApp();
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    ProfileRepository profile = Provider.of<ProfileRepository>(
      context,
      listen: true,
    );

    /// If subscriptions are disabled, because the user uses a custom Supabase
    /// instance or if the profile is not initialized yet or if the user is
    /// already on the premium tier we do not show the option to subscribe to
    /// FeedDeck Premium.
    if (!SettingsRepository().subscriptionEnabled) {
      return Container();
    }

    if (profile.status == FDProfileStatus.uninitialized) {
      return Container();
    }

    /// In-App Purchases are disabled on Android for now, until we have the
    /// first version of the app in the Play Store, so that we can properly test
    /// the implementation.
    ///
    /// TODO: Enable once the first Android version is in the Play Store.
    if (!kIsWeb && Platform.isAndroid) {
      return Container();
    }

    if (profile.tier != FDProfileTier.free) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            color: Constants.primary,
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
                              Characters('You are using FeedDeck Premium')
                                  .replaceAll(
                                    Characters(''),
                                    Characters('\u{200B}'),
                                  )
                                  .toString(),
                              maxLines: 1,
                              style: const TextStyle(
                                color: Constants.onPrimary,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(
                        FDIcons.feeddeck,
                        color: Constants.onPrimary,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(
            height: Constants.spacingMiddle,
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        MouseRegion(
          cursor: SystemMouseCursors.click,
          child: GestureDetector(
            onTap: () => _showPaymentModal(context),
            child: Card(
              color: Constants.primary,
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
                    child: Column(
                      children: const [
                        Logo(size: 64),
                        SizedBox(
                          height: Constants.spacingSmall,
                        ),
                        Text(
                          'Subscribe to FeedDeck Premium',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Constants.onPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SettingsPremiumInAppRestore(),
        const SizedBox(
          height: Constants.spacingMiddle,
        ),
      ],
    );
  }
}
