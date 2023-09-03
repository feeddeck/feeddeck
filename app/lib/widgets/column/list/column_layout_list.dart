import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/repositories/items_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/column/list/column_layout_load_more.dart';
import 'package:feeddeck/widgets/column/list/column_layout_sources.dart';
import 'package:feeddeck/widgets/item/preview/item_preview.dart';

/// The [ColumnLayoutList] displays the list of all items for a column. The list
/// also contains all column sources as the first item ([ColumnLayoutSources]
/// widget) and the load more button as the last item ([ColumnLayoutLoadMore]
/// widget).
class ColumnLayoutList extends StatelessWidget {
  const ColumnLayoutList({super.key});

  @override
  Widget build(BuildContext context) {
    ItemsRepository items = Provider.of<ItemsRepository>(context, listen: true);

    if (items.column.sources.isEmpty) {
      return Expanded(
        child: Padding(
          padding: const EdgeInsets.all(Constants.spacingMiddle),
          child: RichText(
            textAlign: TextAlign.center,
            text: const TextSpan(
              style: TextStyle(
                color: Constants.onSurface,
                fontSize: 14.0,
              ),
              children: [
                TextSpan(
                  text:
                      'Add you first source to the column by clicking on the settings icon (',
                ),
                WidgetSpan(
                  child: Icon(Icons.settings, size: 14.0),
                ),
                TextSpan(
                  text: ') in the column header. Then click on the ',
                ),
                TextSpan(
                  text: 'Add Source',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                TextSpan(
                  text: ' button to add your first source.',
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Expanded(
      child: ListView.builder(
        padding: EdgeInsets.zero,
        itemCount: items.items.length + 2,
        itemBuilder: (context, index) {
          if (index == 0) {
            return const ColumnLayoutSources(
              key: ValueKey('sources'),
            );
          }

          if (index == items.items.length + 1) {
            return const ColumnLayoutLoadMore(
              key: ValueKey('loadmore'),
            );
          }

          return ItemPreview(
            key: ValueKey(items.items[index - 1].id),
            item: items.items[index - 1],
          );
        },
      ),
    );
  }
}
