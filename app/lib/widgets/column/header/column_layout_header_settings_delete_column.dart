import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/models/column.dart';
import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';

/// The [ColumnLayoutHeaderSettingsDeleteColumn] displays a button to delete the
/// current column. Before the column is deleted we display a dialog, to make
/// sure that a user is aware that he will lost to all the sources and items of
/// this column.
class ColumnLayoutHeaderSettingsDeleteColumn extends StatefulWidget {
  const ColumnLayoutHeaderSettingsDeleteColumn({
    super.key,
    required this.column,
  });

  final FDColumn column;

  @override
  State<ColumnLayoutHeaderSettingsDeleteColumn> createState() =>
      _ColumnLayoutHeaderSettingsDeleteColumnState();
}

class _ColumnLayoutHeaderSettingsDeleteColumnState
    extends State<ColumnLayoutHeaderSettingsDeleteColumn> {
  bool _isLoading = false;

  /// [_showDeleteDialog] creates a new dialog, which is shown before the column
  /// can be deleted. This is done to raise the awareness that the column,
  /// sources and items which belongs to the column will also be deleted.
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
          title: const Text(
            'Delete Column',
          ),
          content: const Text(
            'Do you really want to delete this column? This can not be undone and will also delete all sources, items and bookmarks related to this column.',
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
              onPressed: _isLoading ? null : () => _deleteColumn(),
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

  /// [_deleteColumn] deletes the current column, by calling the corresponding
  /// `deleteColumn` method of the [AppRepository].
  ///
  /// When the action is triggered we also close the opened dialog.
  Future<void> _deleteColumn() async {
    Navigator.of(context).pop();

    setState(() {
      _isLoading = true;
    });

    try {
      await Provider.of<AppRepository>(context, listen: false)
          .deleteColumn(widget.column.id);
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          duration: Duration(seconds: 10),
          backgroundColor: Constants.error,
          showCloseIcon: true,
          content: Text(
            'Column could not be deleted. Please try again later.',
            style: TextStyle(color: Constants.onError),
          ),
        ),
      );
    }

    setState(() {
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: () => _showDeleteDialog(),
      icon: _isLoading
          ? const ElevatedButtonProgressIndicator()
          : const Icon(Icons.delete),
    );
  }
}
