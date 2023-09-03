import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/repositories/profile_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/settings/accounts/settings_accounts_github.dart';

/// The [SettingsAccounts] widget implements the accounts section of the
/// settings page. Here the user can connect accounts to his profile or he can
/// disconnect accounts from his profile.
class SettingsAccounts extends StatelessWidget {
  const SettingsAccounts({super.key});

  @override
  Widget build(BuildContext context) {
    ProfileRepository profile = Provider.of<ProfileRepository>(
      context,
      listen: true,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Expanded(
              child: Text(
                'Accounts',
                style: TextStyle(
                  fontSize: 20.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            IconButton(
              onPressed: () {
                profile.init(true);
              },
              icon: const Icon(Icons.refresh),
            ),
          ],
        ),
        const SizedBox(
          height: Constants.spacingSmall,
        ),
        const SettingsAccountsGithub(),
        const SizedBox(
          height: Constants.spacingMiddle,
        ),
      ],
    );
  }
}
