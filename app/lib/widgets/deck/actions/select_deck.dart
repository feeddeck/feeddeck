import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/utils/constants.dart';

/// The [SelectDeck] widget should be displayed when the user has created a list
/// of decks but didn't selected an active deck yet.
class SelectDeck extends StatefulWidget {
  const SelectDeck({super.key});

  @override
  State<SelectDeck> createState() => _SelectDeckState();
}

class _SelectDeckState extends State<SelectDeck> {
  bool _isLoading = false;
  String _error = '';

  /// [_selectDeck] sets the selected deck as the users active deck. When the
  /// call of the `selectDeck` succeeds we do nothing, since the view should be
  /// automatically updated via the [DeckLayout] widget which listens to the
  /// [AppRepository] changes. If the method returns an error we will show this
  /// error via the [_error] state.
  Future<void> _selectDeck(String deckID) async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      await Provider.of<AppRepository>(context, listen: false)
          .selectDeck(deckID);

      setState(() {
        _isLoading = false;
        _error = '';
      });
    } catch (err) {
      setState(() {
        _isLoading = false;
        _error = 'Failed to select deck: ${err.toString()}';
      });
    }
  }

  /// [_buildError] returns a widget to display the [_error] when it is not an
  /// empty string.
  List<Widget> _buildError() {
    if (_error != '') {
      return [
        const SizedBox(
          height: Constants.spacingMiddle,
        ),
        Text(
          _error,
          style: const TextStyle(
            color: Constants.error,
          ),
        ),
      ];
    }

    return [];
  }

  /// [_buildDecksList] builds a list with all the users decks. The user can
  /// then click on one of the items in the list to select is active deck. When
  /// the user clicks on a item in the list the [_selectDeck] action is called.
  ///
  /// When the [_isLoading] state is true, we will display a full screen circular
  /// progress indicator.
  List<Widget> _buildDecksList() {
    AppRepository app = Provider.of<AppRepository>(context, listen: false);

    if (_isLoading) {
      return const [CircularProgressIndicator()];
    }

    final List<Widget> widgets = [];
    for (var deck in app.decks) {
      widgets.add(
        MouseRegion(
          cursor: SystemMouseCursors.click,
          child: GestureDetector(
            onTap: () => _selectDeck(deck.id),
            child: Card(
              color: Constants.secondary,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(
                      Constants.spacingMiddle,
                    ),
                    child: Text(deck.name),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return widgets;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Constants.background,
      child: SafeArea(
        child: Scaffold(
          body: Center(
            child: SingleChildScrollView(
              child: Container(
                constraints: const BoxConstraints(
                  maxWidth: Constants.centeredFormMaxWidth,
                ),
                padding: const EdgeInsets.all(
                  Constants.spacingMiddle,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ..._buildDecksList(),
                    ..._buildError(),
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
