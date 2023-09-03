import 'package:flutter/material.dart';

import 'package:supabase_flutter/supabase_flutter.dart' as supabase;

import 'package:feeddeck/utils/api_exception.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';
import 'package:feeddeck/widgets/signin/signin.dart';

/// The [SettingsProfileDeleteAccount] displays the users current profile and allows a user
/// to edit his profile information, to sign out and to delete his account.
class SettingsProfileDeleteAccount extends StatefulWidget {
  const SettingsProfileDeleteAccount({super.key});

  @override
  State<SettingsProfileDeleteAccount> createState() =>
      _SettingsProfileDeleteAccountState();
}

class _SettingsProfileDeleteAccountState
    extends State<SettingsProfileDeleteAccount> {
  bool _isLoading = false;

  /// [_showDeleteDialog] creates a new dialog, which is shown before the user
  /// account is deleted. This is done to raise the awareness what it means to
  /// delete the account and to avoid accidently deletions.
  _showDeleteDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          insetPadding: EdgeInsets.symmetric(
            horizontal: MediaQuery.of(context).size.width >=
                    (Constants.centeredFormMaxWidth +
                        2 * Constants.spacingMiddle)
                ? (MediaQuery.of(context).size.width -
                        Constants.centeredFormMaxWidth) /
                    2
                : Constants.spacingMiddle,
          ),
          title: const Text('Delete Account'),
          content: const Text(
            'Are you sure that you want to delete your FeedDeck account. If you delete your FeedDeck account you can not access FeedDeck anymore. This will also delete all your data and can not be undone.',
          ),
          actions: [
            TextButton(
              child: const Text(
                'Cancel',
                style: TextStyle(color: Constants.onSurface),
              ),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            TextButton(
              onPressed: _isLoading ? null : () => _deleteUser(),
              child: _isLoading
                  ? const ElevatedButtonProgressIndicator()
                  : const Text(
                      'Delete',
                      style: TextStyle(color: Constants.error),
                    ),
            ),
          ],
        );
      },
    );
  }

  /// [_deleteUser] deletes the currently authenticated users account, including
  /// all his data. The account is deleted via an edge function since we need a
  /// Supabase admin client to do it. If the account was deleted successfully
  /// we also sign out the user and redirect him to the [SignIn] screen.
  Future<void> _deleteUser() async {
    Navigator.of(context).pop();
    setState(() {
      _isLoading = true;
    });

    try {
      final result = await supabase.Supabase.instance.client.functions.invoke(
        'delete-user-v1',
      );

      if (result.status != 200) {
        throw ApiException(result.data['error'], result.status);
      }

      await supabase.Supabase.instance.client.auth.signOut();

      setState(() {
        _isLoading = false;
      });
      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(
          builder: (BuildContext context) => const SignIn(),
        ),
        (route) => false,
      );
    } on ApiException catch (err) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          duration: const Duration(seconds: 10),
          backgroundColor: Constants.error,
          showCloseIcon: true,
          content: Text(
            err.message,
            style: const TextStyle(color: Constants.onError),
          ),
        ),
      );
    } catch (_) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  /// [buildIcon] return the provided icon or when the [_isLoading] state is
  /// `true` is returns a circular progress indicator.
  Widget buildIcon(Icon icon) {
    if (_isLoading) return const ElevatedButtonProgressIndicator();
    return icon;
  }

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () => _showDeleteDialog(),
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
                            Characters('Delete Account')
                                .replaceAll(
                                  Characters(''),
                                  Characters('\u{200B}'),
                                )
                                .toString(),
                            maxLines: 1,
                            style: const TextStyle(
                              overflow: TextOverflow.ellipsis,
                              color: Constants.error,
                            ),
                          ),
                        ],
                      ),
                    ),
                    buildIcon(
                      const Icon(
                        Icons.delete,
                        color: Constants.error,
                      ),
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
