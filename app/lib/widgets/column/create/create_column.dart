import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';

/// The [CreateColumn] widget is used to create a new column. The user must
/// provide a name for the column within the widget. If the column was created
/// successfully the widget is closed. If the creation of the column failed, an
/// error message is shown.
class CreateColumn extends StatefulWidget {
  const CreateColumn({super.key});

  @override
  State<CreateColumn> createState() => _CreateColumnState();
}

class _CreateColumnState extends State<CreateColumn> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  bool _isLoading = false;
  String _error = '';

  /// [_validateColumnName] validates the column name provided via the
  /// [TextField] of the [_nameController]. The column name field can not be
  /// empty and can not have more then 255 characters.
  String? _validateColumnName(String? value) {
    if (value == null || value.isEmpty) {
      return 'Name is required';
    }

    if (value.length > 255) {
      return 'Name is to long';
    }

    return null;
  }

  /// [_createColumn] creates a new column with the user selected name. If the
  /// column was created the widget is closed. If the creation of the column
  /// failed, an error message is shown.
  Future<void> _createColumn() async {
    if (_formKey.currentState != null && _formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      try {
        await Provider.of<AppRepository>(
          context,
          listen: false,
        ).createColumn(_nameController.text);

        setState(() {
          _isLoading = false;
          _error = '';
        });

        if (!mounted) return;
        Navigator.of(context).pop();
      } catch (err) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to create column: ${err.toString()}';
        });
      }
    }
  }

  /// [_buildError] returns a widget to display the [_error] when it is not an
  /// empty string.
  Widget _buildError() {
    if (_error != '') {
      return Padding(
        padding: const EdgeInsets.all(Constants.spacingMiddle),
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
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text('Create Column'),
        shape: const Border(
          bottom: BorderSide(
            color: Constants.dividerColor,
            width: 1,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.close,
            ),
            onPressed: () {
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(Constants.spacingMiddle),
                children: [
                  /// Display the form, where the user must enter the name of the
                  /// column which should be created. We will also call the
                  /// [_createColumn] function when the user presses enter in the
                  /// column name [TextFormField].
                  Form(
                    key: _formKey,
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
                          validator: (value) => _validateColumnName(value),
                          onFieldSubmitted: (value) => _createColumn(),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(
              height: Constants.spacingSmall,
            ),
            const Divider(
              color: Constants.dividerColor,
              height: 1,
              thickness: 1,
            ),
            _buildError(),
            Padding(
              padding: const EdgeInsets.all(Constants.spacingMiddle),
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  maximumSize: const Size.fromHeight(
                    Constants.elevatedButtonSize,
                  ),
                  minimumSize: const Size.fromHeight(
                    Constants.elevatedButtonSize,
                  ),
                ),
                label: const Text('Create Column'),
                onPressed: _isLoading ? null : () => _createColumn(),
                icon: _isLoading
                    ? const ElevatedButtonProgressIndicator()
                    : const Icon(Icons.add),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
