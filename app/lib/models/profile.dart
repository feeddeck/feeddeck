/// [FDProfileTier] is a enum value which defines the different tiers for a
/// profile. A user can be on the [free] or [premium] tier. While the [free]
/// tier comes with some restrictions the [premium] tier is "without" any
/// restrictions.
enum FDProfileTier {
  free,
  premium,
}

/// [FDProfileTierExtension] defines all extensions which are available for
/// the [FDProfileTier] enum type.
extension FDProfileTierExtension on FDProfileTier {
  /// [toShortString] returns a short string of the source type which can safely
  /// be passed to our database.
  String toShortString() {
    return toString().split('.').last;
  }
}

/// [getSourceTypeFromString] returns the [FDProfileTier] from his string
/// representation. This is used to parse the JSON value returned by our
/// database into correct enum value in the [FDSource] model.
FDProfileTier getProfileTierFromString(String state) {
  for (FDProfileTier element in FDProfileTier.values) {
    if (element.toShortString() == state) {
      return element;
    }
  }
  return FDProfileTier.free;
}

/// [FDProfile] is the model for a profile of a user in our app. The following
/// fields are required for a profile:
///   - An [id] to uniquely identify a column in the database
///   - A [tier] the tier of the user account, could be `free` or `premium`
///   - An [accountGitHub] field will be `true` when the user has connectect his
///     GitHub account. If no account is connected this field will be `false`.
class FDProfile {
  String id;
  FDProfileTier tier;
  bool accountGithub;
  int createdAt;
  int updatedAt;

  FDProfile({
    required this.id,
    required this.tier,
    required this.accountGithub,
    required this.createdAt,
    required this.updatedAt,
  });

  factory FDProfile.fromJson(Map<String, dynamic> data) {
    return FDProfile(
      id: data['id'],
      tier: getProfileTierFromString(data['tier']),
      accountGithub: data['accountGithub'],
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt'],
    );
  }
}
