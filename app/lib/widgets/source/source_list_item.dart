import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';

/// [SourceListItem] can be used to show the source within a list of sources.
/// This widget should for example be used to show the list of sources in the
/// create column or column settings widget.
class SourceListItem extends StatefulWidget {
  const SourceListItem({
    super.key,
    required this.columnId,
    required this.source,
  });

  final String columnId;
  final FDSource source;
  @override
  State<SourceListItem> createState() => _SourceListItemState();
}

class _SourceListItemState extends State<SourceListItem> {
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
            'Delete Source',
          ),
          content: const Text(
            'Do you really want to delete this source? This can not be undone and will also delete all items and bookmarks related to this source.',
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
              onPressed: _isLoading ? null : () => _deleteSource(),
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

  /// [_deleteSource] deletes the source with the provided [sourceId] from the
  /// current column.
  Future<void> _deleteSource() async {
    Navigator.of(context).pop();

    setState(() {
      _isLoading = true;
    });

    try {
      AppRepository app = Provider.of<AppRepository>(context, listen: false);
      await app.deleteSource(widget.columnId, widget.source.id);
    } catch (_) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          duration: Duration(seconds: 10),
          backgroundColor: Constants.error,
          showCloseIcon: true,
          content: Text(
            'Source could not be deleted. Please try again later.',
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
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        Characters(widget.source.title)
                            .replaceAll(Characters(''), Characters('\u{200B}'))
                            .toString(),
                        maxLines: 1,
                        style: const TextStyle(
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(
                        Characters(
                          widget.source.type.toLocalizedString(),
                        )
                            .replaceAll(Characters(''), Characters('\u{200B}'))
                            .toString(),
                        maxLines: 1,
                        style: const TextStyle(
                          overflow: TextOverflow.ellipsis,
                          fontSize: 10.0,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => _showDeleteDialog(),
                  icon: _isLoading
                      ? const ElevatedButtonProgressIndicator()
                      : const Icon(
                          Icons.delete,
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
