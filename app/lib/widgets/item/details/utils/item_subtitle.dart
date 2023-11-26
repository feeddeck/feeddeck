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

  /// [_buildChildren] is used to build the children of the [RichText] widget.
  /// Depending on the provided information we will display the source title,
  /// the author and the publishing time of the item. We also include an icon
  /// for each information.
  List<InlineSpan> _buildChildren() {
    final List<InlineSpan> children = [];

    if (source.title.trim().isNotEmpty) {
      children.addAll([
        WidgetSpan(
          child: Icon(
            source.type.icon,
            size: 12,
            color: Constants.secondaryTextColor,
          ),
        ),
        TextSpan(
          text: '  ${source.title.trim()}',
        ),
      ]);
    } else {
      children.addAll([
        WidgetSpan(
          child: Icon(
            source.type.icon,
            size: 12,
            color: Constants.secondaryTextColor,
          ),
        ),
        TextSpan(
          text: '  ${source.type.toLocalizedString()}',
        ),
      ]);
    }

    if (item.author != null && item.author!.trim().isNotEmpty) {
      children.addAll([
        const TextSpan(
          text: '     |     ',
        ),
        const WidgetSpan(
          child: Icon(
            Icons.person,
            size: 12,
            color: Constants.secondaryTextColor,
          ),
        ),
        TextSpan(
          text: '  ${item.author!.trim()}',
        ),
      ]);
    }

    children.addAll([
      const TextSpan(
        text: '     |     ',
      ),
      const WidgetSpan(
        child: Icon(
          Icons.schedule,
          size: 12,
          color: Constants.secondaryTextColor,
        ),
      ),
      TextSpan(
        text:
            '  ${DateFormat.yMMMMd().add_Hm().format(DateTime.fromMillisecondsSinceEpoch(item.publishedAt * 1000))}',
      ),
    ]);

    return children;
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(
        bottom: Constants.spacingMiddle,
      ),
      child: RichText(
        textAlign: TextAlign.left,
        text: TextSpan(
          style: const TextStyle(
            color: Constants.secondaryTextColor,
            fontWeight: FontWeight.bold,
            fontSize: 10,
          ),
          children: _buildChildren(),
        ),
      ),
    );
  }
}
