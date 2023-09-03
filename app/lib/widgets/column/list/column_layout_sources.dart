import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/repositories/items_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/source/source_icon.dart';

class ColumnLayoutSources extends StatelessWidget {
  const ColumnLayoutSources({super.key});

  /// [_buildSource] builds the icon for a single source. If the provided
  /// [source] has the same id as the source set in the `sourceIdFilter` of the
  /// [ItemsRepository] we add a border to the icon to show that it is the
  /// selected source.
  ///
  /// When a user clicks on the icon of a source, the source id filter is set to
  /// the id of the source. If the source id filter was already set to this id
  /// the filter is removed.
  Widget _buildSource(BuildContext context, FDSource source) {
    ItemsRepository items =
        Provider.of<ItemsRepository>(context, listen: false);

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () => items.sourceIdFilter == source.id
            ? items.filterBySource('')
            : items.filterBySource(source.id),
        child: Container(
          color: items.sourceIdFilter == source.id
              ? Constants.secondary
              : Colors.transparent,
          padding: const EdgeInsets.only(
            top: Constants.spacingMiddle,
            bottom: Constants.spacingMiddle,
            left: Constants.spacingMiddle,
            right: Constants.spacingMiddle,
          ),
          child: Column(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.all(Radius.circular(24)),
                  border: Border.all(
                    color: Colors.transparent,
                    width: 4,
                  ),
                ),
                child: SourceIcon(
                  type: source.type,
                  icon: source.icon,
                  size: 48,
                ),
              ),
              Container(
                constraints: const BoxConstraints(minWidth: 48, maxWidth: 48),
                padding: const EdgeInsets.only(
                  top: Constants.spacingExtraSmall,
                ),
                child: Text(
                  Characters(source.title)
                      .replaceAll(
                        Characters(''),
                        Characters('\u{200B}'),
                      )
                      .toString(),
                  maxLines: 1,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    overflow: TextOverflow.ellipsis,
                    fontSize: 10,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    ItemsRepository items = Provider.of<ItemsRepository>(context, listen: true);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 98.0,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            shrinkWrap: true,
            itemCount: items.column.sources.length,
            itemBuilder: (BuildContext context, int index) {
              return _buildSource(context, items.column.sources[index]);
            },
          ),
        ),
        const Divider(
          color: Constants.dividerColor,
          height: 1,
          thickness: 1,
        ),
      ],
    );
  }
}
