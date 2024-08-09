import 'package:flutter/material.dart';

import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:provider/provider.dart';

import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/repositories/profile_repository.dart';
import 'package:feeddeck/utils/api_exception.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/openurl.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';
import 'package:feeddeck/widgets/settings/accounts/utils/settings_accounts_actions.dart';
import 'package:feeddeck/widgets/settings/accounts/utils/settings_accounts_item.dart';

const _helpText = '''
Provide a GitHub token to connect your GitHub account to your profile. You can
create a token on in the
[developer settings](https://github.com/settings/tokens) section in the GitHub
account settings.

The token needs the following permissions: **notifications**,
**read:discussion**, **read:org**, **read:project**, **read:user**, **repo**.
You can also use a token with less permissions, but then some features might not
work.
''';

/// The [SettingsAccountsGithub] widget implements the GitHub account section of
/// the settings page. Here the user can add / remove his GitHub account to his
/// profile.
class SettingsAccountsGithub extends StatelessWidget {
  const SettingsAccountsGithub({super.key});

  Future<void> _deleteAccount(BuildContext context) async {
    try {
      await Provider.of<ProfileRepository>(
        context,
        listen: false,
      ).githubDeleteAccount();
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    ProfileRepository profile = Provider.of<ProfileRepository>(
      context,
      listen: true,
    );

    return SettingsAccountsItem(
      name: FDSourceType.github.toLocalizedString(),
      isConnected: profile.accountGithub,
      onTap: profile.status == FDProfileStatus.uninitialized
          ? null
          : () {
              /// If the user has already connected his GitHub account, we show the
              /// accounts so that a user can re-connect his GitHub account or delete
              /// the stored token from his profile.
              if (profile.accountGithub) {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  isDismissible: true,
                  useSafeArea: true,
                  elevation: 0,
                  backgroundColor: Colors.transparent,
                  constraints: const BoxConstraints(
                    maxWidth: Constants.centeredFormMaxWidth,
                  ),
                  builder: (BuildContext context) {
                    return SettingsAccountsActions(
                      delete: () {
                        return _deleteAccount(context);
                      },
                      reconnect: () {
                        return showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          isDismissible: true,
                          useSafeArea: true,
                          backgroundColor: Colors.transparent,
                          shape: const RoundedRectangleBorder(
                            borderRadius: BorderRadius.vertical(
                              top: Radius.circular(Constants.spacingMiddle),
                            ),
                          ),
                          clipBehavior: Clip.antiAliasWithSaveLayer,
                          constraints: const BoxConstraints(
                            maxWidth: Constants.centeredFormMaxWidth,
                          ),
                          builder: (BuildContext context) {
                            return const SettingsAccountsGithubAdd();
                          },
                        );
                      },
                    );
                  },
                );
              } else {
                /// If the user has not yet connected his GitHub account, we show the
                /// modal bottom sheet with the form to add a GitHub token to his
                /// profile.
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  isDismissible: true,
                  useSafeArea: true,
                  backgroundColor: Colors.transparent,
                  shape: const RoundedRectangleBorder(
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(Constants.spacingMiddle),
                    ),
                  ),
                  clipBehavior: Clip.antiAliasWithSaveLayer,
                  constraints: const BoxConstraints(
                    maxWidth: Constants.centeredFormMaxWidth,
                  ),
                  builder: (BuildContext context) {
                    return const SettingsAccountsGithubAdd();
                  },
                );
              }
            },
    );
  }
}

/// The [SettingsAccountsGithubAdd] widget displays a modal bottom sheet with a
/// form which can be used by the user to provide an token for his GitHub
/// account. When the user clicks on "Add account" button we call the function
/// to add the provided token to his account.
class SettingsAccountsGithubAdd extends StatefulWidget {
  const SettingsAccountsGithubAdd({super.key});

  @override
  State<SettingsAccountsGithubAdd> createState() =>
      _SettingsAccountsGithubAddState();
}

class _SettingsAccountsGithubAddState extends State<SettingsAccountsGithubAdd> {
  final _formKey = GlobalKey<FormState>();
  final _tokenController = TextEditingController();
  bool _isLoading = false;
  String _error = '';

  /// [_validateToken] validates the token provided via the [TextField] of the
  /// [_tokenController]. The token field can not be empty.
  String? _validateToken(String? value) {
    if (value == null || value.isEmpty) {
      return 'Token is required';
    }

    return null;
  }

  /// [_addAccount] adds the provided GitHub token to the users profile. When we
  /// are able to add the token we close the modal bottom sheet. In case of an
  /// error we show the error message to the user.
  Future<void> _addAccount() async {
    if (_formKey.currentState != null && _formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
        _error = '';
      });

      try {
        await Provider.of<ProfileRepository>(
          context,
          listen: false,
        ).githubAddAccount(_tokenController.text);

        setState(() {
          _isLoading = false;
          _error = '';
        });

        if (!mounted) return;
        Navigator.of(context).pop();
      } on ApiException catch (err) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to add account: ${err.message}';
        });
      } catch (err) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to add account: ${err.toString()}';
        });
      }
    }
  }

  /// [_buildError] returns a widget to display the [_error] when it is not an
  /// empty string.
  Widget _buildError() {
    if (_error != '') {
      return Padding(
        padding: const EdgeInsets.all(Constants.spacingMiddle),
        child: Text(
          _error,
          style: const TextStyle(
            color: Constants.error,
          ),
        ),
      );
    }

    return Container();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        shape: const Border(
          bottom: BorderSide(
            color: Constants.dividerColor,
            width: 1,
          ),
        ),
        title: Text(
          FDSourceType.github.toLocalizedString(),
        ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.close,
            ),
            onPressed: () {
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(Constants.spacingMiddle),
                child: SingleChildScrollView(
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
                        TextFormField(
                          controller: _tokenController,
                          keyboardType: TextInputType.text,
                          autocorrect: false,
                          enableSuggestions: true,
                          maxLines: 1,
                          decoration: const InputDecoration(
                            border: OutlineInputBorder(),
                            labelText: 'Token',
                          ),
                          validator: (value) => _validateToken(value),
                          onFieldSubmitted: (value) => _addAccount(),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(
              height: Constants.spacingSmall,
            ),
            const Divider(
              color: Constants.dividerColor,
              height: 1,
              thickness: 1,
            ),
            _buildError(),
            Padding(
              padding: const EdgeInsets.all(Constants.spacingMiddle),
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Constants.secondary,
                  foregroundColor: Constants.onSecondary,
                  maximumSize: const Size.fromHeight(
                    Constants.elevatedButtonSize,
                  ),
                  minimumSize: const Size.fromHeight(
                    Constants.elevatedButtonSize,
                  ),
                ),
                label: const Text('Add Account'),
                onPressed: _isLoading ? null : _addAccount,
                icon: _isLoading
                    ? const ElevatedButtonProgressIndicator()
                    : const Icon(Icons.add),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
