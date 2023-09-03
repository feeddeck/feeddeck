import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/models/column.dart';
import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/column/header/column_layout_header_settings_delete_column.dart';
import 'package:feeddeck/widgets/column/header/column_layout_header_settings_sources.dart';
import 'package:feeddeck/widgets/column/header/column_layout_header_settings_update_column.dart';

/// The [ColumnLayoutHeaderSettings] widget is used to display the settings for
/// a column. This is also the place where a user can change the name of column,
/// the column position, delete a column or add / remove sources for the column.
///
/// The widget must be displayed within a [ColumnLayoutHeader] widget.
class ColumnLayoutHeaderSettings extends StatelessWidget {
  const ColumnLayoutHeaderSettings({
    super.key,
    required this.column,
    required this.openDrawer,
  });

  final FDColumn column;
  final void Function(Widget widget)? openDrawer;

  /// [_updateColumnPositions] is called to update the position of the current
  /// column, by switching it's position with the column which is on the left
  /// side or right side.
  ///
  /// The first position is the position of the current column and the second
  /// position is the position where the column should be moved to.
  Future<void> _updateColumnPositions(
    BuildContext context,
    int position1,
    int position2,
  ) async {
    try {
      AppRepository app = Provider.of<AppRepository>(context, listen: false);
      await app.updateColumnPositions(
        position1,
        position2,
      );
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    AppRepository app = Provider.of<AppRepository>(context, listen: true);
    final columnIndex = app.columns.indexWhere(
      (c) => c.id == column.id,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ColumnLayoutHeaderSettingsUpdateColumn(column: column),
        const SizedBox(
          height: Constants.spacingLarge,
        ),
        ColumnLayoutHeaderSettingsSources(
          column: column,
          openDrawer: openDrawer,
        ),
        const SizedBox(
          height: Constants.spacingLarge,
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            /// Display the icon to move the current column to the left. If it
            /// is the first column in the deck, the button will be disabled.
            IconButton(
              onPressed: columnIndex == 0
                  ? null
                  : () => _updateColumnPositions(
                        context,
                        columnIndex,
                        columnIndex - 1,
                      ),
              icon: const Icon(Icons.chevron_left),
            ),

            /// Between the buttons to move the column to the left / right we
            /// display an icon to delete the column.
            ColumnLayoutHeaderSettingsDeleteColumn(
              column: column,
            ),

            /// Display the icon to move the current column to the right. If it
            /// is the last column in the deck, the button will be disabled.
            IconButton(
              onPressed: columnIndex == app.columns.length - 1
                  ? null
                  : () => _updateColumnPositions(
                        context,
                        columnIndex,
                        columnIndex + 1,
                      ),
              icon: const Icon(Icons.chevron_right),
            ),
          ],
        )
      ],
    );
  }
}
