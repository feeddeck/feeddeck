import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/models/column.dart';
import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/source/add/add_source.dart';
import 'package:feeddeck/widgets/source/source_list_item.dart';

/// The [ColumnLayoutHeaderSettingsSources] widget is used to manage the sources
/// of a column. It is possible to add and remove sources from the column.
///
/// If the widget is used within a large screen the [openDrawer] parameter
/// should be defined and the [AddSource] widget will be opened in a drawer. If
/// the parameter is not defined (the widget is used within a small screen) the
/// [AddSource] widget will be opened in modal bottom sheet.
class ColumnLayoutHeaderSettingsSources extends StatefulWidget {
  const ColumnLayoutHeaderSettingsSources({
    super.key,
    required this.column,
    required this.openDrawer,
  });

  final FDColumn column;
  final void Function(Widget widget)? openDrawer;

  @override
  State<ColumnLayoutHeaderSettingsSources> createState() =>
      _ColumnLayoutHeaderSettingsSourcesState();
}

class _ColumnLayoutHeaderSettingsSourcesState
    extends State<ColumnLayoutHeaderSettingsSources> {
  /// [_buildSourcesList] returns a list of all sources of the current column.
  /// If the list of sources is empty it will return a [Container].
  ///
  /// Each source in the list also contains a delete item, which can be used to
  /// remove the source from the current column.
  List<Widget> _buildSourcesList() {
    if (widget.column.sources.isEmpty) {
      return [Container()];
    }

    List<Widget> columns = [];

    for (var i = 0; i < widget.column.sources.length; i++) {
      columns.add(
        SourceListItem(
          columnId: widget.column.id,
          source: widget.column.sources[i],
        ),
      );
    }

    return columns;
  }

  /// [_showAddSource] shows the [AddSource] widget within a modal bottom sheet
  /// or within the drawer when the [widget.openDrawer] function is provided.
  void _showAddSource() {
    if (widget.openDrawer != null) {
      widget.openDrawer!(AddSource(column: widget.column));
    } else {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        isDismissible: true,
        useSafeArea: true,
        backgroundColor: Colors.transparent,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(Constants.spacingMiddle),
          ),
        ),
        clipBehavior: Clip.antiAliasWithSaveLayer,
        constraints: const BoxConstraints(
          maxWidth: Constants.centeredFormMaxWidth,
        ),
        builder: (BuildContext context) {
          return AddSource(column: widget.column);
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    Provider.of<AppRepository>(context, listen: true);

    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        ConstrainedBox(
          constraints: const BoxConstraints(
            maxHeight: 275,
          ),
          child: ListView(
            padding: EdgeInsets.zero,
            shrinkWrap: true,
            children: [
              ..._buildSourcesList(),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Constants.secondary,
                  foregroundColor: Constants.onSecondary,
                  maximumSize: const Size.fromHeight(
                    Constants.elevatedButtonSize,
                  ),
                  minimumSize: const Size.fromHeight(
                    Constants.elevatedButtonSize,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                label: const Text('Add Source'),
                onPressed: () => _showAddSource(),
                icon: const Icon(
                  Icons.add,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
