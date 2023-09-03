import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/repositories/items_repository.dart';
import 'package:feeddeck/utils/constants.dart';

/// The [ColumnLayoutSearch] widget is used to display a search box to filter
/// the items for a column by a search term. It also contains a submenu to
/// filter the items by a selected state.
class ColumnLayoutSearch extends StatefulWidget {
  const ColumnLayoutSearch({super.key});

  @override
  State<ColumnLayoutSearch> createState() => _ColumnLayoutSearchState();
}

class _ColumnLayoutSearchState extends State<ColumnLayoutSearch> {
  final _searchController = TextEditingController();
  double? _showFilters = 0.0;

  @override
  void initState() {
    super.initState();
    _searchController.text = Provider.of<ItemsRepository>(
      context,
      listen: false,
    ).searchTermFilter;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ItemsRepository items = Provider.of<ItemsRepository>(context, listen: true);

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.only(
            top: Constants.spacingExtraSmall,
            bottom: Constants.spacingExtraSmall,
          ),
          child: Row(
            children: [
              /// Show a [TextField] where a search term can be entered to
              /// filter the items of the current column. To refresh the list of
              /// items with the entered search term the user must clicks on
              /// the enter button.
              Expanded(
                child: TextField(
                  controller: _searchController,
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.search),
                    hintText: 'Search...',
                    border: InputBorder.none,
                  ),
                  onSubmitted: (value) =>
                      items.filterBySearchTerm(_searchController.text),
                ),
              ),

              /// Display a button to clear the entered search term. When the
              /// button is clicked it will call the `filterBySearchTerm` function
              /// to update the list of items.
              IconButton(
                icon: const Icon(Icons.clear, size: 20.0),
                onPressed: () {
                  _searchController.text = '';
                  items.filterBySearchTerm('');
                },
              ),

              /// Display a button to show / hide additional filters for the
              /// current column. The filters are shown when the [_showFilters]
              /// state is `null`. To hide the filters the [_showFilters] state is
              /// set to `0.0`.
              IconButton(
                icon: const Icon(Icons.filter_list, size: 20.0),
                onPressed: () {
                  setState(() {
                    _showFilters = _showFilters == 0.0 ? null : 0.0;
                  });
                },
              ),
            ],
          ),
        ),
        const Divider(
          color: Constants.dividerColor,
          height: 1,
          thickness: 1,
        ),
        AnimatedSize(
          duration: const Duration(milliseconds: 300),
          child: Container(
            width: double.infinity,
            height: _showFilters,
            decoration: const BoxDecoration(
              color: Constants.backgroundContainerBackgroundColor,
            ),
            padding: const EdgeInsets.all(Constants.spacingMiddle),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                /// Display a list of all possible item states as a list of
                /// radio tiles. When the user selects one of the filters, we
                /// directly apply this filter and refresh the loaded items with
                /// the new state value.
                RadioListTile(
                  title: const Text('None'),
                  dense: true,
                  visualDensity: const VisualDensity(
                    horizontal: VisualDensity.minimumDensity,
                    vertical: VisualDensity.minimumDensity,
                  ),
                  value: ItemStateFilter.none,
                  groupValue: items.stateFilter,
                  onChanged: (ItemStateFilter? value) =>
                      items.filterByState(value ?? ItemStateFilter.unread),
                ),
                RadioListTile(
                  title: const Text('Unread'),
                  dense: true,
                  visualDensity: const VisualDensity(
                    horizontal: VisualDensity.minimumDensity,
                    vertical: VisualDensity.minimumDensity,
                  ),
                  value: ItemStateFilter.unread,
                  groupValue: items.stateFilter,
                  onChanged: (ItemStateFilter? value) =>
                      items.filterByState(value ?? ItemStateFilter.unread),
                ),
                RadioListTile(
                  title: const Text('Read'),
                  dense: true,
                  visualDensity: const VisualDensity(
                    horizontal: VisualDensity.minimumDensity,
                    vertical: VisualDensity.minimumDensity,
                  ),
                  value: ItemStateFilter.read,
                  groupValue: items.stateFilter,
                  onChanged: (ItemStateFilter? value) =>
                      items.filterByState(value ?? ItemStateFilter.unread),
                ),
                RadioListTile(
                  title: const Text('Bookmarked'),
                  dense: true,
                  visualDensity: const VisualDensity(
                    horizontal: VisualDensity.minimumDensity,
                    vertical: VisualDensity.minimumDensity,
                  ),
                  value: ItemStateFilter.bookmarked,
                  groupValue: items.stateFilter,
                  onChanged: (ItemStateFilter? value) =>
                      items.filterByState(value ?? ItemStateFilter.unread),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
