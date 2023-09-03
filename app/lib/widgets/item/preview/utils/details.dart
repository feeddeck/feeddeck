import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/repositories/items_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/openurl.dart';
import 'package:feeddeck/widgets/item/details/item_details.dart';

/// [showDetails] shows the details for the provided [item] and [source].
/// Depending on the screen size the details are shown in a modal bottom sheet
/// or a side sheet.
///
/// After the preview was opened we also update the read state of the item to
/// mark it as read.
Future<void> showDetails(
  BuildContext context,
  FDItem item,
  FDSource source,
) async {
  ItemsRepository items = Provider.of<ItemsRepository>(
    context,
    listen: false,
  );
  bool useTabs = MediaQuery.of(context).size.width < Constants.breakpoint;

  /// If the screen is smaller then our defined breakpoint so that the users
  /// sees the tab layout we show the details in a modal bottom sheet.
  if (useTabs) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      isDismissible: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(Constants.spacingMiddle),
        ),
      ),
      clipBehavior: Clip.antiAliasWithSaveLayer,
      constraints: const BoxConstraints(
        maxWidth: Constants.centeredFormMaxWidth,
      ),
      builder: (BuildContext context) {
        return ChangeNotifierProvider.value(
          value: items,
          child: ItemDetails(item: item, source: source),
        );
      },
    );
  } else {
    /// The [width] determines the width of the side sheet when the [item]
    /// details are displayed on a larger screen. If the screen is smaller then
    /// two times the column width the side sheet will have a width of
    /// [Constants.breakpoint] - 200, otherwise it will have a width of two
    /// times the column width.
    ///
    /// Note: As soon as https://github.com/flutter/flutter/issues/119328 is
    /// implemented we should switch to the official implementation for a side
    /// sheet.
    double width =
        MediaQuery.of(context).size.width < (Constants.columnWidth * 2) + 200
            ? Constants.breakpoint - 200
            : Constants.columnWidth * 2;

    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Dismiss',
      pageBuilder: (context, animation1, animation2) {
        return Align(
          alignment: Alignment.centerRight,
          child: Material(
            elevation: 1.0,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(Constants.spacingMiddle),
              bottomLeft: Radius.circular(Constants.spacingMiddle),
            ),
            child: Container(
              clipBehavior: Clip.antiAliasWithSaveLayer,
              decoration: const BoxDecoration(
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(Constants.spacingMiddle),
                  bottomLeft: Radius.circular(Constants.spacingMiddle),
                ),
              ),
              width: width,
              child: ChangeNotifierProvider.value(
                value: items,
                child: ItemDetails(
                  item: item,
                  source: source,
                ),
              ),
            ),
          ),
        );
      },
      transitionBuilder: (context, animation1, animation2, child) {
        return SlideTransition(
          position: Tween(
            begin: const Offset((1), 0),
            end: const Offset(0, 0),
          ).animate(animation1),
          child: child,
        );
      },
    );
  }

  if (item.isRead == false) {
    try {
      await items.updateReadState(item.id, true);
    } catch (_) {}
  }
}

/// [openDetails] opens the [item.link] in the browser, before the link is
/// opened we mark the item as read.
Future<void> openDetails(
  BuildContext context,
  FDItem item,
) async {
  try {
    if (!item.isRead) {
      await Provider.of<ItemsRepository>(
        context,
        listen: false,
      ).updateReadState(item.id, true);
    }
    if (item.link != '') {
      await openUrl(item.link);
    }
  } catch (_) {
    if (item.link != '') {
      await openUrl(item.link);
    }
  }
}
