import 'package:flutter/material.dart';

import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as supabase;

import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/deck/deck_layout.dart';
import 'package:feeddeck/widgets/fogot_password/fogot_password.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';
import 'package:feeddeck/widgets/general/logo.dart';
import 'package:feeddeck/widgets/signup/signup.dart';

/// The [SignInWithFeedDeck] widget displays a form to sign in with an email
/// address and password. The widget also allows a user to sign up and to reset
/// his password.
class SignInWithFeedDeck extends StatefulWidget {
  const SignInWithFeedDeck({super.key});

  @override
  State<SignInWithFeedDeck> createState() => _SignInWithFeedDeckState();
}

class _SignInWithFeedDeckState extends State<SignInWithFeedDeck> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String _error = '';

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

  /// [_validatePassword] validates the email address provided via the
  /// [TextField] of the [_passwordController]. The password field can not be
  /// empty and must have a minimum length of 6 characters.
  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }

    if (value.length < 6) {
      return 'Password must be a least 6 characters long';
    }

    return null;
  }

  /// [_signIn] signs in the user with the email address and password provided
  /// via the [_emailController] and [_passwordController]. If the user can not
  /// be signed in an error message is displayed. If the user is signed in then
  /// the user is redirected to the deck page.
  Future<void> _signIn() async {
    if (_formKey.currentState != null && _formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
        _error = '';
      });

      try {
        await Provider.of<AppRepository>(
          context,
          listen: false,
        ).signInWithPassword(
          _emailController.text,
          _passwordController.text,
        );

        setState(() {
          _isLoading = false;
          _error = '';
        });

        if (!mounted) return;
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(
            builder: (BuildContext context) => const DeckLayout(),
          ),
          (route) => false,
        );
      } on supabase.AuthException catch (err) {
        setState(() {
          _isLoading = false;
          _error = 'Sign in failed: ${err.message}';
        });
      } catch (err) {
        setState(() {
          _isLoading = false;
          _error = 'Sign in failed: ${err.toString()}';
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
                    onFieldSubmitted: (value) => _signIn(),
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
                    onFieldSubmitted: (value) => _signIn(),
                  ),
                  ..._buildError(),
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
                    label: const Text('Sign In'),
                    onPressed: _isLoading ? null : () => _signIn(),
                    icon: _isLoading
                        ? const ElevatedButtonProgressIndicator()
                        : const Icon(Icons.login),
                  ),
                  const SizedBox(
                    height: Constants.spacingLarge,
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      MouseRegion(
                        cursor: SystemMouseCursors.click,
                        child: GestureDetector(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (BuildContext context) =>
                                    const SignUp(),
                              ),
                            );
                          },
                          child: const Text(
                            'Sign Up',
                            style: TextStyle(fontSize: 16.0),
                          ),
                        ),
                      ),
                      MouseRegion(
                        cursor: SystemMouseCursors.click,
                        child: GestureDetector(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (BuildContext context) =>
                                    const FogotPassword(),
                              ),
                            );
                          },
                          child: const Text(
                            'Forgot Password?',
                            style: TextStyle(fontSize: 16.0),
                          ),
                        ),
                      ),
                    ],
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
