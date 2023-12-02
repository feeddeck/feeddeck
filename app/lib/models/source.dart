import 'package:flutter/material.dart';

import 'package:feeddeck/models/sources/github.dart';
import 'package:feeddeck/models/sources/googlenews.dart';
import 'package:feeddeck/models/sources/stackoverflow.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/fd_icons.dart';

/// [FDSourceType] is a enum value which defines the source type. A source can
/// have one of the following types:
/// - [github]
/// - [googlenews]
/// - [lemmy]
/// - [mastodon]
/// - [medium]
/// - [nitter]
/// - [pinterest]
/// - [podcast]
/// - [reddit]
/// - [rss]
/// - [stackoverflow]
/// - [tumblr]
/// - [x]
/// - [youtube]
///
/// The [none] value is not valid and just here as a fallback in case sth. odd
/// happend in our database. The [none] value must always be the last value in
/// the list, so that we can loop though the types in a ListView / GridView
/// builder via `FDSourceType.values.length - 1`.
enum FDSourceType {
  github,
  googlenews,
  lemmy,
  mastodon,
  medium,
  nitter,
  pinterest,
  podcast,
  reddit,
  rss,
  stackoverflow,
  tumblr,
  // x,
  youtube,
  none,
}

/// [FDSourceTypeExtension] defines all extensions which are available for
/// the [FDSourceType] enum type.
extension FDSourceTypeExtension on FDSourceType {
  /// [toShortString] returns a short string of the source type which can safely
  /// be passed to our database.
  String toShortString() {
    return toString().split('.').last;
  }

  /// [toLocalizedString] returns a localized string for a source type.
  String toLocalizedString() {
    switch (this) {
      case FDSourceType.github:
        return 'GitHub';
      case FDSourceType.googlenews:
        return 'Google News';
      case FDSourceType.lemmy:
        return 'Lemmy';
      case FDSourceType.mastodon:
        return 'Mastodon';
      case FDSourceType.medium:
        return 'Medium';
      case FDSourceType.nitter:
        return 'Nitter';
      case FDSourceType.pinterest:
        return 'Pinterest';
      case FDSourceType.podcast:
        return 'Podcast';
      case FDSourceType.reddit:
        return 'Reddit';
      case FDSourceType.rss:
        return 'RSS';
      case FDSourceType.stackoverflow:
        return 'StackOverflow';
      case FDSourceType.tumblr:
        return 'Tumblr';
      // case FDSourceType.x:
      //   return 'X';
      case FDSourceType.youtube:
        return 'YouTube';
      default:
        return 'Invalid';
    }
  }

  /// [icon] returns the icon for a source.
  IconData get icon {
    switch (this) {
      case FDSourceType.github:
        return FDIcons.github;
      case FDSourceType.googlenews:
        return FDIcons.googlenews;
      case FDSourceType.lemmy:
        return FDIcons.lemmy;
      case FDSourceType.mastodon:
        return FDIcons.mastodon;
      case FDSourceType.medium:
        return FDIcons.medium;
      case FDSourceType.nitter:
        return FDIcons.nitter;
      case FDSourceType.pinterest:
        return FDIcons.pinterest;
      case FDSourceType.podcast:
        return Icons.podcasts;
      case FDSourceType.reddit:
        return FDIcons.reddit;
      case FDSourceType.rss:
        return FDIcons.rss;
      case FDSourceType.stackoverflow:
        return FDIcons.stackoverflow;
      case FDSourceType.tumblr:
        return FDIcons.tumblr;
      // case FDSourceType.x:
      //   return FDIcons.x;
      case FDSourceType.youtube:
        return FDIcons.youtube;
      default:
        return FDIcons.feeddeck;
    }
  }

  /// [bgColor] returns the background color for the source icon.
  Color get bgColor {
    switch (this) {
      case FDSourceType.github:
        return const Color(0xff000000);
      case FDSourceType.googlenews:
        return const Color(0xff4285f4);
      case FDSourceType.lemmy:
        return const Color(0xff00bc8c);
      case FDSourceType.mastodon:
        return const Color(0xff6364ff);
      case FDSourceType.medium:
        return const Color(0xff000000);
      case FDSourceType.nitter:
        return const Color(0xffff6c60);
      case FDSourceType.pinterest:
        return const Color(0xffe60023);
      case FDSourceType.podcast:
        return const Color(0xff872ec4);
      case FDSourceType.reddit:
        return const Color(0xffff5700);
      case FDSourceType.rss:
        return const Color(0xfff26522);
      case FDSourceType.stackoverflow:
        return const Color(0xffef8236);
      case FDSourceType.tumblr:
        return const Color(0xff34526f);
      // case FDSourceType.x:
      //   return const Color(0xff000000);
      case FDSourceType.youtube:
        return const Color(0xffff0000);
      default:
        return Constants.primary;
    }
  }

