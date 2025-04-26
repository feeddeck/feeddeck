import 'package:xml/xml.dart';

/// [FDStackOverflowType] is an enum value which defines the type for the
/// StackOverflow source.
enum FDStackOverflowType { url, tag }

/// [FDStackOverflowTypeExtension] defines all extensions which are available for
/// the [FDStackOverflowType] enum type.
extension FDStackOverflowTypeExtension on FDStackOverflowType {
  /// [toShortString] returns the short string of an enum value (e.g. `url` or
  /// `tag`), which can then be passed to our database.
  String toShortString() {
    return toString().split('.').last;
  }

  /// [toLocalizedString] returns a localized string for an enum value, which
  /// can be used in the ui.
  String toLocalizedString() {
    if (this == FDStackOverflowType.url) {
      return 'RSS Feed';
    }

    if (this == FDStackOverflowType.tag) {
      return 'Tag';
    }

    return 'Invalid';
  }
}

/// [getStackOverflowTypeFromString] returns the correct enum value
/// [FDStackOverflowType] for the provide [state].
FDStackOverflowType getStackOverflowTypeFromString(String state) {
  for (FDStackOverflowType element in FDStackOverflowType.values) {
    if (element.toShortString() == state) {
      return element;
    }
  }
  return FDStackOverflowType.url;
}

/// [FDStackOverflowSort] is an enum value which defines the available sort
/// properties for the [FDStackOverflowOptions]
enum FDStackOverflowSort { newest, active, featured, votes }

/// [FDStackOverflowSortExtension] defines all extensions which are available
/// for the [FDStackOverflowSort] enum type.
extension FDStackOverflowSortExtension on FDStackOverflowSort {
  /// [toShortString] returns the short string of an enum value (e.g. `url` or
  /// `tag`), which can then be passed to our database.
  String toShortString() {
    return toString().split('.').last;
  }

  /// [toLocalizedString] returns a localized string for an enum value, which
  /// can be used in the ui.
  String toLocalizedString() {
    if (this == FDStackOverflowSort.newest) {
      return 'Newest';
    }

    if (this == FDStackOverflowSort.active) {
      return 'Active';
    }

    if (this == FDStackOverflowSort.featured) {
      return 'Featured';
    }

    if (this == FDStackOverflowSort.votes) {
      return 'Votes';
    }

    return 'Invalid';
  }
}

/// [getStackOverflowSortFromString] returns the correct enum value
/// [FDStackOverflowSort] for the provide [state].
FDStackOverflowSort getStackOverflowSortFromString(String state) {
  for (FDStackOverflowSort element in FDStackOverflowSort.values) {
    if (element.toShortString() == state) {
      return element;
    }
  }
  return FDStackOverflowSort.newest;
}

/// [FDStackOverflowOptions] is the model for all available StackOverflow
/// options, which can be set by a user, when he is adding a new source.
class FDStackOverflowOptions {
  FDStackOverflowType? type;
  String? url;
  String? tag;
  FDStackOverflowSort? sort;

  FDStackOverflowOptions({this.type, this.url, this.tag, this.sort});

  factory FDStackOverflowOptions.fromJson(Map<String, dynamic> responseData) {
    return FDStackOverflowOptions(
      type:
          responseData.containsKey('type') && responseData['type'] != null
              ? getStackOverflowTypeFromString(responseData['type'])
              : null,
      url:
          responseData.containsKey('url') && responseData['url'] != null
              ? responseData['url']
              : null,
      tag:
          responseData.containsKey('tag') && responseData['tag'] != null
              ? responseData['tag']
              : null,
      sort:
          responseData.containsKey('sort') && responseData['sort'] != null
              ? getStackOverflowSortFromString(responseData['sort'])
              : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type?.toShortString(),
      'url': url,
      'tag': tag,
      'sort': sort?.toShortString(),
    };
  }

  factory FDStackOverflowOptions.fromXml(XmlElement element) {
    return FDStackOverflowOptions(
      type: getStackOverflowTypeFromString(
        element.getAttribute('stackoverflowType') ?? '',
      ),
      url: element.getAttribute('stackoverflowUrl'),
      tag: element.getAttribute('stackoverflowTag'),
      sort: getStackOverflowSortFromString(
        element.getAttribute('stackoverflowSort') ?? '',
      ),
    );
  }

  void toXml(XmlBuilder builder) {
    if (type != null) {
      builder.attribute('stackoverflowType', type!.toShortString());
    }
    if (url != null) {
      builder.attribute('stackoverflowUrl', url);
    }
    if (tag != null) {
      builder.attribute('stackoverflowTag', tag);
    }
    if (sort != null) {
      builder.attribute('stackoverflowSort', sort);
    }
  }
}
