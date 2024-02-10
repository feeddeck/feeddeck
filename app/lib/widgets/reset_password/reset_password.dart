import 'package:flutter/material.dart';

import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';
import 'package:feeddeck/widgets/general/logo.dart';
import 'package:feeddeck/widgets/home/home.dart';

/// The [ResetPassword] widget displays a textfield which can be used by a user
/// to set a new password. This page should only be opened via the link provided
/// in the email to reset the password.
class ResetPassword extends StatefulWidget {
  const ResetPassword({super.key});

  @override
  State<ResetPassword> createState() => _ResetPasswordState();
}

class _ResetPasswordState extends State<ResetPassword> {
  final _formKey = GlobalKey<FormState>();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String _error = '';
  String _success = '';

  /// [_validatePassword] validates the email address provided via the
  /// [TextField] of the [_passwordController]. The password field can not be
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

  /// The [_setNewPassword] function will set the provided password from the
  /// [_passwordController] as the new password for the user.
  Future<void> _setNewPassword() async {
    if (_formKey.currentState != null && _formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      try {
        await Supabase.instance.client.auth.updateUser(
          UserAttributes(
            password: _passwordController.text,
          ),
        );

        setState(() {
          _isLoading = false;
          _error = '';
          _success = 'Password was updated.';
        });
      } on AuthException catch (err) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to update password: ${err.message}';
          _success = '';
        });
      } catch (err) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to update password: ${err.toString()}';
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

  /// [_buildSuccess] returns a widget to display the [_success] message when it
  /// is not an empty string and a button to navigate back to the [Home] page.
  /// If the success message is empty we display a button to trigger the
  /// [_setNewPassword] function.
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
          label: const Text('Home'),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (BuildContext context) => const Home(),
              ),
            );
          },
          icon: const Icon(Icons.home),
        ),
      ];
    }

    return [
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
        label: const Text('Set New Password'),
        onPressed: _isLoading ? null : () => _setNewPassword(),
        icon: _isLoading
            ? const ElevatedButtonProgressIndicator()
            : const Icon(Icons.save),
      ),
    ];
  }

  @override
  void initState() {
    super.initState();
    FlutterNativeSplash.remove();
  }

  @override
  void dispose() {
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
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
                    controller: _passwordController,
                    keyboardType: TextInputType.text,
                    obscureText: true,
                    autocorrect: false,
                    enableSuggestions: false,
                    maxLines: 1,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      labelText: 'New Password',
                      errorMaxLines: 2,
                    ),
                    validator: (value) => _validatePassword(value),
                    onFieldSubmitted: (value) => _setNewPassword(),
                  ),
                  ..._buildError(),
                  ..._buildSuccess(),
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
