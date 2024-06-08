import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/repositories/items_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/openurl.dart';

/// The [ItemActions] widget provides an actions menu for an item, which can be
/// used to quickly mark an item as read or unread and to add or remove a
/// bookmark for the item.
///
/// On Android and iOS the actions menu is displayed as a [Dismissible], this
/// means a user has to swipe the item to the left / right to add / remove a
/// bookmark for the item or to mark the item as read / unread.
///
/// For all other devices the actions menu is shown when a user presses longer
/// on a item, if the user does a normal click the primary action provided via
/// the [onTap] parameter is executed.
class ItemActions extends StatefulWidget {
  const ItemActions({
    super.key,
    required this.item,
    required this.onTap,
    required this.children,
  });

  final FDItem item;
  final void Function()? onTap;
  final List<Widget> children;

  @override
  State<ItemActions> createState() => _ItemActionsState();
}

class _ItemActionsState extends State<ItemActions> {
  Offset _tapPosition = Offset.zero;

  /// [_bookmark] marks the item as bookmarked. If the item is already
  /// bookmarked the bookmark will be removed.
  Future<void> _bookmark(BuildContext context) async {
    try {
      await Provider.of<ItemsRepository>(
        context,
        listen: false,
      ).updateBookmarkedState(widget.item.id, !widget.item.isBookmarked);
    } catch (_) {}
  }

  /// [_read] marks the item as read / unread by calling the corresponding API
  /// endpoint.
  Future<void> _read(BuildContext context) async {
    try {
      await Provider.of<ItemsRepository>(
        context,
        listen: false,
      ).updateReadState(widget.item.id, !widget.item.isRead);
    } catch (_) {}
  }

  /// [_openUrl] opens the item url in the default browser of the current
  /// device.
  Future<void> _openUrl() async {
    try {
      await openUrl(widget.item.link);
    } catch (_) {}
  }

  /// [_getTapPositionLarge] set the [_tapPosition] which will be used for the
  /// actions menu.
  void _getTapPositionLarge(TapDownDetails details) {
    setState(() {
      _tapPosition = details.globalPosition;
    });
  }

  /// [_showActionsMenuLarge] shows a popup menu with all available actions for
  /// an item. This means the user can mark an item as read or unread or a user
  /// can add or remove a bookmark for an item.
  void _showActionsMenuLarge() async {
    HapticFeedback.heavyImpact();

    final RenderObject? overlay =
        Overlay.of(context).context.findRenderObject();

    final result = await showMenu(
      context: context,
      position: RelativeRect.fromRect(
        Rect.fromLTWH(
          _tapPosition.dx,
          _tapPosition.dy,
          30,
          30,
        ),
        Rect.fromLTWH(
          0,
          0,
          overlay!.paintBounds.size.width,
          overlay.paintBounds.size.height,
        ),
      ),
      items: [
        PopupMenuItem(
          value: 'read',
          child: ListTile(
            leading: widget.item.isRead
                ? const Icon(
                    Icons.visibility_off,
                  )
                : const Icon(
                    Icons.visibility,
                  ),
            title: widget.item.isRead
                ? const Text('Mark as Unread')
                : const Text('Mark as Read'),
          ),
        ),
        PopupMenuItem(
          value: 'bookmark',
          child: ListTile(
            leading: widget.item.isBookmarked
                ? const Icon(
                    Icons.bookmark,
                  )
                : const Icon(
                    Icons.bookmark_outline,
                  ),
            title: widget.item.isBookmarked
                ? const Text('Remove Bookmark')
                : const Text('Add Bookmark'),
          ),
        ),
        const PopupMenuItem(
          value: 'openlink',
          child: ListTile(
            leading: Icon(
              Icons.launch,
            ),
            title: Text('Open Link'),
          ),
        ),
      ],
    );

    switch (result) {
      case 'read':
        if (mounted) {
          await _read(context);
        }
        break;
      case 'bookmark':
        if (mounted) {
          await _bookmark(context);
        }
        break;
      case 'openlink':
        if (mounted) {
          await _openUrl();
        }
        break;
    }
  }

