import 'package:flutter/material.dart';

import 'package:feeddeck/utils/constants.dart';

/// The [ItemTitle] widget displays the title of an item. The title is provided
/// via the [itemTitle] parameter.
class ItemTitle extends StatelessWidget {
  const ItemTitle({
    super.key,
    required this.itemTitle,
  });

  final String itemTitle;

  @override
  Widget build(BuildContext context) {
    if (itemTitle == '') {
      return Container();
    }

    return Container(
      padding: const EdgeInsets.only(
        bottom: Constants.spacingExtraSmall,
      ),
      child: Text(
        itemTitle,
        maxLines: 2,
        style: const TextStyle(
          overflow: TextOverflow.ellipsis,
          fontWeight: FontWeight.bold,
          fontSize: 14,
        ),
      ),
    );
  }
}
