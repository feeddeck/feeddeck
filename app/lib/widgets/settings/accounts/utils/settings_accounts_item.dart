import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/repositories/profile_repository.dart';
import 'package:feeddeck/utils/constants.dart';

/// The [SettingsAccountsItem] widget is used to display a single account in the
/// accounts section of the settings page.
class SettingsAccountsItem extends StatelessWidget {
  const SettingsAccountsItem({
    super.key,
    required this.name,
    required this.isConnected,
    required this.onTap,
  });

  final String name;
  final bool isConnected;
  final void Function()? onTap;

  @override
  Widget build(BuildContext context) {
    ProfileRepository profile = Provider.of<ProfileRepository>(
      context,
      listen: true,
    );

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: onTap,
        child: Card(
          color: Constants.secondary,
          margin: const EdgeInsets.only(
            bottom: Constants.spacingSmall,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.all(
                  Constants.spacingMiddle,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            Characters(name)
                                .replaceAll(
                                  Characters(''),
                                  Characters('\u{200B}'),
                                )
                                .toString(),
                            maxLines: 1,
                            style: const TextStyle(
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(6),
                        color: isConnected &&
                                profile.status == FDProfileStatus.initialized
                            ? Constants.primary
                            : Constants.error,
                      ),
                      padding: const EdgeInsets.all(
                        Constants.spacingExtraSmall,
                      ),
                      child: Text(
                        isConnected &&
                                profile.status == FDProfileStatus.initialized
                            ? 'Connected'
                            : 'Not Connected',
                        style: TextStyle(
                          color: isConnected
                              ? Constants.onPrimary
                              : Constants.onError,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