  /// [fgColor] returns the forground color for the source icon. This should be
  /// used toether with the [bgColor].
  Color get fgColor {
    switch (this) {
      case FDSourceType.github:
        return const Color(0xffffffff);
      case FDSourceType.googlenews:
        return const Color(0xffffffff);
      case FDSourceType.lemmy:
        return const Color(0xffffffff);
      case FDSourceType.mastodon:
        return const Color(0xffffffff);
      case FDSourceType.medium:
        return const Color(0xffffffff);
      case FDSourceType.nitter:
        return const Color(0xffffffff);
      case FDSourceType.pinterest:
        return const Color(0xffffffff);
      case FDSourceType.podcast:
        return const Color(0xffffffff);
      case FDSourceType.reddit:
        return const Color(0xffffffff);
      case FDSourceType.rss:
        return const Color(0xffffffff);
      case FDSourceType.stackoverflow:
        return const Color(0xffffffff);
      case FDSourceType.tumblr:
        return const Color(0xffffffff);
      // case FDSourceType.x:
      //   return const Color(0xffffffff);
      case FDSourceType.youtube:
        return const Color(0xffffffff);
      default:
        return Constants.onPrimary;
    }
  }
}

/// [getSourceTypeFromString] returns the [FDSourceType] from his string
/// representation. This is used to parse the JSON value returned by our
/// database into correct enum value in the [FDSource] model.
FDSourceType getSourceTypeFromString(String state) {
  for (FDSourceType element in FDSourceType.values) {
    if (element.toShortString() == state) {
      return element;
    }
  }
  return FDSourceType.none;
}

/// [FDSource] is the model for a source in our app. The following fields are
/// required for a source:
///   - An [id] to uniquely identify a source in the database
///   - A [type] which is defined in the [FDSourceType] enum
///   - A [title], [link] and [icon]
///   - The [options] are used to define additional values for the selected
///     [type] so that we can scrape the correct data
class FDSource {
  String id;
  FDSourceType type;
  String title;
  FDSourceOptions? options;
  String? link;
  String? icon;

  FDSource({
    required this.id,
    required this.type,
    required this.title,
    required this.options,
    required this.link,
    required this.icon,
  });

  factory FDSource.fromJson(Map<String, dynamic> data) {
    return FDSource(
      id: data['id'],
      type: getSourceTypeFromString(data['type']),
      title: data['title'],
      options: data.containsKey('options') && data['options'] != null
          ? FDSourceOptions.fromJson(data['options'])
          : null,
      link: data.containsKey('link') && data['link'] != null
          ? data['link']
          : null,
      icon: data.containsKey('icon') && data['icon'] != null
          ? data['icon']
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.toShortString(),
      'title': title,
      'options': options?.toJson(),
      'link': link,
      'icon': icon,
    };
  }
}

/// [FDSourceOptions] defines all options for the different source types which
/// are available.
class FDSourceOptions {
  FDGitHubOptions? github;
  FDGoogleNewsOptions? googlenews;
  String? lemmy;
  String? mastodon;
  String? medium;
  String? nitter;
  String? pinterest;
  String? podcast;
  String? reddit;
  String? rss;
  FDStackOverflowOptions? stackoverflow;
  String? tumblr;
  String? x;
  String? youtube;

  FDSourceOptions({
    this.github,
    this.googlenews,
    this.lemmy,
    this.mastodon,
    this.medium,
    this.nitter,
    this.pinterest,
    this.podcast,
    this.reddit,
    this.rss,
    this.stackoverflow,
    this.tumblr,
    this.x,
    this.youtube,
  });

  factory FDSourceOptions.fromJson(Map<String, dynamic> responseData) {
    return FDSourceOptions(
      github:
          responseData.containsKey('github') && responseData['github'] != null
              ? FDGitHubOptions.fromJson(responseData['github'])
              : null,
      googlenews: responseData.containsKey('googlenews') &&
              responseData['googlenews'] != null
          ? FDGoogleNewsOptions.fromJson(responseData['googlenews'])
          : null,
      lemmy: responseData.containsKey('lemmy') && responseData['lemmy'] != null
          ? responseData['lemmy']
          : null,
      mastodon: responseData.containsKey('mastodon') &&
              responseData['mastodon'] != null
          ? responseData['mastodon']
          : null,
      medium:
          responseData.containsKey('medium') && responseData['medium'] != null
              ? responseData['medium']
              : null,
      nitter:
          responseData.containsKey('nitter') && responseData['nitter'] != null
              ? responseData['nitter']
              : null,
      pinterest: responseData.containsKey('pinterest') &&
              responseData['pinterest'] != null
          ? responseData['pinterest']
          : null,
      podcast:
          responseData.containsKey('podcast') && responseData['podcast'] != null
              ? responseData['podcast']
              : null,
      reddit:
          responseData.containsKey('reddit') && responseData['reddit'] != null
              ? responseData['reddit']
              : null,
      rss: responseData.containsKey('rss') && responseData['rss'] != null
          ? responseData['rss']
          : null,
      stackoverflow: responseData.containsKey('stackoverflow') &&
              responseData['stackoverflow'] != null
          ? FDStackOverflowOptions.fromJson(responseData['stackoverflow'])
          : null,
      tumblr:
          responseData.containsKey('tumblr') && responseData['tumblr'] != null
              ? responseData['tumblr']
              : null,
      x: responseData.containsKey('x') && responseData['x'] != null
          ? responseData['x']
          : null,
      youtube:
          responseData.containsKey('youtube') && responseData['youtube'] != null
              ? responseData['youtube']
              : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'github': github?.toJson(),
      'googlenews': googlenews?.toJson(),
      'lemmy': lemmy,
      'mastodon': mastodon,
      'medium': medium,
      'nitter': nitter,
      'pinterest': pinterest,
      'podcast': podcast,
      'reddit': reddit,
      'rss': rss,
      'stackoverflow': stackoverflow?.toJson(),
      'tumblr': tumblr,
      'x': x,
      'youtube': youtube,
    };
  }
}
