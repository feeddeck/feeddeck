import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';

/// The [CreateDeck] widget is displayed when the user hasn't created any decks
/// yet. It will just display a [Form] where the user can enter a deck name and
/// a button to create the deck in full screen.
class CreateDeck extends StatefulWidget {
  const CreateDeck({super.key});

  @override
  State<CreateDeck> createState() => _CreateDeckState();
}

class _CreateDeckState extends State<CreateDeck> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  bool _isLoading = false;
  String _error = '';

  /// [_validateDeckName] validates the deck name provided via the [TextField]
  /// of the [_nameController]. The deck name field can not be empty and can not
  /// have more then 255 characters.
  String? _validateDeckName(String? value) {
    if (value == null || value.isEmpty) {
      return 'Name is required';
    }

    if (value.length > 255) {
      return 'Name is to long';
    }

    return null;
  }

  /// [_createDeck] validates the user provided deck name and calls the
  /// `createDeck` method of the [AppRepository] to create the deck. If the deck
  /// was created we will do nothing since the view should be automatically
  /// updated via the [DeckLayout] widget which listens to the [AppRepository]
  /// changes. If the method returns an error we will show this error via the
  /// [_error] state.
  Future<void> _createDeck() async {
    if (_formKey.currentState != null && _formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
        _error = '';
      });

      try {
        await Provider.of<AppRepository>(
          context,
          listen: false,
        ).createDeck(_nameController.text);

        setState(() {
          _isLoading = false;
          _error = '';
        });
      } catch (err) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to created deck: ${err.toString()}';
        });
      }
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

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          child: Container(
            constraints: const BoxConstraints(
              maxWidth: Constants.centeredFormMaxWidth,
            ),
            padding: const EdgeInsets.all(
              Constants.spacingMiddle,
            ),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(
                      bottom: Constants.spacingMiddle,
                    ),
                    child: RichText(
                      textAlign: TextAlign.center,
                      text: const TextSpan(
                        style: TextStyle(
                          color: Constants.onSurface,
                          fontSize: 14.0,
                        ),
                        children: [
                          TextSpan(
                            text: 'We\'re excited to have you onboard at ',
                          ),
                          TextSpan(
                            text: 'FeedDeck',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          TextSpan(
                            text:
                                '. We hope you enjoy your journey with us. If you have any questions or need assistance, feel free to reach out.',
                          ),
                        ],
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(
                      bottom: Constants.spacingMiddle,
                    ),
                    child: RichText(
                      textAlign: TextAlign.center,
                      text: const TextSpan(
                        style: TextStyle(
                          color: Constants.onSurface,
                          fontSize: 14.0,
                        ),
                        children: [
                          TextSpan(
                            text:
                                'Now it\'s time to create your first deck. A deck is a collection of columns and sources. Provide the name for your first deck and click on the ',
                          ),
                          TextSpan(
                            text: '"Create Deck"',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          TextSpan(
                            text: ' button.',
                          ),
                        ],
                      ),
                    ),
                  ),
                  TextFormField(
                    controller: _nameController,
                    keyboardType: TextInputType.text,
                    autocorrect: false,
                    enableSuggestions: false,
                    maxLines: 1,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      labelText: 'Name',
                    ),
                    validator: (value) => _validateDeckName(value),
                    onFieldSubmitted: (value) => _createDeck(),
                  ),
                  ..._buildError(),
                  const SizedBox(
                    height: Constants.spacingMiddle,
                  ),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      maximumSize: const Size.fromHeight(
                        Constants.elevatedButtonSize,
                      ),
                      minimumSize: const Size.fromHeight(
                        Constants.elevatedButtonSize,
                      ),
                    ),
                    label: const Text('Create Deck'),
                    onPressed: _isLoading ? null : () => _createDeck(),
                    icon: _isLoading
                        ? const ElevatedButtonProgressIndicator()
                        : const Icon(Icons.add),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
