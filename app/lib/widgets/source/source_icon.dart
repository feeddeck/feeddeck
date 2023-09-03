import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/repositories/settings_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/fd_icons.dart';

/// The [SourceIconType] enum is used to dertime the type of the [sourceIcon].
/// This is required to build the path to the icon when it is saved in the
/// Supabase storage.
enum SourceIconType {
  sources,
  items,
}

/// [SourceIconTypeExtension] defines all extensions which are available for
/// the [SourceIconType] enum type.
extension SourceIconTypeExtension on SourceIconType {
  /// [toShortString] returns a short string of the source type which can be
  /// used to construct the path for the Supabase storage.
  String toShortString() {
    return toString().split('.').last;
  }
}

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
    this.iconType = SourceIconType.sources,
    required this.size,
  });

  final FDSourceType type;
  final String? icon;
  final double size;
  final SourceIconType iconType;

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
    switch (type) {
      case FDSourceType.github:
        return buildIcon(
          FDIcons.github,
          iconSize,
          type.color,
          const Color(0xffffffff),
        );
      case FDSourceType.googlenews:
        return buildIcon(
          FDIcons.googlenews,
          iconSize,
          type.color,
          const Color(0xffffffff),
        );
      case FDSourceType.mastodon:
        return buildIcon(
          FDIcons.mastodon,
          iconSize,
          type.color,
          const Color(0xffffffff),
        );
      case FDSourceType.medium:
        return buildIcon(
          FDIcons.medium,
          iconSize,
          type.color,
          const Color(0xffffffff),
        );
      case FDSourceType.nitter:
        return buildIcon(
          FDIcons.nitter,
          iconSize,
          type.color,
          const Color(0xffffffff),
        );
      case FDSourceType.podcast:
        return buildIcon(
          Icons.podcasts,
          iconSize,
          type.color,
          const Color(0xffffffff),
        );
      case FDSourceType.reddit:
        return buildIcon(
          FDIcons.reddit,
          iconSize,
          type.color,
          const Color(0xffffffff),
        );
      case FDSourceType.rss:
        return buildIcon(
          FDIcons.rss,
          iconSize,
          type.color,
          const Color(0xffffffff),
        );
      case FDSourceType.stackoverflow:
        return buildIcon(
          FDIcons.stackoverflow,
          iconSize,
          type.color,
          const Color(0xffffffff),
        );
      case FDSourceType.tumblr:
        return buildIcon(
          FDIcons.tumblr,
          iconSize,
          type.color,
          const Color(0xffffffff),
        );
      case FDSourceType.x:
        return buildIcon(
          FDIcons.x,
          iconSize,
          type.color,
          const Color(0xffffffff),
        );
      case FDSourceType.youtube:
        return buildIcon(
          FDIcons.youtube,
          iconSize,
          type.color,
          const Color(0xffffffff),
        );
      default:
        return buildIcon(
          FDIcons.feeddeck,
          iconSize,
          Constants.primary,
          Constants.onPrimary,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (icon == null || icon == '') {
      return buildDefaultIcon(size);
    }

    /// [icon] is the url to the icon of a source. If the url does not start
    /// with `https://` it is assumed that the image is stored in the Supabase
    /// storage and the url is generated accordingly. If the app is
    /// running in the web, the url is proxied through the Supabase functions.
    String imageUrl = icon!;
    if (!imageUrl.startsWith('https://')) {
      imageUrl =
          '${SettingsRepository().supabaseUrl}/storage/v1/object/public/${iconType.toShortString()}/$imageUrl';
    } else if (kIsWeb) {
      imageUrl =
          '${Supabase.instance.client.functionsUrl}/image-proxy-v1?media=${Uri.encodeQueryComponent(imageUrl)}';
    }

    return ClipOval(
      child: SizedBox.fromSize(
        size: Size.fromRadius(size / 2),
        child: CachedNetworkImage(
          height: size,
          width: size,
          fit: BoxFit.cover,
          imageUrl: imageUrl,
          placeholder: (context, url) => buildDefaultIcon(size),
          errorWidget: (context, url, error) => buildDefaultIcon(size),
        ),
      ),
    );
  }
}
