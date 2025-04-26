import 'package:flutter/material.dart';

import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/settings/app_settings/app_settings_export.dart';
import 'package:feeddeck/widgets/settings/app_settings/app_settings_import.dart';

/// The [SettSettingsAppSettings] widget is used to display a list of all
/// available app settings, which can be used to customize the app by the user
/// and to import and export data.
class SettingsAppSettings extends StatelessWidget {
  const SettingsAppSettings({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'App Settings',
          style: TextStyle(fontSize: 20.0, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: Constants.spacingSmall),
        SettingsAppSettingsExport(),
        SettingsAppSettingsImport(),
        SizedBox(height: Constants.spacingMiddle),
      ],
    );
  }
}
