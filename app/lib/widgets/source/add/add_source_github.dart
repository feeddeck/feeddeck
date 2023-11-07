import 'package:flutter/material.dart';

import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:provider/provider.dart';

import 'package:feeddeck/models/column.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/models/sources/github.dart';
import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/utils/api_exception.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/openurl.dart';
import 'package:feeddeck/widgets/source/add/add_source_form.dart';

const _helpText = '''
The GitHub source can be used to get notifications and activities from GitHub:

- **Notifications**: Get your own notifications.
- **Repository Notifications**: Get the notifications for a specific repository,
  e.g. `feeddeck/feeddeck`.
- **Search Issues and Pull Requests**: Get all issues and pull requests, which
  are matching the provided query, e.g. `label:bug org:feeddeck repo:feeddeck`.
- **User Activities**: Get the activities for a specific user, e.g.
  `ricoberger`.
- **Repository Activities**: Get the activities for a specific repository, e.g.
  `feeddeck/feeddeck`.
- **Organization Activities (Public)**: Get the public activities for a specific
  organization, e.g. `feeddeck`.
- **Organization Activities (Private)**: Get the private activities for a
  specific organization, e.g. `feeddeck`.

To use the GitHub source make sure that you have connected your GitHub account
in the settings via a personal access token.
''';

/// The [AddSourceGitHub] widget is used to display the form to add a new GitHub
/// source.
class AddSourceGitHub extends StatefulWidget {
  const AddSourceGitHub({
    super.key,
    required this.column,
  });

  final FDColumn column;

  @override
  State<AddSourceGitHub> createState() => _AddSourceGitHubState();
}

class _AddSourceGitHubState extends State<AddSourceGitHub> {
  final _formKey = GlobalKey<FormState>();
  FDGitHubType _githubType = FDGitHubType.notifications;
  bool _githubParticipating = false;
  final _githubRepositoryController = TextEditingController();
  final _githubUserController = TextEditingController();
  final _githubOrganizationController = TextEditingController();
  final _githubQueryNameController = TextEditingController();
  final _githubQueryController = TextEditingController();
  bool _isLoading = false;
  String _error = '';

