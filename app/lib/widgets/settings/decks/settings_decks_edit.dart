import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/widgets/settings/decks/settings_decks_edit_add.dart';
import 'package:feeddeck/widgets/settings/decks/settings_decks_edit_existing.dart';

/// The [SettingsDecksEdit] widget shows a list of the users decks. In the list
/// the user can change the name of a deck or delete a deck. It is also possible
/// to add new decks.
class SettingsDecksEdit extends StatelessWidget {
  const SettingsDecksEdit({
    super.key,
    required this.closeEditMode,
  });

  final void Function() closeEditMode;

  @override
  Widget build(BuildContext context) {
    AppRepository app = Provider.of<AppRepository>(context, listen: true);

    return Column(
      children: [
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: app.decks.length,
          itemBuilder: (context, index) {
            return SettingsDecksEditExisting(
              deck: app.decks[index],
              closeEditMode: closeEditMode,
            );
          },
        ),
        SettingsDecksEditAdd(
          closeEditMode: closeEditMode,
        ),
      ],
    );
  }
}
