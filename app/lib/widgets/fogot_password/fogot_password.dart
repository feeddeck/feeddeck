import 'package:flutter/material.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:feeddeck/repositories/settings_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';
import 'package:feeddeck/widgets/general/logo.dart';

/// The [FogotPassword] widget displays a forgot password page which is used to
/// send an email to a user to reset the password.
class FogotPassword extends StatefulWidget {
  const FogotPassword({super.key});

  @override
  State<FogotPassword> createState() => _FogotPasswordState();
}

class _FogotPasswordState extends State<FogotPassword> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _isLoading = false;
  String _error = '';
  String _success = '';

  /// [_validateEmailAddress] validates the email address provided via the
  /// [TextField] of the [_emailController]. The email address field can not be
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

  /// The [_sendResetPasswordEmail] function will send an email to the provided
  /// addess with a link to reset the password. If the email could not be send
  /// an error message is displayed. If the email was send a info message is
  /// displayed.
  Future<void> _sendResetPasswordEmail() async {
    if (_formKey.currentState != null && _formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      try {
        await Supabase.instance.client.auth.resetPasswordForEmail(
          _emailController.text,
          redirectTo: '${SettingsRepository().supabaseSiteUrl}/reset-password',
        );

        setState(() {
          _isLoading = false;
          _error = '';
          _success = 'We send you an email to reset your password.';
        });
      } on AuthException catch (err) {
        setState(() {
          _isLoading = false;
          _error = 'Reset password email was not sent: ${err.message}';
          _success = '';
        });
      } catch (err) {
        setState(() {
          _isLoading = false;
          _error = 'Reset password email was not sent: ${err.toString()}';
          _success = '';
        });
      }
    }
  }

  /// [_buildError] returns a widget to display the [_error] when it is not an
  /// empty string.
  List<Widget> _buildError() {
    if (_error != '') {
      return [
        const SizedBox(
          height: Constants.spacingMiddle,
        ),
        Text(
          _error,
          style: const TextStyle(
            color: Constants.error,
          ),
        ),
      ];
    }

    return [];
  }

  /// [_buildSuccess] returns a widget to display the [_success] when it is not
  /// an empty string.
  List<Widget> _buildSuccess() {
    if (_success != '') {
      return [
        const SizedBox(
          height: Constants.spacingMiddle,
        ),
        Text(
          _success,
          style: const TextStyle(
            color: Constants.primary,
          ),
        ),
      ];
    }

    return [];
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: true,
      ),
      body: SingleChildScrollView(
        child: Center(
          child: Container(
            constraints: const BoxConstraints(
              maxWidth: Constants.centeredFormMaxWidth,
            ),
            padding: const EdgeInsets.all(
              Constants.spacingMiddle,
            ),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Logo(size: Constants.centeredFormLogoSize),
                  const SizedBox(
                    height: Constants.spacingExtraLarge,
                  ),
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    autocorrect: false,
                    enableSuggestions: true,
                    maxLines: 1,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      labelText: 'Email',
                    ),
                    validator: (value) => _validateEmailAddress(value),
                    onFieldSubmitted: (value) => _sendResetPasswordEmail(),
                  ),
                  ..._buildError(),
                  ..._buildSuccess(),
                  const SizedBox(
                    height: Constants.spacingMiddle,
                  ),
                  ElevatedButton.icon(
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
                    label: const Text('Send Reset Password Email'),
                    onPressed:
                        _isLoading ? null : () => _sendResetPasswordEmail(),
                    icon: _isLoading
                        ? const ElevatedButtonProgressIndicator()
                        : const Icon(Icons.login),
                  ),
                  const SizedBox(
                    height: Constants.spacingLarge,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
