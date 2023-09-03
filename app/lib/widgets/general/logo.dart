import 'package:flutter/material.dart';

import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/fd_icons.dart';

/// The [Logo] widget can be used to diplay the FeedDeck logo within the app.
/// The size of the logo can be defined via the [size] parameter.
class Logo extends StatelessWidget {
  const Logo({
    super.key,
    required this.size,
  });

  final double size;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: CircleAvatar(
        radius: size / 2,
        backgroundColor: Constants.primary,
        child: Icon(
          FDIcons.feeddeck,
          size: size / 2,
          color: Constants.onPrimary,
        ),
      ),
    );
  }
}
