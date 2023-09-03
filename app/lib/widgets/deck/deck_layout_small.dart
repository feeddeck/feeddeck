import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/column/column_layout.dart';
import 'package:feeddeck/widgets/column/create/create_column.dart';
import 'package:feeddeck/widgets/settings/settings.dart';
import 'package:feeddeck/widgets/source/source_icon.dart';

/// The [DeckLayoutSmall] implements the deck screen via tabs for screens
/// smaller then our defined breakpoint. It displayes all columns in a tab bar
/// and when the user clicks on an item in the tab bar it will update the tab
/// view to the corresponding column.
///
/// The tab bar also has two additional items, one to add a new column to the
/// current deck and one to go to the settings screen of the app.
class DeckLayoutSmall extends StatelessWidget {
  const DeckLayoutSmall({super.key});

  /// [_buildTabs] returns all items for the tab bar. The items are generated
  /// by looping thorugh the `columns` defined in the [AppRepository].
  ///
  /// Each item in the tab bar will have an `icon` and an `title`. The icon will
  /// be the icon for the first source in the column and the title will be the
  /// column name.
  List<Tab> _buildTabs(BuildContext context) {
    AppRepository app = Provider.of<AppRepository>(context, listen: false);

    final List<Tab> widgets = [];
    for (var column in app.columns) {
      widgets.add(
        Tab(
          key: ValueKey(column.id),
          height: 56,
          icon: SourceIcon(
            type: column.sources.isNotEmpty
                ? column.sources[0].type
                : FDSourceType.none,
            icon: column.sources.isNotEmpty ? column.sources[0].icon : null,
            size: 24,
          ),
          iconMargin: const EdgeInsets.only(bottom: 0),
          child: Container(
            constraints: const BoxConstraints(
              minWidth: 54,
              maxWidth: 54,
            ),
            child: Text(
              Characters(column.name)
                  .replaceAll(
                    Characters(''),
                    Characters('\u{200B}'),
                  )
                  .toString(),
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 10,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),
        ),
      );
    }

    return widgets;
  }

  /// [_buildViews] returns all the view for the tab view. The view for each
  /// column is implemented in the [ColumnLayout] widget.
  Widget _buildViews(BuildContext context) {
    AppRepository app = Provider.of<AppRepository>(context, listen: false);

    if (app.columns.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(Constants.spacingMiddle),
          child: RichText(
            textAlign: TextAlign.center,
            text: const TextSpan(
              style: TextStyle(
                color: Constants.onSurface,
                fontSize: 14.0,
              ),
              children: [
                TextSpan(
                  text: 'Add you first column by clicking on the plus icon (',
                ),
                WidgetSpan(
                  child: Icon(Icons.add, size: 14.0),
                ),
                TextSpan(
                  text: ') in the tab bar on the bottom.',
                ),
              ],
            ),
          ),
        ),
      );
    }

    final List<Widget> widgets = [];
    for (var column in app.columns) {
      widgets.add(
        ColumnLayout(
          key: ValueKey(column.id),
          column: column,
          openDrawer: null,
        ),
      );
    }

    return TabBarView(
      physics: const NeverScrollableScrollPhysics(),
      children: widgets,
    );
  }

  @override
  Widget build(BuildContext context) {
    AppRepository app = Provider.of<AppRepository>(context, listen: true);

    return DefaultTabController(
      length: app.columns.length,
      child: Scaffold(
        bottomNavigationBar: SafeArea(
          child: Container(
            decoration: const BoxDecoration(
              border: Border(
                top: BorderSide(
                  color: Constants.dividerColor,
                  width: 1,
                ),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Theme(
                    data: Theme.of(context).copyWith(
                      colorScheme: Theme.of(context).colorScheme.copyWith(
                            surfaceVariant: Colors.transparent,
                          ),
                    ),
                    child: TabBar(
                      isScrollable: true,
                      tabs: _buildTabs(context),
                    ),
                  ),
                ),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.only(
                        left: Constants.spacingSmall,
                        right: Constants.spacingSmall,
                      ),
                      decoration: const BoxDecoration(
                        border: Border(
                          left: BorderSide(color: Constants.dividerColor),
                        ),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(
                              Icons.add,
                              color: Constants.onSecondary,
                            ),
                            onPressed: () {
                              showModalBottomSheet(
                                context: context,
                                isScrollControlled: true,
                                isDismissible: false,
                                useSafeArea: true,
                                backgroundColor: Colors.transparent,
                                shape: const RoundedRectangleBorder(
                                  borderRadius: BorderRadius.vertical(
                                    top: Radius.circular(
                                      Constants.spacingMiddle,
                                    ),
                                  ),
                                ),
                                clipBehavior: Clip.antiAliasWithSaveLayer,
                                constraints: const BoxConstraints(
                                  maxWidth: Constants.centeredFormMaxWidth,
                                ),
                                builder: (BuildContext context) {
                                  return const CreateColumn();
                                },
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.only(
                        right: Constants.spacingSmall,
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(
                              Icons.settings,
                              color: Constants.onSecondary,
                            ),
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (BuildContext context) =>
                                      const Settings(),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        body: SafeArea(
          child: _buildViews(context),
        ),
      ),
    );
  }
}
