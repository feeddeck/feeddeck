import 'package:flutter/material.dart';

import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';

/// The [AddSourceForm] widget can be used in the forms for the different source
/// types to provide the same styling for all forms. The widget is responsible
/// for showing the button to submit the form ([child]) and to show the loading
/// indicator when [isLoading] is `true` and a [error] message when an error
/// occured while the form was submitted.
class AddSourceForm extends StatelessWidget {
  const AddSourceForm({
    super.key,
    required this.onTap,
    required this.isLoading,
    required this.error,
    required this.child,
  });

  final void Function()? onTap;
  final bool isLoading;
  final String error;
  final Widget child;

  /// [_buildError] returns a widget to display the [error] when it is not an
  /// empty string.
  Widget _buildError() {
    if (error != '') {
      return Padding(
        padding: const EdgeInsets.all(Constants.spacingMiddle),
        child: Text(
          error,
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(Constants.spacingMiddle),
            children: [
              child,
            ],
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
              maximumSize: const Size.fromHeight(
                Constants.elevatedButtonSize,
              ),
              minimumSize: const Size.fromHeight(
                Constants.elevatedButtonSize,
              ),
            ),
            label: const Text('Add Source'),
            onPressed: isLoading ? null : onTap,
            icon: isLoading
                ? const ElevatedButtonProgressIndicator()
                : const Icon(Icons.add),
          ),
        ),
      ],
    );
  }
}
