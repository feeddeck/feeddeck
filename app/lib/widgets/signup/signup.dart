import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/disposable_emails.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';
import 'package:feeddeck/widgets/general/logo.dart';

/// The [SignUp] widget displays a sign up page which is used to create a new
/// account for the user.
class SignUp extends StatefulWidget {
  const SignUp({super.key});

  @override
  State<SignUp> createState() => _SignUpState();
}

class _SignUpState extends State<SignUp> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String _error = '';
  String _success = '';

  /// [_validateEmailAddress] validates the email address provided via the
  /// [TextField] of the [_emailController]. The email address field can not be
  /// empty and must match the regular expression defined below.
  ///
  /// During the sign up we also check if the email address is a disposable
  /// email address. Disposable email addresses are often used to create
  /// temporary accounts and are not allowed to be used for the sign up.
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

    if (isDisposableEmail(value)) {
      return 'Invalid email address';
    }

    return null;
  }

  /// [_validatePassword] validates the email address provided via the
  /// [TextField] of the [_passwordController]. The password field can not be
  /// empty and must have a minimum length of 6 characters.
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

  /// [_signUp] creates a new account for the user with the provided email
  /// address and password. Depending on the result of the `auth.signUp` call we
  /// show a success or error message.
  Future<void> _signUp() async {
    if (_formKey.currentState != null && _formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
        _error = '';
        _success = '';
      });

      try {
        await Supabase.instance.client.auth.signUp(
          email: _emailController.text,
          password: _passwordController.text,
          emailRedirectTo: kIsWeb ||
                  Platform.isLinux ||
                  Platform.isMacOS ||
                  Platform.isWindows
              ? null
              : 'app.feeddeck.feeddeck://signin-callback/',
        );

        setState(() {
          _isLoading = false;
          _error = '';
          _success =
              'Thank you for signing up to FeedDeck. We send you an email to confirm your registration.';
        });
      } on AuthException catch (err) {
        setState(() {
          _isLoading = false;
          _error = 'Sign up failed: ${err.message}';
          _success = '';
        });
      } catch (err) {
        setState(() {
          _isLoading = false;
          _error = 'Sign up failed: ${err.toString()}';
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
    _passwordController.dispose();
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
                    onFieldSubmitted: (value) => _signUp(),
                  ),
                  const SizedBox(
                    height: Constants.spacingMiddle,
                  ),
                  TextFormField(
                    controller: _passwordController,
                    keyboardType: TextInputType.text,
                    obscureText: true,
                    autocorrect: false,
                    enableSuggestions: false,
                    maxLines: 1,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      labelText: 'Password',
                      errorMaxLines: 2,
                    ),
                    validator: (value) => _validatePassword(value),
                    onFieldSubmitted: (value) => _signUp(),
                  ),
                  ..._buildError(),
                  ..._buildSuccess(),
                  const SizedBox(
                    height: Constants.spacingMiddle,
                  ),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      maximumSize: const Size.fromHeight(
                        Constants.elevatedButtonSize,
                      ),
                      minimumSize: const Size.fromHeight(
                        Constants.elevatedButtonSize,
                      ),
                    ),
                    label: const Text('Sign Up'),
                    onPressed: _isLoading ? null : () => _signUp(),
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
