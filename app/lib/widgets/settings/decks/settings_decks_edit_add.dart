import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';

/// The [SettingsDecksEditAdd] widget can be used to add a new deck.
class SettingsDecksEditAdd extends StatefulWidget {
  const SettingsDecksEditAdd({
    super.key,
    required this.closeEditMode,
  });

  final void Function() closeEditMode;

  @override
  State<SettingsDecksEditAdd> createState() => _SettingsDecksEditAddState();
}

class _SettingsDecksEditAddState extends State<SettingsDecksEditAdd> {
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
  /// [createDeck] function of the [AppRepository] to create a new deck. If the
  /// deck was created successfully the [closeEditMode] function is called to
  /// close the edit mode. If an error occurs the [_error] is set to the error
  /// message.
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
        widget.closeEditMode();
      } catch (err) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to create deck: ${err.toString()}';
        });
      }
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
  void dispose() {
    _nameController.dispose();
    super.dispose();
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
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => _createDeck(),
                    icon: _isLoading
                        ? const ElevatedButtonProgressIndicator()
                        : const Icon(Icons.add),
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
