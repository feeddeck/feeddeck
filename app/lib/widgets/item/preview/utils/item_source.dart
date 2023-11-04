import 'package:flutter/material.dart';

import 'package:timeago/timeago.dart' as timeago;

import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/source/source_icon.dart';

/// The [ItemSource] widget is used to display the source of an item above the
/// item title.
class ItemSource extends StatelessWidget {
  const ItemSource({
    super.key,
    required this.sourceTitle,
    required this.sourceSubtitle,
    required this.sourceType,
    required this.sourceIcon,
    required this.itemPublishedAt,
    required this.itemIsRead,
  });

  final String sourceTitle;
  final String sourceSubtitle;
  final FDSourceType sourceType;
  final String? sourceIcon;
  final int itemPublishedAt;
  final bool itemIsRead;

  /// [_buildTime] returns a widget with the relative time differenc to when the
  /// item was published and an unread identicator if the state of the item is
  /// `unread`.
  Widget _buildTime() {
    final publishedAt = DateTime.fromMillisecondsSinceEpoch(
      itemPublishedAt * 1000,
    );

    return Row(
      children: [
        Text(
          timeago.format(
            publishedAt,
            locale: 'en_short',
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(left: Constants.spacingSmall),
          child: Icon(
            Icons.circle,
            color: !itemIsRead ? Constants.primary : Colors.transparent,
            size: 8,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(
        bottom: Constants.spacingSmall,
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.only(
              right: Constants.spacingMiddle,
            ),
            child: SourceIcon(
              type: sourceType,
              icon: sourceIcon,
              size: 32,
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  Characters(sourceTitle)
                      .replaceAll(Characters(''), Characters('\u{200B}'))
                      .toString(),
                  maxLines: 1,
                  style: const TextStyle(
                    overflow: TextOverflow.ellipsis,
                    fontWeight: FontWeight.bold,
                    fontSize: 10,
                  ),
                ),
                Text(
                  Characters(sourceSubtitle)
                      .replaceAll(Characters(''), Characters('\u{200B}'))
                      .toString(),
                  maxLines: 1,
                  style: const TextStyle(
                    overflow: TextOverflow.ellipsis,
                    fontWeight: FontWeight.bold,
                    fontSize: 8,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.only(
              left: Constants.spacingMiddle,
            ),
            child: _buildTime(),
          ),
        ],
      ),
    );
  }
}
