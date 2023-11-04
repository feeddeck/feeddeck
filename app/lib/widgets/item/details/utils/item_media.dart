import 'package:flutter/material.dart';

import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/utils/cached_network_image.dart';

/// The [ItemMedia] widget displays the media of an item. Based on the provided
/// [itemMedia] value the media is displayed from the Supabase storage or
/// directly from the provided url.
class ItemMedia extends StatelessWidget {
  const ItemMedia({
    super.key,
    required this.itemMedia,
  });

  final String? itemMedia;

  @override
  Widget build(BuildContext context) {
    if (itemMedia == null || itemMedia == '') {
      return Container();
    }

    return Container(
      padding: const EdgeInsets.only(
        bottom: Constants.spacingMiddle,
      ),
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTap: () {
            showModalBottomSheet(
              context: context,
              isScrollControlled: true,
              isDismissible: true,
              useSafeArea: true,
              backgroundColor: Colors.black,
              constraints: const BoxConstraints(
                maxWidth: double.infinity,
              ),
              builder: (BuildContext context) {
                return Scaffold(
                  backgroundColor: Colors.black,
                  body: Stack(
                    children: [
                      Center(
                        child: CachedNetworkImage(
                          fit: BoxFit.contain,
                          imageUrl: itemMedia!,
                          placeholder: (context, url) => Container(),
                          errorWidget: (context, url, error) => Container(),
                        ),
                      ),
                      Positioned(
                        top: Constants.spacingExtraSmall,
                        right: Constants.spacingExtraSmall,
                        child: IconButton(
                          icon: const Icon(
                            Icons.close,
                          ),
                          onPressed: () {
                            Navigator.of(context).pop();
                          },
                        ),
                      ),
                    ],
                  ),
                );
              },
            );
          },
          child: CachedNetworkImage(
            width: double.infinity,
            fit: BoxFit.contain,
            imageUrl: itemMedia!,
            placeholder: (context, url) => Container(),
            errorWidget: (context, url, error) => Container(),
          ),
        ),
      ),
    );
  }
}
