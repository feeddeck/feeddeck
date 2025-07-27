import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:provider/provider.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as supabase;

import 'package:feeddeck/models/profile.dart';
import 'package:feeddeck/repositories/profile_repository.dart';
import 'package:feeddeck/repositories/settings_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/fd_icons.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';

class SettingsPremiumInApp extends StatefulWidget {
  const SettingsPremiumInApp({super.key});

  @override
  State<SettingsPremiumInApp> createState() => _SettingsPremiumInAppState();
}

class _SettingsPremiumInAppState extends State<SettingsPremiumInApp> {
  late Future<Offering?> _futureFetchOfferings;
  bool _isLoading = false;

  /// [_fetchOfferings] is used to fetch the Stripe checkout session
  /// link. For that we have to call the `stripe-create-checkout-session-v1`
  /// Supabase edge function. If the link is generated successfully, the
  /// function returns the url, which can then be opened by the user.
  Future<Offering?> _fetchOfferings() async {
    if (Platform.isAndroid) {
      await Purchases.configure(
        PurchasesConfiguration(SettingsRepository().revenueCatGooglePlayKey)
          ..appUserID = supabase.Supabase.instance.client.auth.currentUser!.id,
      );
    } else if (Platform.isMacOS || Platform.isIOS) {
      await Purchases.configure(
        PurchasesConfiguration(SettingsRepository().revenueCatAppStoreKey)
          ..appUserID = supabase.Supabase.instance.client.auth.currentUser!.id,
      );
    }

    Offerings offerings = await Purchases.getOfferings();
    if (offerings.current != null) {
      return offerings.current;
    } else {
      return null;
    }
  }

  /// [_purchase] is used to purchase the provided [package]. If the purchase
  /// was successful, the user is notified. If the purchase failed, the user is
  /// notified as well.
  Future<void> _purchase(Package package) async {
    try {
      setState(() {
        _isLoading = true;
      });

      final purchaseResult = await Purchases.purchasePackage(package);
      setState(() {
        _isLoading = false;
      });

      if (!purchaseResult.customerInfo.entitlements.all.containsKey(
        'FeedDeck Premium',
      )) {
        throw Exception('FeedDeck Premium entitlement not found.');
      }

      if (purchaseResult
          .customerInfo
          .entitlements
          .all['FeedDeck Premium']!
          .isActive) {
        if (!mounted) return;
        Provider.of<ProfileRepository>(
          context,
          listen: false,
        ).setTier(FDProfileTier.premium);
      }

      if (!mounted) return;
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          duration: Duration(seconds: 10),
          backgroundColor: Constants.primary,
          showCloseIcon: true,
          content: Text(
            'FeedDeck Premium was successfully purchased.',
            style: TextStyle(color: Constants.onPrimary),
          ),
        ),
      );
    } on PlatformException catch (err) {
      final errorCode = PurchasesErrorHelper.getErrorCode(err);
      if (errorCode == PurchasesErrorCode.purchaseCancelledError) {
        setState(() {
          _isLoading = false;
        });
        Navigator.of(context).pop();
      } else {
        setState(() {
          _isLoading = false;
        });
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            duration: const Duration(seconds: 10),
            backgroundColor: Constants.error,
            showCloseIcon: true,
            content: Text(
              'In-app purchase failed: ${err.message}',
              style: const TextStyle(color: Constants.onError),
            ),
          ),
        );
      }
    } catch (err) {
      setState(() {
        _isLoading = false;
      });
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          duration: const Duration(seconds: 10),
          backgroundColor: Constants.error,
          showCloseIcon: true,
          content: Text(
            'In-app purchase failed: ${err.toString()}',
            style: const TextStyle(color: Constants.onError),
          ),
        ),
      );
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    setState(() {
      _futureFetchOfferings = _fetchOfferings();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        shape: const Border(
          bottom: BorderSide(color: Constants.dividerColor, width: 1),
        ),
        title: const Text('FeedDeck Premium'),
        actions: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () {
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
      body: SafeArea(
        child: FutureBuilder(
          future: _futureFetchOfferings,
          builder: (BuildContext context, AsyncSnapshot<Offering?> snapshot) {
            return Column(
              children: [
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(Constants.spacingMiddle),
                    child: SingleChildScrollView(
                      child:
                          snapshot.connectionState == ConnectionState.none ||
                              snapshot.connectionState ==
                                  ConnectionState.waiting ||
                              snapshot.hasError ||
                              snapshot.data == null ||
                              snapshot.data?.monthly == null
                          ? const Text('Loading ...')
                          : MarkdownBody(
                              selectable: true,
                              data:
                                  '''
You are currently using the free version of FeedDeck, which allows you to add up
to 10 sources for the first 7 days. After that trial period your sources will
not be updated anymore.

To use FeedDeck after the trial period with up to 1000 sources, you need to
upgrade to a premium account. The premium account costs
${snapshot.data?.monthly?.storeProduct.priceString} per month and can be
canceled at any time.
''',
                            ),
                    ),
                  ),
                ),
                const SizedBox(height: Constants.spacingSmall),
                const Divider(
                  color: Constants.dividerColor,
                  height: 1,
                  thickness: 1,
                ),
                Padding(
                  padding: const EdgeInsets.all(Constants.spacingMiddle),
                  child: ElevatedButton.icon(
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
                    label: Text(
                      snapshot.data?.monthly?.storeProduct.priceString != null
                          ? 'Subscribe to FeedDeck Premium for ${snapshot.data?.monthly?.storeProduct.priceString}'
                          : 'Subscribe to FeedDeck Premium',
                    ),
                    onPressed:
                        snapshot.connectionState == ConnectionState.none ||
                            snapshot.connectionState ==
                                ConnectionState.waiting ||
                            snapshot.hasError ||
                            snapshot.data == null ||
                            snapshot.data?.monthly == null ||
                            _isLoading
                        ? null
                        : () => _purchase(snapshot.data!.monthly!),
                    icon:
                        snapshot.connectionState == ConnectionState.none ||
                            snapshot.connectionState ==
                                ConnectionState.waiting ||
                            snapshot.hasError ||
                            snapshot.data == null ||
                            snapshot.data?.monthly == null ||
                            _isLoading
                        ? const ElevatedButtonProgressIndicator()
                        : const Icon(FDIcons.feeddeck),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
