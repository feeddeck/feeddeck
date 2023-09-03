import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/repositories/items_repository.dart';
import 'package:feeddeck/utils/constants.dart';

/// The [ColumnLayoutLoadMore] widget displays a button to load more items for
/// the current column. If the all items are already loaded or the list of items
/// is empty it show an empty [Container].
class ColumnLayoutLoadMore extends StatelessWidget {
  const ColumnLayoutLoadMore({super.key});

  @override
  Widget build(BuildContext context) {
    ItemsRepository items = Provider.of<ItemsRepository>(context, listen: true);

    /// Do not show the load more button when the list of items is empty or when
    /// all items were already loaded.
    if (items.status == ItemsStatus.loadedLast || items.items.isEmpty) {
      return Container();
    }

    return Padding(
      padding: const EdgeInsets.all(Constants.spacingMiddle),
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          maximumSize: const Size.fromHeight(
            Constants.elevatedButtonSize,
          ),
          minimumSize: const Size.fromHeight(
            Constants.elevatedButtonSize,
          ),
        ),
        onPressed:
            items.status == ItemsStatus.loading ? null : () => items.loadMore(),
        child: const Text('Load More'),
      ),
    );
  }
}
