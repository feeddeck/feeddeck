import 'package:flutter/foundation.dart';

/// The [LayoutRepository] is used to store several layout information of the
/// app, which can be modifed or should be modifed within different locations.
class LayoutRepository with ChangeNotifier {
  /// [_deckLayoutSmallInitialTabIndex] stores the selected tab index of the
  /// [DeckLayoutSmall] widget. This is used that we display the same tab when
  /// a user switches between the small and large layout (e.g. portrait and
  /// landscape mode on mobile devices) and that we can reset the tab index when
  /// a user selects a new deck.
  int deckLayoutSmallInitialTabIndex = 0;
}
