import 'package:flutter/material.dart';

import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/settings/decks/settings_decks_edit.dart';
import 'package:feeddeck/widgets/settings/decks/settings_decks_select.dart';

/// The [SettingsDecks] widget is used to manage the all sessions of a user,
/// e.g. it is possible to delete an active session, which might be helpful
/// when the user lost access to the device where he was authenticated.
class SettingsDecks extends StatefulWidget {
  const SettingsDecks({super.key});

  @override
  State<SettingsDecks> createState() => _SettingsDecksState();
}

class _SettingsDecksState extends State<SettingsDecks> {
  bool _editMode = false;

  /// [_buildDecksList] returns a list of decks where the user can switch the
  /// active deck or a list of decks where the user can adjust the name of a
  /// deck or delete a deck.
  Widget _buildDecksList() {
    if (_editMode) {
      return SettingsDecksEdit(
        closeEditMode: () {
          setState(() {
            _editMode = false;
          });
        },
      );
    }

    return const SettingsDecksSelect();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Expanded(
              child: Text(
                'Decks',
                style: TextStyle(
                  fontSize: 20.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            IconButton(
              onPressed: () {
                setState(() {
                  _editMode = !_editMode;
                });
              },
              icon: _editMode
                  ? const Icon(Icons.cancel)
                  : const Icon(
                      Icons.edit,
                    ),
            ),
          ],
        ),
        const SizedBox(
          height: Constants.spacingSmall,
        ),
        _buildDecksList(),
        const SizedBox(
          height: Constants.spacingMiddle,
        ),
      ],
    );
  }
}
