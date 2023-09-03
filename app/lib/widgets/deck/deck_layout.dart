import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/deck/actions/create_deck.dart';
import 'package:feeddeck/widgets/deck/actions/select_deck.dart';
import 'package:feeddeck/widgets/deck/deck_layout_large.dart';
import 'package:feeddeck/widgets/deck/deck_layout_small.dart';

/// The [DeckLayout] is the main screen of the app for authenticated users. It
/// displayes a single deck with all columns of the deck and the items in each
/// column.
///
/// For screens smaller with a width smaller then our breakpoint the deck is
/// displayed via tabs. The user can then select a column from a tab bar
/// displayed at the bottom of the screen.
///
/// For screens with a width larger then our breakpoint the deck is displayed
/// with a navigation rail on the left side. When a user selects a column in the
/// navigation rail the view is scrolled to this colum.
///
/// If the user doesn't have any decks created yet, the [CreateDeck] widget is
/// displayed so that a user must create a deck first. If deck is created, the
/// view will automatically be updated, because we subscribed to all changed in
/// the [AppRepository].
///
/// If the user doesn't have an active deck yet, the [SelectDeck] widget is
/// displayed so that a user can select an active deck he wants to use. If deck
/// was selected, the view will automatically be updated, because we subscribed
/// to all changed in the [AppRepository].
class DeckLayout extends StatelessWidget {
  const DeckLayout({super.key});

  @override
  Widget build(BuildContext context) {
    AppRepository app = Provider.of<AppRepository>(context, listen: true);
    bool useTabs = MediaQuery.of(context).size.width < Constants.breakpoint;

    if (app.status == FDAppStatus.uninitialized) {
      return const Scaffold(
        body: Center(
          child: SingleChildScrollView(
            child: CircularProgressIndicator(),
          ),
        ),
      );
    }

    if (app.decks.isEmpty) {
      return const CreateDeck();
    }

    if (app.activeDeckId == null) {
      return const SelectDeck();
    }

    if (useTabs) return const DeckLayoutSmall();
    return const DeckLayoutLarge();
  }
}
