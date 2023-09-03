import 'package:flutter/material.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';

/// The [SettingsProfileEmail] widget can be used to view and update the users
/// email address.
class SettingsProfileEmail extends StatefulWidget {
  const SettingsProfileEmail({super.key});

  @override
  State<SettingsProfileEmail> createState() => _SettingsProfileEmailState();
}

class _SettingsProfileEmailState extends State<SettingsProfileEmail> {
  final _formKey = GlobalKey<FormState>();
  String _emailAddress = '';
  bool _editMode = false;
  bool _isLoading = false;
  String _error = '';

  /// [_validateEmailAddress] validates the email address provided via the
  /// [TextField] for the email address. The email address field can not be
  /// empty and must match the regular expression defined below.
  String? _validateEmailAddress(String? value) {
    RegExp regex = RegExp(
      r'^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$',
    );

    if (value == null || value.isEmpty) {
      return 'Email address is required';
    }

    if (!regex.hasMatch(value)) {
      return 'Invalid email address';
    }

    return null;
  }

  /// [_updateEmailAddress] updates the users email address. If the update was
  /// successful the [_editMode] is set to `false`. If the update failed an
  /// error message is displayed.
  Future<void> _updateEmailAddress() async {
    if (_formKey.currentState != null && _formKey.currentState!.validate()) {
      _formKey.currentState?.save();
      setState(() {
        _isLoading = true;
        _error = '';
      });

      try {
        await Supabase.instance.client.auth.updateUser(
          UserAttributes(
            email: _emailAddress,
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
                'Email address updated successfully. We send you an email to your old and new email address to confirm the change.',
                style: TextStyle(color: Constants.onPrimary),
              ),
            ),
          );
        }
      } catch (err) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to update email address: ${err.toString()}';
        });
      }
    }
  }

  /// [buildEditIcon] returns the edit icon or when the [_isLoading] state is
  /// `true` is returns a circular progress indicator. Both icons are only shown
  /// when the user account was created via the email provider, since only then
  /// users can edit their email address.
  Widget buildEditIcon() {
    if (Supabase.instance.client.auth.currentUser?.appMetadata['provider'] ==
        'email') {
      if (_isLoading) {
        return const ElevatedButtonProgressIndicator();
      }

      return const Icon(Icons.edit);
    }

    return Container();
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
  Widget build(BuildContext context) {
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
                            initialValue: Supabase
                                    .instance.client.auth.currentUser?.email ??
                                '',
                            onSaved: (String? value) {
                              _emailAddress = value ??
                                  Supabase.instance.client.auth.currentUser
                                      ?.email ??
                                  '';
                            },
                            keyboardType: TextInputType.text,
                            autocorrect: false,
                            enableSuggestions: false,
                            maxLines: 1,
                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),
                              labelText: 'Email',
                            ),
                            validator: (value) => _validateEmailAddress(value),
                            onFieldSubmitted: (value) => _updateEmailAddress(),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed:
                          _isLoading ? null : () => _updateEmailAddress(),
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
        onTap: Supabase.instance.client.auth.currentUser
                    ?.appMetadata['provider'] ==
                'email'
            ? () {
                setState(() {
                  _editMode = true;
                  _error = '';
                });
              }
            : null,
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
                            Characters(
                              Supabase.instance.client.auth.currentUser
                                      ?.email ??
                                  '',
                            )
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
                    buildEditIcon(),
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
