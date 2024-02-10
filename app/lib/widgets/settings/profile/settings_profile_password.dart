import 'package:flutter/material.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';

/// The [SettingsProfilePassword] widget can be used to update the users
/// password.
class SettingsProfilePassword extends StatefulWidget {
  const SettingsProfilePassword({super.key});

  @override
  State<SettingsProfilePassword> createState() =>
      _SettingsProfilePasswordState();
}

class _SettingsProfilePasswordState extends State<SettingsProfilePassword> {
  final _formKey = GlobalKey<FormState>();
  final _newPasswordController = TextEditingController();
  bool _editMode = false;
  bool _isLoading = false;
  String _error = '';

  /// [_validatePassword] validates the email address provided via the
  /// [TextField] of the [_newPasswordController]. The password field can not be
  /// empty and must have a minimum length of 8 characters. The password must
  /// also contain at least one upper case letter, one lower case letter and one
  /// number.
  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }

    if (value.length < 8) {
      return 'Password must be a least 8 characters long';
    }

    String pattern = r'^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$';
    RegExp regExp = RegExp(pattern);
    if (!regExp.hasMatch(value)) {
      return 'Password must contain at least one upper case letter, one lower case letter and one number';
    }

    return null;
  }

  /// [_updatePassword] updates the users password, to the value provided via
  /// the [_newPasswordController] and sets the [_editMode] to `false` when the
  /// update was successful.
  Future<void> _updatePassword() async {
    if (_formKey.currentState != null && _formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
        _error = '';
      });

      try {
        await Supabase.instance.client.auth.updateUser(
          UserAttributes(
            password: _newPasswordController.text,
          ),
        );

        setState(() {
          _editMode = false;
          _isLoading = false;
          _error = '';
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              duration: Duration(seconds: 10),
              backgroundColor: Constants.primary,
              showCloseIcon: true,
              content: Text(
                'Password updated successfully',
                style: TextStyle(color: Constants.onPrimary),
              ),
            ),
          );
        }
      } catch (err) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to update password: ${err.toString()}';
        });
      }
    }
  }

  /// [buildIcon] return the provided icon or when the [_isLoading] state is
  /// `true` is returns a circular progress indicator.
  Widget buildIcon(Icon icon) {
    if (_isLoading) return const ElevatedButtonProgressIndicator();
    return icon;
  }

  /// [_buildError] returns a widget to display the [_error] when it is not an
  /// empty string.
  Widget _buildError() {
    if (_error != '') {
      return Padding(
        padding: const EdgeInsets.only(
          bottom: Constants.spacingMiddle,
          left: Constants.spacingMiddle,
          right: Constants.spacingMiddle,
        ),
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
  void dispose() {
    _newPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    /// Only users which signed up using the email provider should be able to
    /// update their password, so that we returns an empty [Container] when the
    /// provider is not `email`.
    if (Supabase.instance.client.auth.currentUser?.appMetadata['provider'] !=
        'email') {
      return Container();
    }

    if (_editMode) {
      return Card(
        color: Constants.secondary,
        margin: const EdgeInsets.only(
          bottom: Constants.spacingSmall,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.all(
                Constants.spacingMiddle,
              ),
              child: Form(
                key: _formKey,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          TextFormField(
                            controller: _newPasswordController,
                            keyboardType: TextInputType.text,
                            obscureText: true,
                            autocorrect: false,
                            enableSuggestions: false,
                            maxLines: 1,
                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),
                              labelText: 'New Password',
                            ),
                            validator: (value) => _validatePassword(value),
                            onFieldSubmitted: (value) => _updatePassword(),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: _isLoading ? null : () => _updatePassword(),
                      icon: _isLoading
                          ? const ElevatedButtonProgressIndicator()
                          : const Icon(Icons.save),
                    ),
                    IconButton(
                      onPressed: _isLoading
                          ? null
                          : () {
                              setState(() {
                                _editMode = false;
                              });
                            },
                      icon: _isLoading
                          ? const ElevatedButtonProgressIndicator()
                          : const Icon(Icons.cancel),
                    ),
                  ],
                ),
              ),
            ),
            _buildError(),
          ],
        ),
      );
    }

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () {
          setState(() {
            _newPasswordController.text = '';
            _editMode = true;
            _isLoading = false;
            _error = '';
          });
        },
        child: Card(
          color: Constants.secondary,
          margin: const EdgeInsets.only(
            bottom: Constants.spacingSmall,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.all(
                  Constants.spacingMiddle,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            Characters('Change Password')
                                .replaceAll(
                                  Characters(''),
                                  Characters('\u{200B}'),
                                )
                                .toString(),
                            maxLines: 1,
                            style: const TextStyle(
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                    buildIcon(
                      const Icon(Icons.edit),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
