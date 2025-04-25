import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/repositories/profile_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/settings/accounts/settings_accounts.dart';
import 'package:feeddeck/widgets/settings/app_settings/app_settings.dart';
import 'package:feeddeck/widgets/settings/decks/settings_decks.dart';
import 'package:feeddeck/widgets/settings/premium/settings_premium.dart';
import 'package:feeddeck/widgets/settings/profile/settings_profile.dart';
import 'package:feeddeck/widgets/settings/settings_info.dart';

/// The [Settings] widget implements the settings page for the FeedDeck app. The
/// page is used to display all the users information and to provide a way where
/// a user can edit his information. For example it is possible to adjust the
/// decks, the email address or to connect accounts via the [Settings] page.
class Settings extends StatefulWidget {
  const Settings({super.key});

  @override
  State<Settings> createState() => _SettingsState();
}

class _SettingsState extends State<Settings> {
  @override
  void initState() {
    super.initState();

    /// Initialize the profile repository by calling the `init` function. To not
    /// call the function multiple times we set the `force` parameter to
    /// `false`.
    WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
      Provider.of<ProfileRepository>(
        context,
        listen: false,
      ).init(false).then((_) => {});
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Constants.surface,
      child: SafeArea(
        child: Scaffold(
          appBar: AppBar(title: const Text('Settings')),
          body: SingleChildScrollView(
            child: Center(
              child: Container(
                constraints: const BoxConstraints(
                  maxWidth: Constants.centeredFormMaxWidth,
                ),
                padding: const EdgeInsets.all(Constants.spacingMiddle),
                child: const Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SettingsPremium(),

                    /// Display all decks. Here the user can switch the active
                    /// deck, he can delete a deck or update the name of a
                    /// deck.
                    SettingsDecks(),

                    /// Display a list of all accounts which can be added by a
                    /// user and the status of the account. An account can be
                    /// `connected` or `not connected`.
                    SettingsAccounts(),

                    /// Display the profile information of the user. Here the
                    /// user can update his email address and password or delete
                    /// his account.
                    SettingsProfile(),

                    /// Display the app settings. Here the user can customize
                    /// the app and import / export data.
                    SettingsAppSettings(),

                    /// Display some general information about the app, like the
                    /// version and the link to our website.
                    SettingsInfo(),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
