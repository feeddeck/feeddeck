import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/repositories/items_repository.dart';
import 'package:feeddeck/utils/constants.dart';

/// The [SettingsDecksSelect] widget shows a list of the users decks, when the
/// user clicks on one of the decks in the list it will be set as the active one
/// and the user is redirected to the decks view.
class SettingsDecksSelect extends StatefulWidget {
  const SettingsDecksSelect({super.key});

  @override
  State<SettingsDecksSelect> createState() => _SettingsDecksSelectState();
}

class _SettingsDecksSelectState extends State<SettingsDecksSelect> {
  /// [_selectDeck] sets the provided [deckId] as the active deck. The active
  /// deck is updated via the [selectDeck] method of the [AppRepository]. When
  /// the active deck is updated the user is redirected to the decks view.
  ///
  /// Before the active deck is changed the [ItemsRepositoryStore] is cleared,
  /// to trigger a reload of the items once the deck is loaded.
  Future<void> _selectDeck(String deckId) async {
    try {
      ItemsRepositoryStore().clear();

      await Provider.of<AppRepository>(context, listen: false)
          .selectDeck(deckId);
      if (!mounted) return;
      Navigator.of(context).pop();
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    AppRepository app = Provider.of<AppRepository>(context, listen: true);

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: app.decks.length,
      itemBuilder: (context, index) {
        return MouseRegion(
          cursor: SystemMouseCursors.click,
          child: GestureDetector(
            onTap: () => _selectDeck(app.decks[index].id),
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
                                Characters(app.decks[index].name)
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
                        const Icon(Icons.chevron_right),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
