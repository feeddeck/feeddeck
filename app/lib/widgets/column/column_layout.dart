import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/models/column.dart';
import 'package:feeddeck/repositories/items_repository.dart';
import 'package:feeddeck/widgets/column/header/column_layout_header.dart';
import 'package:feeddeck/widgets/column/list/column_layout_list.dart';
import 'package:feeddeck/widgets/column/loading/column_layout_loading.dart';
import 'package:feeddeck/widgets/column/search/column_layout_search.dart';

/// The [ColumnLayout] widget defines the layout of a single column in a deck.
/// The widget must be usable for small and large screens.
///
/// To use the widget a column must be set via the [column] parameter. The
/// [openDrawer] parameter defines an optional function for large screen, to
/// open the passed in widget in a drawer.
class ColumnLayout extends StatelessWidget {
  const ColumnLayout({
    super.key,
    required this.column,
    required this.openDrawer,
  });

  final FDColumn column;
  final void Function(Widget widget)? openDrawer;

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: ItemsRepository(column: column),
      child: Column(
        children: [
          ColumnLayoutHeader(
            column: column,
            openDrawer: openDrawer,
          ),
          const ColumnLayoutSearch(),
          const ColumnLayoutLoading(),
          const ColumnLayoutList(),
        ],
      ),
    );
  }
}
