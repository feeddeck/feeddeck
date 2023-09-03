import 'package:flutter/material.dart';

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
    return SelectableText(
      itemTitle,
      textAlign: TextAlign.left,
      style: const TextStyle(
        fontWeight: FontWeight.bold,
        fontSize: 16,
      ),
    );
  }
}
