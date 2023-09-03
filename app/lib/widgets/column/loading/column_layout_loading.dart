import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/repositories/items_repository.dart';

/// The [ColumnLayoutLoading] widget is used to show a linear progress indicator
/// below the [ColumnLayoutSearch] widget. When the current status of the
/// [ItemsRepository] is `loading` it shows the linear progrss indicator. For
/// all other statuses it show a sized box with the same height but without any
/// content.
class ColumnLayoutLoading extends StatelessWidget {
  const ColumnLayoutLoading({super.key});

  @override
  Widget build(BuildContext context) {
    ItemsRepository items = Provider.of<ItemsRepository>(context, listen: true);

    if (items.status != ItemsStatus.loading) {
      return const SizedBox(
        height: 1,
      );
    }

    return const LinearProgressIndicator(
      minHeight: 1,
    );
  }
}