  /// [_addSource] is used to add a new GitHub source. Depending on the selected
  /// [_githubType] we need different information to add the source. Which data
  /// is required for which type is defined in the [_buildForm] function.
  Future<void> _addSource() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      AppRepository app = Provider.of<AppRepository>(context, listen: false);
      await app.addSource(
        widget.column.id,
        FDSourceType.github,
        FDSourceOptions(
          github: FDGitHubOptions(
            type: _githubType,
            participating: _githubParticipating,
            repository: _githubRepositoryController.text,
            user: _githubUserController.text,
            organization: _githubOrganizationController.text,
            queryName: _githubQueryNameController.text,
            query: _githubQueryController.text,
          ),
        ),
      );
      setState(() {
        _isLoading = false;
        _error = '';
      });
      if (mounted) {
        Navigator.of(context).pop();
      }
    } on ApiException catch (err) {
      setState(() {
        _isLoading = false;
        _error = 'Failed to add source: ${err.message}';
      });
    } catch (err) {
      setState(() {
        _isLoading = false;
        _error = 'Failed to add source: ${err.toString()}';
      });
    }
  }

  /// [_buildForm] displays the correct fields for the selected [_githubType].
  /// Depending on the type we need different information of the user (e.g. a
  /// username, a repository or an organization).
  List<Widget> _buildForm() {
    List<Widget> githubWidgets = [];

    if (_githubType == FDGitHubType.notifications ||
        _githubType == FDGitHubType.repositorynotifications) {
      githubWidgets.addAll(
        [
          CheckboxListTile(
            title: const Text('Participating'),
            value: _githubParticipating,
            onChanged: (newValue) {
              setState(() {
                _githubParticipating = newValue ?? false;
              });
            },
            controlAffinity: ListTileControlAffinity.leading,
          ),
          const SizedBox(height: Constants.spacingMiddle),
        ],
      );
    }

    if (_githubType == FDGitHubType.repositorynotifications) {
      githubWidgets.addAll(
        [
          TextFormField(
            controller: _githubRepositoryController,
            keyboardType: TextInputType.text,
            autocorrect: false,
            enableSuggestions: true,
            maxLines: 1,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              labelText: 'Repository',
            ),
            onFieldSubmitted: (value) => _addSource(),
          ),
          const SizedBox(height: Constants.spacingMiddle),
        ],
      );
    }

    if (_githubType == FDGitHubType.searchissuesandpullrequests) {
      githubWidgets.addAll(
        [
          TextFormField(
            controller: _githubQueryNameController,
            keyboardType: TextInputType.text,
            autocorrect: false,
            enableSuggestions: true,
            maxLines: 1,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              labelText: 'Query Name',
            ),
            onFieldSubmitted: (value) => _addSource(),
          ),
          const SizedBox(height: Constants.spacingMiddle),
          TextFormField(
            controller: _githubQueryController,
            keyboardType: TextInputType.text,
            autocorrect: false,
            enableSuggestions: true,
            maxLines: 1,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              labelText: 'Query',
            ),
            onFieldSubmitted: (value) => _addSource(),
          ),
          const SizedBox(height: Constants.spacingMiddle),
        ],
      );
    }

    if (_githubType == FDGitHubType.useractivities) {
      githubWidgets.addAll(
        [
          TextFormField(
            controller: _githubUserController,
            keyboardType: TextInputType.text,
            autocorrect: false,
            enableSuggestions: true,
            maxLines: 1,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              labelText: 'User',
            ),
            onFieldSubmitted: (value) => _addSource(),
          ),
          const SizedBox(height: Constants.spacingMiddle),
        ],
      );
    }

    if (_githubType == FDGitHubType.repositoryactivities) {
      githubWidgets.addAll(
        [
          TextFormField(
            controller: _githubRepositoryController,
            keyboardType: TextInputType.text,
            autocorrect: false,
            enableSuggestions: true,
            maxLines: 1,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              labelText: 'Repository',
            ),
            onFieldSubmitted: (value) => _addSource(),
          ),
          const SizedBox(height: Constants.spacingMiddle),
        ],
      );
    }

    if (_githubType == FDGitHubType.organizationactivitiesprivate ||
        _githubType == FDGitHubType.organizationactivitiespublic) {
      githubWidgets.addAll(
        [
          TextFormField(
            controller: _githubOrganizationController,
            keyboardType: TextInputType.text,
            autocorrect: false,
            enableSuggestions: true,
            maxLines: 1,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              labelText: 'Organization',
            ),
            onFieldSubmitted: (value) => _addSource(),
          ),
          const SizedBox(height: Constants.spacingMiddle),
        ],
      );
    }

    return githubWidgets;
  }

  @override
  void dispose() {
    _githubRepositoryController.dispose();
    _githubUserController.dispose();
    _githubOrganizationController.dispose();
    _githubQueryNameController.dispose();
    _githubQueryController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AddSourceForm(
      onTap: _addSource,
      isLoading: _isLoading,
      error: _error,
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            MarkdownBody(
              selectable: true,
              data: _helpText,
              onTapLink: (text, href, title) {
                try {
                  if (href != null) {
                    openUrl(href);
                  }
                } catch (_) {}
              },
            ),
            const SizedBox(
              height: Constants.spacingMiddle,
            ),
            DropdownButton<FDGitHubType>(
              value: _githubType,
              isExpanded: true,
              underline: Container(height: 1, color: Constants.primary),
              onChanged: (FDGitHubType? value) {
                setState(() {
                  _githubType = value!;
                });
              },
              items: FDGitHubType.values
                  .map<DropdownMenuItem<FDGitHubType>>((FDGitHubType value) {
                return DropdownMenuItem<FDGitHubType>(
                  value: value,
                  child: Text(value.toLocalizedString()),
                );
              }).toList(),
            ),
            const SizedBox(
              height: Constants.spacingMiddle,
            ),
            ..._buildForm(),
          ],
        ),
      ),
    );
  }
}
