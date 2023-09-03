import 'package:flutter/material.dart';

import 'package:flutter_native_splash/flutter_native_splash.dart';

import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/openurl.dart';
import 'package:feeddeck/widgets/general/logo.dart';

/// The [Confirmation] widget displays a confirmation page where the user can
/// click a link to finish the sign up, change email or reset password process.
///
/// This is necessary because certain email providers have spam detection or
/// other security features that prefetch URL links from incoming emails This
/// would lead to a "Token has expired or is invalid" error, when the user
/// clicks on the link in the email.
///
/// See: https://supabase.com/docs/guides/auth/auth-email-templates#email-prefetching
class Confirmation extends StatefulWidget {
  const Confirmation({
    super.key,
    required this.template,
    required this.confirmationUrl,
  });

  final String template;
  final String confirmationUrl;

  @override
  State<Confirmation> createState() => _ConfirmationState();
}

class _ConfirmationState extends State<Confirmation> {
  /// [_openUrl] opens the item url in the default browser of the current
  /// device.
  Future<void> _openUrl() async {
    try {
      await openUrl(widget.confirmationUrl);
    } catch (_) {}
  }

  Widget _buildConfirmationButton() {
    switch (widget.template) {
      case 'change-email-address':
        return ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            maximumSize: const Size.fromHeight(
              Constants.elevatedButtonSize,
            ),
            minimumSize: const Size.fromHeight(
              Constants.elevatedButtonSize,
            ),
          ),
          label: const Text('Confirm Change of Email Address'),
          onPressed: () => _openUrl(),
          icon: const Icon(Icons.email),
        );
      case 'confirm-signup':
        return ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            maximumSize: const Size.fromHeight(
              Constants.elevatedButtonSize,
            ),
            minimumSize: const Size.fromHeight(
              Constants.elevatedButtonSize,
            ),
          ),
          label: const Text('Confirm Sign Up'),
          onPressed: () => _openUrl(),
          icon: const Icon(Icons.login),
        );
      case 'reset-password':
        return ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            maximumSize: const Size.fromHeight(
              Constants.elevatedButtonSize,
            ),
            minimumSize: const Size.fromHeight(
              Constants.elevatedButtonSize,
            ),
          ),
          label: const Text('Reset Password'),
          onPressed: () => _openUrl(),
          icon: const Icon(Icons.password),
        );
      default:
        return Container();
    }
  }

  @override
  void initState() {
    super.initState();
    FlutterNativeSplash.remove();
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
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Logo(size: Constants.centeredFormLogoSize),
                const SizedBox(
                  height: Constants.spacingExtraLarge,
                ),
                _buildConfirmationButton(),
                const SizedBox(
                  height: Constants.spacingLarge,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
