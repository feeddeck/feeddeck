import 'package:xml/xml.dart';

/// [FDGoogleNewsType] is an enum value which defines the type for the Google
/// News source.
enum FDGoogleNewsType { url, search }

/// [FDGoogleNewsTypeExtension] defines all extensions which are available for
/// the [FDGoogleNewsType] enum type.
extension FDGoogleNewsTypeExtension on FDGoogleNewsType {
  /// [toShortString] returns the short string of an enum value (e.g. `url` or
  /// `search`), which can then be passed to our database.
  String toShortString() {
    return toString().split('.').last;
  }

  /// [toLocalizedString] returns a localized string for an enum value, which
  /// can be used in the ui.
  String toLocalizedString() {
    if (this == FDGoogleNewsType.url) {
      return 'URL';
    }

    if (this == FDGoogleNewsType.search) {
      return 'Search';
    }

    return 'Invalid';
  }
}

/// [getGoogleNewsTypeFromString] returns the correct enum value
/// [FDGoogleNewsType] for the provide [state].
FDGoogleNewsType getGoogleNewsTypeFromString(String state) {
  for (FDGoogleNewsType element in FDGoogleNewsType.values) {
    if (element.toShortString() == state) {
      return element;
    }
  }
  return FDGoogleNewsType.url;
}

/// [FDGoogleNewsOptions] is the model for all available Google news options,
/// which can be set by a user, when he is adding a new source.
class FDGoogleNewsOptions {
  FDGoogleNewsType? type;
  String? url;
  String? search;
  String? ceid;
  String? gl;
  String? hl;

  FDGoogleNewsOptions({
    this.type,
    this.url,
    this.search,
    this.ceid,
    this.gl,
    this.hl,
  });

  factory FDGoogleNewsOptions.fromJson(Map<String, dynamic> responseData) {
    return FDGoogleNewsOptions(
      type:
          responseData.containsKey('type') && responseData['type'] != null
              ? getGoogleNewsTypeFromString(responseData['type'])
              : null,
      url:
          responseData.containsKey('url') && responseData['url'] != null
              ? responseData['url']
              : null,
      search:
          responseData.containsKey('search') && responseData['search'] != null
              ? responseData['search']
              : null,
      ceid:
          responseData.containsKey('ceid') && responseData['ceid'] != null
              ? responseData['ceid']
              : null,
      gl:
          responseData.containsKey('gl') && responseData['gl'] != null
              ? responseData['gl']
              : null,
      hl:
          responseData.containsKey('hl') && responseData['hl'] != null
              ? responseData['hl']
              : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type?.toShortString(),
      'url': url,
      'search': search,
      'ceid': ceid,
      'gl': gl,
      'hl': hl,
    };
  }

  factory FDGoogleNewsOptions.fromXml(XmlElement element) {
    return FDGoogleNewsOptions(
      type: getGoogleNewsTypeFromString(
        element.getAttribute('googlenewsType') ?? '',
      ),
      url: element.getAttribute('googlenewsUrl'),
      search: element.getAttribute('googlenewsSearch'),
      ceid: element.getAttribute('googlenewsCeid'),
      gl: element.getAttribute('googlenewsGl'),
      hl: element.getAttribute('googlenewsHl'),
    );
  }

  void toXml(XmlBuilder builder) {
    if (type != null) {
      builder.attribute('googlenewsType', type!.toShortString());
    }
    if (url != null) {
      builder.attribute('googlenewsUrl', url);
    }
    if (search != null) {
      builder.attribute('googlenewsSearch', search);
    }
    if (ceid != null) {
      builder.attribute('googlenewsCeid', ceid);
    }
    if (gl != null) {
      builder.attribute('googlenewsGl', gl);
    }
    if (hl != null) {
      builder.attribute('googlenewsHl', hl);
    }
  }
}
