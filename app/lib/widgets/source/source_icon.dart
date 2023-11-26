import 'package:flutter/material.dart';

import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/fd_icons.dart';
import 'package:feeddeck/widgets/utils/cached_network_image.dart';

/// [SourceIcon] can be used to show the image for a source. For that the [icon]
/// of the source must be provided. The size of the image can be adjusted via
/// the [size] parameter.
///
/// If we are not able to display the image or when the [icon] is `null` we will
/// display a default icon, which is generated via the provided source [type].
class SourceIcon extends StatelessWidget {
  const SourceIcon({
    super.key,
    required this.type,
    required this.icon,
    required this.size,
  });

  final FDSourceType type;
  final String? icon;
  final double size;

  /// buildIcon returns the provided [icon] with the provided [backgroundColor].
  Widget buildIcon(
    IconData icon,
    double iconSize,
    Color backgroundColor,
    Color foregroundColor,
  ) {
    return CircleAvatar(
      radius: iconSize / 2,
      backgroundColor: backgroundColor,
      child: Icon(
        icon,
        size: iconSize / 2,
        color: foregroundColor,
      ),
    );
  }

  /// [buildDefaultIcon] returns an icon based on the provided source [type].
  Widget buildDefaultIcon(double iconSize) {
    if (FDSourceType.values.contains(type)) {
      return buildIcon(
        type.icon,
        iconSize,
        type.bgColor,
        type.fgColor,
      );
    }

    return buildIcon(
      FDIcons.feeddeck,
      iconSize,
      Constants.primary,
      Constants.onPrimary,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (icon == null || icon == '') {
      return buildDefaultIcon(size);
    }

    return ClipOval(
      child: SizedBox.fromSize(
        size: Size.fromRadius(size / 2),
        child: CachedNetworkImage(
          height: size,
          width: size,
          fit: BoxFit.cover,
          imageUrl: icon!,
          placeholder: (context, url) => buildDefaultIcon(size),
          errorWidget: (context, url, error) => buildDefaultIcon(size),
        ),
      ),
    );
  }
}
