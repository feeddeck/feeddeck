import 'package:flutter/material.dart';

import 'package:feeddeck/repositories/settings_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';
import 'package:feeddeck/widgets/general/logo.dart';

class SetSettings extends StatefulWidget {
  const SetSettings({super.key});

  @override
  State<SetSettings> createState() => _SetSettingsState();
}

class _SetSettingsState extends State<SetSettings> {
  final _formKey = GlobalKey<FormState>();
  final _supabaseUrlController = TextEditingController();
  final _supabaseAnonKeyController = TextEditingController();
  final _supabaseSiteUrlController = TextEditingController();
  final _googleClientIdController = TextEditingController();
  bool _isLoading = false;
  String _error = '';
  String _success = '';

  /// [_validateRequired] validates that the a [TextField] is not empty.
  String? _validateRequired(String? value) {
    if (value == null || value.isEmpty) {
      return 'Field is required';
    }

    return null;
  }

  Future<void> _save() async {
    if (_formKey.currentState != null && _formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
        _error = '';
        _success = '';
      });

      try {
        await SettingsRepository().save(
          _supabaseUrlController.text,
          _supabaseAnonKeyController.text,
          _supabaseSiteUrlController.text,
          _googleClientIdController.text,
        );

        setState(() {
          _isLoading = false;
          _error = '';
          _success =
              'Your settings were saved successfully. Please restart the app to apply the changes.';
        });
      } catch (err) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to save settings: ${err.toString()}';
          _success = '';
        });
      }
    }
  }

  Future<void> _reset() async {
    setState(() {
      _isLoading = true;
      _error = '';
      _success = '';
    });

    try {
      await SettingsRepository().delete();

      setState(() {
        _isLoading = false;
        _error = '';
        _success =
            'The default settings were restored successfully. Please restart the app to apply the changes.';
      });
    } catch (err) {
      setState(() {
        _isLoading = false;
        _error = 'Failed to restore default settings: ${err.toString()}';
        _success = '';
      });
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
    _supabaseUrlController.dispose();
    _supabaseAnonKeyController.dispose();
    _supabaseSiteUrlController.dispose();
    _googleClientIdController.dispose();
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
                  const Text(
                    'You can use your own Supabase instance within the app, but please be aware that you only change the settings when you know what you are doing.',
                  ),
                  const SizedBox(
                    height: Constants.spacingMiddle,
                  ),
                  TextFormField(
                    controller: _supabaseUrlController,
                    keyboardType: TextInputType.none,
                    autocorrect: false,
                    enableSuggestions: true,
                    maxLines: 1,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      labelText: 'Supabase Url',
                    ),
                    validator: (value) => _validateRequired(value),
                    onFieldSubmitted: (value) => _save(),
                  ),
                  const SizedBox(
                    height: Constants.spacingMiddle,
                  ),
                  TextFormField(
                    controller: _supabaseAnonKeyController,
                    keyboardType: TextInputType.none,
                    autocorrect: false,
                    enableSuggestions: true,
                    maxLines: 1,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      labelText: 'Supabase Anon Key',
                    ),
                    validator: (value) => _validateRequired(value),
                    onFieldSubmitted: (value) => _save(),
                  ),
                  const SizedBox(
                    height: Constants.spacingMiddle,
                  ),
                  TextFormField(
                    controller: _supabaseSiteUrlController,
                    keyboardType: TextInputType.none,
                    autocorrect: false,
                    enableSuggestions: true,
                    maxLines: 1,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      labelText: 'Supabase Site Url',
                    ),
                    validator: (value) => _validateRequired(value),
                    onFieldSubmitted: (value) => _save(),
                  ),
                  const SizedBox(
                    height: Constants.spacingMiddle,
                  ),
                  TextFormField(
                    controller: _googleClientIdController,
                    keyboardType: TextInputType.none,
                    autocorrect: false,
                    enableSuggestions: true,
                    maxLines: 1,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      labelText: 'Google Client Id',
                    ),
                    validator: (value) => _validateRequired(value),
                    onFieldSubmitted: (value) => _save(),
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
                    label: const Text('Save Settings'),
                    onPressed: _isLoading ? null : () => _save(),
                    icon: _isLoading
                        ? const ElevatedButtonProgressIndicator()
                        : const Icon(Icons.save),
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
                    label: const Text('Restore Default Settings'),
                    onPressed: _isLoading ? null : () => _reset(),
                    icon: _isLoading
                        ? const ElevatedButtonProgressIndicator()
                        : const Icon(Icons.settings_backup_restore),
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
