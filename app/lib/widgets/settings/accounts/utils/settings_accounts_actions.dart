import 'package:flutter/material.dart';

import 'package:feeddeck/utils/constants.dart';

/// The [SettingsAccountsActions] widget can be used to show the [reconnect] and
/// [delete] option for an account in a modal bottom sheet. Depending on the
/// action which is selected by the user we call the function which was passed
/// to the component and close the modal.
class SettingsAccountsActions extends StatelessWidget {
  const SettingsAccountsActions({
    super.key,
    required this.reconnect,
    required this.delete,
  });

  final Future<void> Function() reconnect;
  final Future<void> Function() delete;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
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
              onTap: () {
                Navigator.of(context).pop();
                reconnect();
              },
              leading: const Icon(
                Icons.link,
              ),
              title: const Text(
                'Re-Connect',
              ),
            ),
            const Divider(
              color: Constants.dividerColor,
              height: 1,
              thickness: 1,
            ),
            ListTile(
              mouseCursor: SystemMouseCursors.click,
              onTap: () {
                Navigator.of(context).pop();
                delete();
              },
              leading: const Icon(
                Icons.delete,
                color: Constants.error,
              ),
              title: const Text(
                'Delete',
                style: TextStyle(
                  color: Constants.error,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
