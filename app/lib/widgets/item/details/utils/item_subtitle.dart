import 'package:flutter/material.dart';

import 'package:intl/intl.dart';

import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/utils/constants.dart';

/// The [ItemSubtitle] widget is used to display a subtitle for an item. The
/// subtitle contains the source type, the source title, the author of the
/// item and the time when the item was published. The widget should be
/// displayed below the [ItemTitle] widget.
class ItemSubtitle extends StatelessWidget {
  const ItemSubtitle({
    super.key,
    required this.item,
    required this.source,
  });

  final FDItem item;
  final FDSource source;

  @override
  Widget build(BuildContext context) {
    final sourceType = source.type.toLocalizedString();
    final sourceTitle = source.title != '' ? ' / ${source.title.trim()}' : '';
    final author = item.author != null && item.author != ''
        ? ' / ${item.author!.trim()}'
        : '';
    final publishedAt =
        ' / ${DateFormat.yMMMMd().add_Hm().format(DateTime.fromMillisecondsSinceEpoch(item.publishedAt * 1000))}';

    return Padding(
      padding: const EdgeInsets.only(
        bottom: Constants.spacingMiddle,
      ),
      child: SelectableText(
        '$sourceType$sourceTitle$author$publishedAt',
        textAlign: TextAlign.left,
        style: const TextStyle(
          color: Constants.secondaryTextColor,
          fontWeight: FontWeight.bold,
          fontSize: 10,
        ),
      ),
    );
  }
}
