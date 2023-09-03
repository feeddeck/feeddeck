import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/models/deck.dart';
import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';

/// The [SettingsDecksEditExisting] widget can be used to add a new deck.
class SettingsDecksEditExisting extends StatefulWidget {
  const SettingsDecksEditExisting({
    super.key,
    required this.deck,
    required this.closeEditMode,
  });

  final FDDeck deck;
  final void Function() closeEditMode;

  @override
  State<SettingsDecksEditExisting> createState() =>
      _SettingsDecksEditExistingState();
}

class _SettingsDecksEditExistingState extends State<SettingsDecksEditExisting> {
  final _formKey = GlobalKey<FormState>();
  String _deckName = '';
  bool _isLoading = false;
  String _error = '';

  /// [_validateDeckName] validates the deck name provided via the [TextField]
  /// for the deck name. The deck name field can not be empty and can not have
  /// more then 255 characters.
  String? _validateDeckName(String? value) {
    if (value == null || value.isEmpty) {
      return 'Name is required';
    }

    if (value.length > 255) {
      return 'Name is to long';
    }

    return null;
  }

  /// [_updateDeck] validates the entered deck name and if the validation
  /// succeeds it will update the name of the deck.
  Future<void> _updateDeck() async {
    if (_formKey.currentState != null && _formKey.currentState!.validate()) {
      _formKey.currentState?.save();
      setState(() {
        _isLoading = true;
        _error = '';
      });

      try {
        await Provider.of<AppRepository>(
          context,
          listen: false,
        ).updateDeck(widget.deck.id, _deckName);

        setState(() {
          _isLoading = false;
          _error = '';
        });
        widget.closeEditMode();
      } catch (err) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to update deck: ${err.toString()}';
        });
      }
    }
  }

  /// [_showDeleteDialog] creates a new dialog, which is shown before the deck
  /// can be deleted. This is done to raise the awareness that the deck,
  /// columns, sources and items which belongs to the deck will also be deleted.
  _showDeleteDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          insetPadding: EdgeInsets.symmetric(
            horizontal: MediaQuery.of(context).size.width >=
                    (Constants.centeredFormMaxWidth +
                        2 * Constants.spacingMiddle)
                ? (MediaQuery.of(context).size.width -
                        Constants.centeredFormMaxWidth) /
                    2
                : Constants.spacingMiddle,
          ),
          title: const Text('Delete Deck'),
          content: const Text(
            'Are you sure that you want to delete the deck. This can not be undone and will also delete all columns, sources, items and bookmarks which are related to the deck.',
          ),
          actions: [
            TextButton(
              child: const Text(
                'Cancel',
                style: TextStyle(color: Constants.onSurface),
              ),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            TextButton(
              onPressed: _isLoading ? null : () => _deleteDeck(),
              child: _isLoading
                  ? const ElevatedButtonProgressIndicator()
                  : const Text(
                      'Delete',
                      style: TextStyle(color: Constants.error),
                    ),
            ),
          ],
        );
      },
    );
  }

  /// [_deleteDeck] deletes the deck with the provided [widget.deck.id]. When
  /// the deck was deleted successfully we also close the edit mode. If we could
  /// not delete the deck we show an error message.
  ///
  /// When the action is triggered we also close the opened dialog.
  Future<void> _deleteDeck() async {
    Navigator.of(context).pop();
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      await Provider.of<AppRepository>(
        context,
        listen: false,
      ).deleteDeck(widget.deck.id);

      setState(() {
        _isLoading = false;
        _error = '';
      });
      widget.closeEditMode();
    } catch (err) {
      setState(() {
        _isLoading = false;
        _error = 'Failed to delete deck: ${err.toString()}';
      });
    }
  }

  /// [_buildError] returns a widget to display the [_error] when it is not an
  /// empty string.
  Widget _buildError() {
    if (_error != '') {
      return Padding(
        padding: const EdgeInsets.only(
          bottom: Constants.spacingMiddle,
          left: Constants.spacingMiddle,
          right: Constants.spacingMiddle,
        ),
        child: Text(
          _error,
          style: const TextStyle(
            color: Constants.error,
          ),
        ),
      );
    }

    return Container();
  }

  @override
  Widget build(BuildContext context) {
    return Card(
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
            child: Form(
              key: _formKey,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TextFormField(
                          initialValue: widget.deck.name,
                          onSaved: (String? value) {
                            _deckName = value ?? widget.deck.name;
                          },
                          keyboardType: TextInputType.text,
                          autocorrect: false,
                          enableSuggestions: false,
                          maxLines: 1,
                          decoration: const InputDecoration(
                            border: OutlineInputBorder(),
                            labelText: 'Name',
                          ),
                          validator: (value) => _validateDeckName(value),
                          onFieldSubmitted: (value) => _updateDeck(),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: _isLoading ? null : () => _updateDeck(),
                    icon: _isLoading
                        ? const ElevatedButtonProgressIndicator()
                        : const Icon(Icons.save),
                  ),
                  IconButton(
                    onPressed: () => _showDeleteDialog(),
                    icon: _isLoading
                        ? const ElevatedButtonProgressIndicator()
                        : const Icon(Icons.delete),
                  ),
                ],
              ),
            ),
          ),
          _buildError(),
        ],
      ),
    );
  }
}
