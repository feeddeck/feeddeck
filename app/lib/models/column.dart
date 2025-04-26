import 'package:xml/xml.dart';

import 'package:feeddeck/models/source.dart';

/// [FDColumn] is the model for a column in our app. The following fields are
/// required for a column:
///   - An [id] to uniquely identify a column in the database
///   - A [name] which is used in the UI and can be set by the user
///   - A [position] to define the position of a column in a deck
///   - A list of [sources] which belong to a column, this field is not stored
///     in the database and must be retrieved by selecting all sources from the
///     sources table where the `columnId` field matches the [id] of the column
class FDColumn {
  String id;
  String name;
  int position;
  List<FDSource> sources;

  FDColumn({
    required this.id,
    required this.name,
    required this.position,
    required this.sources,
  });

  factory FDColumn.fromJson(Map<String, dynamic> data) {
    return FDColumn(
      id: data['id'],
      name: data['name'],
      position: data['position'],
      sources:
          data.containsKey('sources') && data['sources'] != null
              ? List<FDSource>.from(
                data['sources'].map((source) => FDSource.fromJson(source)),
              )
              : [],
    );
  }

  /// [identifier] returns a string representation of the [FDColumn], which we
  /// can use as identifier for an `ItemRepository`, so that we can reload the
  /// items, when the column is changed (e.g. source is added / deleted).
  String identifier() {
    return 'id: $id, sources: ${sources.map((source) => source.id).join(' ')}';
  }

  factory FDColumn.fromXml(XmlElement element) {
    final sources = <FDSource>[];

    element.findElements('outline').forEach((outline) {
      final source = FDSource.fromXml(outline);
      if (source.type != FDSourceType.none) {
        sources.add(source);
      }
    });

    return FDColumn(
      id: '',
      name: element.getAttribute('text') ?? 'Unknown',
      position: 0,
      sources: sources,
    );
  }

  void toXml(XmlBuilder builder) {
    builder.element(
      'outline',
      nest: () {
        builder.attribute('text', name);
        for (var i = 0; i < sources.length; i++) {
          sources[i].toXml(builder);
        }
      },
    );
  }
}
