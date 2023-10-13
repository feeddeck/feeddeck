import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/settings/profile/settings_profile_customer_portal.dart';
import 'package:feeddeck/widgets/settings/profile/settings_profile_delete_account.dart';
import 'package:feeddeck/widgets/settings/profile/settings_profile_email.dart';
import 'package:feeddeck/widgets/settings/profile/settings_profile_open_web_app.dart';
import 'package:feeddeck/widgets/settings/profile/settings_profile_password.dart';
import 'package:feeddeck/widgets/settings/profile/settings_profile_signout.dart';

/// The [SettingsProfile] displays the users current profile and allows a user
/// to edit his profile information, to sign out and to delete his account.
class SettingsProfile extends StatefulWidget {
  const SettingsProfile({super.key});

  @override
  State<SettingsProfile> createState() => _SettingsProfileState();
}

class _SettingsProfileState extends State<SettingsProfile> {
  @override
  Widget build(BuildContext context) {
    Provider.of<AppRepository>(context, listen: true);

    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Profile',
          style: TextStyle(
            fontSize: 20.0,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(
          height: Constants.spacingSmall,
        ),
        SettingsProfileEmail(),
        SettingsProfilePassword(),
        SettingsProfileCustomerPortal(),
        SettingsProfileOpenWebApp(),
        SettingsProfileSignOut(),
        SettingsProfileDeleteAccount(),
        SizedBox(
          height: Constants.spacingMiddle,
        ),
      ],
    );
  }
}
