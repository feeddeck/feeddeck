/// [FDGitHubType] is an enum value which defines the type for the GitHub
/// source.
enum FDGitHubType {
  notifications,
  repositorynotifications,
  searchissuesandpullrequests,
  useractivities,
  repositoryactivities,
  organizationactivitiespublic,
  organizationactivitiesprivate,
}

/// [FDGitHubTypeExtension] defines all extensions which are available for
/// the [FDGitHubType] enum type.
extension FDGitHubTypeExtension on FDGitHubType {
  /// [toShortString] returns the short string of an enum value (e.g.
  /// `notifications`), which can then be passed to our database.
  String toShortString() {
    return toString().split('.').last;
  }

  /// [toLocalizedString] returns a localized string for an enum value, which
  /// can be used in the ui.
  String toLocalizedString() {
    if (this == FDGitHubType.notifications) {
      return 'Notifications';
    }

    if (this == FDGitHubType.repositorynotifications) {
      return 'Repository Notifications';
    }

    if (this == FDGitHubType.searchissuesandpullrequests) {
      return 'Search Issues and Pull Requests';
    }

    if (this == FDGitHubType.useractivities) {
      return 'User Activities';
    }

    if (this == FDGitHubType.repositoryactivities) {
      return 'Repository Activities';
    }

    if (this == FDGitHubType.organizationactivitiespublic) {
      return 'Organization Activities (Public)';
    }

    if (this == FDGitHubType.organizationactivitiesprivate) {
      return 'Organization Activities (Private)';
    }

    return 'Invalid';
  }
}

/// [getGitHubTypeFromString] returns the correct enum value [FDGitHubType] for
/// the provide [state].
FDGitHubType getGitHubTypeFromString(String state) {
  for (FDGitHubType element in FDGitHubType.values) {
    if (element.toShortString() == state) {
      return element;
    }
  }
  return FDGitHubType.notifications;
}

/// [FDGitHubOptions] is the model for all available GitHub options which can be
/// set when a user adds a new source.
class FDGitHubOptions {
  FDGitHubType? type;
  bool? participating;
  String? repository;
  String? user;
  String? organization;
  String? queryName;
  String? query;

  FDGitHubOptions({
    this.type,
    this.participating,
    this.repository,
    this.user,
    this.organization,
    this.queryName,
    this.query,
  });

  factory FDGitHubOptions.fromJson(Map<String, dynamic> responseData) {
    return FDGitHubOptions(
      type: responseData.containsKey('type') && responseData['type'] != null
          ? getGitHubTypeFromString(responseData['type'])
          : null,
      participating: responseData.containsKey('participating') &&
              responseData['participating'] != null
          ? responseData['participating']
          : null,
      repository: responseData.containsKey('repository') &&
              responseData['repository'] != null
          ? responseData['repository']
          : null,
      user: responseData.containsKey('user') && responseData['user'] != null
          ? responseData['user']
          : null,
      organization: responseData.containsKey('organization') &&
              responseData['organization'] != null
          ? responseData['organization']
          : null,
      queryName: responseData.containsKey('queryName') &&
              responseData['queryName'] != null
          ? responseData['queryName']
          : null,
      query: responseData.containsKey('query') && responseData['query'] != null
          ? responseData['query']
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type?.toShortString(),
      'participating': participating,
      'repository': repository,
      'user': user,
      'organization': organization,
      'queryName': queryName,
      'query': query,
    };
  }
}
