import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/models/column.dart';
import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';

/// The [ColumnLayoutHeaderSettingsUpdateColumn] widget is used to update the
/// column name.
class ColumnLayoutHeaderSettingsUpdateColumn extends StatefulWidget {
  const ColumnLayoutHeaderSettingsUpdateColumn({
    super.key,
    required this.column,
  });

  final FDColumn column;

  @override
  State<ColumnLayoutHeaderSettingsUpdateColumn> createState() =>
      _ColumnLayoutHeaderSettingsUpdateColumnState();
}

class _ColumnLayoutHeaderSettingsUpdateColumnState
    extends State<ColumnLayoutHeaderSettingsUpdateColumn> {
  final _formKey = GlobalKey<FormState>();
  String _columnName = '';
  bool _isLoading = false;
  String _error = '';

  /// [_validateColumnName] validates the column name provided via the
  /// [TextField]. The column name field can not be empty and can not have more
  /// then 255 characters.
  String? _validateColumnName(String? value) {
    if (value == null || value.isEmpty) {
      return 'Name is required';
    }

    if (value.length > 255) {
      return 'Name is to long';
    }

    return null;
  }

  /// [_updateColumn] is called to update the name of a column. The column name
  /// can be changed via the [_columnName] state. Before we call the
  /// corresponsing API endpoint to update the column name we validate it's new
  /// value.
  ///
  /// If the update of the column fails the [_error] state is set. When the
  /// update succeeds we do nothing.
  Future<void> _updateColumn() async {
    if (_formKey.currentState != null && _formKey.currentState!.validate()) {
      _formKey.currentState?.save();

      setState(() {
        _isLoading = true;
        _error = '';
      });

      try {
        await Provider.of<AppRepository>(context, listen: false)
            .updateColumn(widget.column.id, _columnName);

        setState(() {
          _isLoading = false;
          _error = '';
        });
      } catch (err) {
        setState(() {
          _isLoading = true;
          _error = 'Failed to update column: ${err.toString()}';
        });
      }
    }
  }

  /// [_buildError] returns a widget to display the [_error] when it is not an
  /// empty string.
  List<Widget> _buildError() {
    if (_error != '') {
      return [
        const SizedBox(height: Constants.spacingMiddle),
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
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Form(
          key: _formKey,
          child: TextFormField(
            initialValue: widget.column.name,
            onSaved: (String? value) {
              _columnName = value ?? widget.column.name;
            },
            keyboardType: TextInputType.text,
            autocorrect: false,
            enableSuggestions: false,
            maxLines: 1,
            decoration: InputDecoration(
              hintText: 'Name',
              suffixIcon: IconButton(
                onPressed: () => _updateColumn(),
                icon: _isLoading
                    ? const ElevatedButtonProgressIndicator()
                    : const Icon(Icons.save),
              ),
            ),
            validator: (value) => _validateColumnName(value),
            onFieldSubmitted: (value) => _updateColumn(),
          ),
        ),
        ..._buildError(),
      ],
    );
  }
}
