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
  /// [_proxyDecorator] is used to highlight the source which is currently
  /// draged by the user.
  Widget _proxyDecorator(Widget child, int index, Animation<double> animation) {
    return Material(
      elevation: 0,
      color: Colors.transparent,
      child: Stack(
        children: [
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            bottom: 16,
            child: Material(
              borderRadius: BorderRadius.circular(16),
              elevation: 24,
              color: Colors.transparent,
            ),
          ),
          child,
        ],
      ),
    );
  }

  /// [_buildSourcesList] returns a list of all sources of the current column.
  /// If the list of sources is empty it will return a [Container].
  ///
  /// Each source in the list also contains a delete item, which can be used to
  /// remove the source from the current column.
  Widget _buildSourcesList() {
    if (widget.column.sources.isEmpty) {
      return Container();
    }

    return ReorderableListView.builder(
      shrinkWrap: true,
      buildDefaultDragHandles: false,
      physics: const NeverScrollableScrollPhysics(),
      onReorder: (int start, int current) {
        final AppRepository appRepository = Provider.of<AppRepository>(
          context,
          listen: false,
        );

        appRepository.updateSourcePositions(widget.column.id, start, current);
      },
      proxyDecorator: (Widget child, int index, Animation<double> animation) {
        return _proxyDecorator(child, index, animation);
      },
      itemCount: widget.column.sources.length,
      itemBuilder: (context, index) {
        return SourceListItem(
          key: Key(widget.column.sources[index].id),
          columnId: widget.column.id,
          sourceIndex: index,
          source: widget.column.sources[index],
        );
      },
    );
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
          constraints: const BoxConstraints(maxHeight: 275),
          child: ListView(
            padding: EdgeInsets.zero,
            shrinkWrap: true,
            children: [
              _buildSourcesList(),
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
                icon: const Icon(Icons.add),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
