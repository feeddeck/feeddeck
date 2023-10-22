import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/models/column.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/repositories/items_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/column/header/column_layout_header_settings.dart';
import 'package:feeddeck/widgets/source/source_icon.dart';

/// The [ColumnLayoutHeader] widget is the header of a single column. It is used
/// to display the name of a column, a icon and some actions. The actions which
/// are currently available are:
///
///   - Reload all items in the column
///   - Mark all items as read / unread
///   - Show / hide settings of the column
class ColumnLayoutHeader extends StatefulWidget {
  const ColumnLayoutHeader({
    super.key,
    required this.column,
    required this.openDrawer,
  });

  final FDColumn column;
  final void Function(Widget widget)? openDrawer;

  @override
  State<ColumnLayoutHeader> createState() => _ColumnLayoutHeaderState();
}

class _ColumnLayoutHeaderState extends State<ColumnLayoutHeader> {
  bool _isLoadingMarkAllAsReadUnread = false;
  double? _showSettings = 0.0;

  /// [_markAllAsReadUnread] is called to mark all items in a column as read /
  /// unread.
  ///
  /// When the column contains at least one item with `isRead` set to `false` it
  /// will mark all items which as read.
  ///
  /// When the column contains no unread items (`isRead == true`) it will mark
  /// all read items as unread.
  Future<void> _markAllAsReadUnread() async {
    setState(() {
      _isLoadingMarkAllAsReadUnread = true;
    });

    try {
      ItemsRepository items =
          Provider.of<ItemsRepository>(context, listen: false);

      if (items.items
          .where((item) => item.isRead == false)
          .toList()
          .isNotEmpty) {
        await items.updateReadStates(
          items.items
              .where((item) => item.isRead == false)
              .map((item) => item.id)
              .toList(),
          true,
        );
      } else {
        await items.updateReadStates(
          items.items
              .where((item) => item.isRead == true)
              .map((item) => item.id)
              .toList(),
          false,
        );
      }
    } catch (_) {}

    setState(() {
      _isLoadingMarkAllAsReadUnread = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    ItemsRepository items = Provider.of<ItemsRepository>(context, listen: true);

    return Column(
      children: [
        AppBar(
          automaticallyImplyLeading: false,
          leading: Padding(
            padding: const EdgeInsets.all(
              Constants.spacingSmall + Constants.spacingExtraSmall,
            ),
            child: SourceIcon(
              type: items.column.sources.isNotEmpty
                  ? items.column.sources[0].type
                  : FDSourceType.none,
              icon: items.column.sources.isNotEmpty
                  ? items.column.sources[0].icon
                  : null,
              size: 36,
            ),
          ),
          centerTitle: false,
          backgroundColor: Constants.background,
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                Characters(items.column.name)
                    .replaceAll(
                      Characters(''),
                      Characters('\u{200B}'),
                    )
                    .toString(),
                textAlign: TextAlign.left,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Text(
                Characters(
                  '${items.column.sources.length} ${items.column.sources.length == 1 ? 'Source' : 'Sources'} / ${items.items.length}${items.status == ItemsStatus.loaded ? '+' : ''} ${items.items.length == 1 ? 'Item' : 'Items'}',
                )
                    .replaceAll(
                      Characters(''),
                      Characters('\u{200B}'),
                    )
                    .toString(),
                textAlign: TextAlign.left,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.normal,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          shape: const Border(
            bottom: BorderSide(
              color: Constants.dividerColor,
              width: 1,
            ),
          ),
          actions: [
            /// The reload button is used to reload all items via the `reload`
            /// function of the [ItemsRepository]. This will also reset all user
            /// defined filters.
            IconButton(
              icon: items.status == ItemsStatus.loading
                  ? Container(
                      width: 20,
                      height: 20,
                      padding: const EdgeInsets.all(2.0),
                      child: const CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 3,
                      ),
                    )
                  : const Icon(Icons.refresh, size: 20.0),
              onPressed: items.status == ItemsStatus.loading
                  ? null
                  : () => items.reload(),
            ),

            /// The mark all items as read / unread will call the
            /// [_markAllAsReadUnread] function to mark all items as read or
            /// unread. If the list contains a unread items we display the
            /// [Icons.visibility] icon, if the column contains at lead one read
            /// item we will display the [Icons.visibility_off] icon. By default
            /// the [Icons.visibility] icon is displayed.
            IconButton(
              icon: items.items
                      .where((item) => item.isRead == false)
                      .toList()
                      .isNotEmpty
                  ? const Icon(
                      Icons.visibility,
                      size: 20.0,
                    )
                  : items.items
                          .where((item) => item.isRead == true)
                          .toList()
                          .isNotEmpty
                      ? const Icon(
                          Icons.visibility_off,
                          size: 20.0,
                        )
                      : const Icon(
                          Icons.visibility,
                          size: 20.0,
                        ),
              onPressed: items.items.isEmpty || _isLoadingMarkAllAsReadUnread
                  ? null
                  : () => _markAllAsReadUnread(),
            ),

            /// The settings button is used to show / hide the settings for the
            /// column. To display the settings the [_showSettings] state must
            /// be set to `null`. To hide the settings the state must be set to
            /// `0.0`.
            IconButton(
              icon: const Icon(Icons.settings, size: 20.0),
              onPressed: () {
                setState(() {
                  _showSettings = _showSettings == 0.0 ? null : 0.0;
                });
              },
            ),
          ],
        ),
        AnimatedSize(
          duration: const Duration(milliseconds: 300),
          child: Container(
            width: double.infinity,
            height: _showSettings,
            decoration: const BoxDecoration(
              color: Constants.backgroundContainerBackgroundColor,
            ),
            padding: const EdgeInsets.all(Constants.spacingMiddle),
            child: ColumnLayoutHeaderSettings(
              column: widget.column,
              openDrawer: widget.openDrawer,
            ),
          ),
        ),
      ],
    );
  }
}