  /// [_showActionsMenuSmall] shows a modal bottom sheet with all available
  /// actions for an item. This means the user can mark an item as read or
  /// unread or a user can add or remove a bookmark for an item. The actions are
  /// the same as we show on large screens via [_showActionsMenuLarge], but the
  /// modal bottom sheet is optiomized for small screens.
  void _showActionsMenuSmall(BuildContext mainContext) async {
    HapticFeedback.heavyImpact();

    showModalBottomSheet(
      context: mainContext,
      isScrollControlled: true,
      isDismissible: true,
      useSafeArea: true,
      elevation: 0,
      backgroundColor: Colors.transparent,
      constraints: const BoxConstraints(
        maxWidth: Constants.centeredFormMaxWidth,
      ),
      builder: (BuildContext context) {
        return Container(
          margin: const EdgeInsets.all(
            Constants.spacingMiddle,
          ),
          padding: const EdgeInsets.only(
            left: Constants.spacingMiddle,
            right: Constants.spacingMiddle,
          ),
          decoration: const BoxDecoration(
            color: Constants.background,
            borderRadius: BorderRadius.all(
              Radius.circular(Constants.spacingMiddle),
            ),
          ),
          child: Wrap(
            alignment: WrapAlignment.center,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              ListTile(
                mouseCursor: SystemMouseCursors.click,
                onTap: () async {
                  Navigator.of(context).pop();
                  _read(mainContext);
                },
                leading: widget.item.isRead
                    ? const Icon(Icons.visibility_off)
                    : const Icon(Icons.visibility),
                title: widget.item.isRead
                    ? const Text('Mark as Unread')
                    : const Text('Mark as Read'),
              ),
              const Divider(
                color: Constants.dividerColor,
                height: 1,
                thickness: 1,
              ),
              ListTile(
                mouseCursor: SystemMouseCursors.click,
                onTap: () async {
                  Navigator.of(context).pop();
                  _bookmark(mainContext);
                },
                leading: widget.item.isBookmarked
                    ? const Icon(Icons.bookmark)
                    : const Icon(Icons.bookmark_outline),
                title: widget.item.isBookmarked
                    ? const Text('Remove Bookmark')
                    : const Text('Add Bookmark'),
              ),
              const Divider(
                color: Constants.dividerColor,
                height: 1,
                thickness: 1,
              ),
              ListTile(
                mouseCursor: SystemMouseCursors.click,
                onTap: () async {
                  Navigator.of(context).pop();
                  _openUrl();
                },
                leading: const Icon(Icons.launch),
                title: const Text('Open Link'),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    bool useTabs = MediaQuery.of(context).size.width < Constants.breakpoint;

    /// On small screens on Android and iOS we show a [Dismissible] and an
    /// actions menu (via `_showActionsMenuSmall`), so that a user can mark an
    /// item as read or unread or a user can add or remove a bookmark by
    /// swiping the item to the left or right or by a long press.
    if (!kIsWeb && useTabs && (Platform.isAndroid || Platform.isIOS)) {
      return Dismissible(
        key: Key(widget.item.id),
        background: Container(
          color: Constants.primary,
          child: Align(
            alignment: Alignment.centerLeft,
            child: Padding(
              padding: const EdgeInsets.only(
                left: Constants.spacingMiddle,
              ),
              child: widget.item.isBookmarked
                  ? const Icon(
                      Icons.bookmark,
                    )
                  : const Icon(
                      Icons.bookmark_outline,
                    ),
            ),
          ),
        ),
        secondaryBackground: Container(
          color: Constants.primary,
          child: Align(
            alignment: Alignment.centerRight,
            child: Padding(
              padding: const EdgeInsets.only(
                right: Constants.spacingMiddle,
              ),
              child: widget.item.isRead
                  ? const Icon(
                      Icons.visibility_off,
                    )
                  : const Icon(
                      Icons.visibility,
                    ),
            ),
          ),
        ),
        confirmDismiss: (direction) async {
          if (direction == DismissDirection.startToEnd) {
            HapticFeedback.heavyImpact();
            await _bookmark(context);
            return false;
          } else {
            HapticFeedback.heavyImpact();
            await _read(context);
            return false;
          }
        },
        child: MouseRegion(
          cursor: SystemMouseCursors.click,
          child: GestureDetector(
            onTap: widget.onTap,
            onLongPress: () => _showActionsMenuSmall(context),
            child: Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                color: Constants.secondary,
                border: Border(
                  bottom: BorderSide(color: Constants.dividerColor),
                ),
              ),
              padding: const EdgeInsets.all(Constants.spacingSmall),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: widget.children,
              ),
            ),
          ),
        ),
      );
    }

    /// On other small screens we only show the actions menu via
    /// `_showActionsMenuSmall` to offer the same actions. We do not use the
    /// [Dismissible] widget here, because it could cause some problems with the
    /// scrolling behaviour.
    if (useTabs) {
      return MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTap: widget.onTap,
          onLongPress: () => _showActionsMenuSmall(context),
          child: Container(
            width: double.infinity,
            decoration: const BoxDecoration(
              color: Constants.secondary,
              border: Border(
                bottom: BorderSide(color: Constants.dividerColor),
              ),
            ),
            padding: const EdgeInsets.all(Constants.spacingSmall),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: widget.children,
            ),
          ),
        ),
      );
    }

    /// On large screens we show an actions menu via `_showActionsMenuLarge`,
    /// which is rendered directly at the point where the user pressed on the
    /// item.
    /// The menu can be opened by a long press or by a secondary tap (right
    /// click) on the item.
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: widget.onTap,
        onTapDown: (details) => _getTapPositionLarge(details),
        onLongPress: () => _showActionsMenuLarge(),
        onSecondaryTapDown:
            kIsWeb ? null : (details) => _getTapPositionLarge(details),
        onSecondaryTap: kIsWeb ? null : () => _showActionsMenuLarge(),
        child: Container(
          width: double.infinity,
          decoration: const BoxDecoration(
            color: Constants.secondary,
            border: Border(
              bottom: BorderSide(color: Constants.dividerColor),
            ),
          ),
          padding: const EdgeInsets.all(Constants.spacingSmall),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: widget.children,
          ),
        ),
      ),
    );
  }
}
