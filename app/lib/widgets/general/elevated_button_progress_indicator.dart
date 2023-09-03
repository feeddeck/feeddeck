import 'package:flutter/material.dart';

/// [ElevatedButtonProgressIndicator] can be used within an [ElevatedButton] to
/// show a progress indicator, while the action of the button is executed.
///
///     ElevatedButton.icon(
///       style: ElevatedButton.styleFrom(
///         maximumSize: const Size.fromHeight(
///           Constants.elevatedButtonSize,
///         ),
///         minimumSize: const Size.fromHeight(
///           Constants.elevatedButtonSize,
///         ),
///       ),
///       label: Text(
///         AppLocalizations.of(context)
///             .dashboardCreateDeckButton,
///       ),
///       onPressed: isLoading ? null : () => runAction(),
///       icon: isLoading
///           ? const ElevatedButtonProgressIndicator()
///           : const Icon(
///               Icons.view_column_outlined,
///             ),
///     )
class ElevatedButtonProgressIndicator extends StatelessWidget {
  const ElevatedButtonProgressIndicator({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 24,
      height: 24,
      padding: const EdgeInsets.all(2.0),
      child: const CircularProgressIndicator(
        color: Colors.white,
        strokeWidth: 2,
      ),
    );
  }
}
