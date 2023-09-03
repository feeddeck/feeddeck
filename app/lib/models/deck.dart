/// [FDDeck] is the model for a deck in our app. The following fields are
/// required for a deck:
///   - An [id] to uniquely identify a deck in the database
///   - A [name] which is used in the UI and can be set by the user
class FDDeck {
  String id;
  String name;

  FDDeck({
    required this.id,
    required this.name,
  });

  factory FDDeck.fromJson(Map<String, dynamic> data) {
    return FDDeck(
      id: data['id'],
      name: data['name'],
    );
  }
}
