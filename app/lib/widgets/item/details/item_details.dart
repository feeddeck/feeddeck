import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/repositories/items_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/openurl.dart';
import 'package:feeddeck/widgets/item/details/item_details_fourchan.dart';
import 'package:feeddeck/widgets/item/details/item_details_lemmy.dart';
import 'package:feeddeck/widgets/item/details/item_details_mastodon.dart';
import 'package:feeddeck/widgets/item/details/item_details_medium.dart';
import 'package:feeddeck/widgets/item/details/item_details_nitter.dart';
import 'package:feeddeck/widgets/item/details/item_details_pinterest.dart';
import 'package:feeddeck/widgets/item/details/item_details_podcast.dart';
import 'package:feeddeck/widgets/item/details/item_details_reddit.dart';
import 'package:feeddeck/widgets/item/details/item_details_rss.dart';
import 'package:feeddeck/widgets/item/details/item_details_stackoverflow.dart';
import 'package:feeddeck/widgets/item/details/item_details_tumblr.dart';
import 'package:feeddeck/widgets/item/details/item_details_youtube.dart';

class ItemDetails extends StatelessWidget {
  const ItemDetails({
    super.key,
    required this.item,
    required this.source,
  });

  final FDItem item;
  final FDSource source;

  /// [_openUrl] opens the item url in the default browser of the current
  /// device.
  Future<void> _openUrl(String link) async {
    try {
      await openUrl(link);
    } catch (_) {}
  }

  /// [_bookmark] marks the item as bookmarked. If the item is already
  /// bookmarked the bookmark will be removed.
  Future<void> _bookmark(BuildContext context) async {
    try {
      await Provider.of<ItemsRepository>(
        context,
        listen: false,
      ).updateBookmarkedState(item.id, !item.isBookmarked);
    } catch (_) {}
  }

  /// [_read] marks the item as read / unread by calling the corresponding API
  /// endpoint.
  Future<void> _read(BuildContext context) async {
    try {
      await Provider.of<ItemsRepository>(
        context,
        listen: false,
      ).updateReadState(item.id, !item.isRead);
    } catch (_) {}
  }

  Widget _buildDetails() {
    switch (source.type) {
      case FDSourceType.fourchan:
        return ItemDetailsFourChan(
          item: item,
          source: source,
        );

      /// Sources with type [FDSourceType.github] do not provide a details view,
      /// because we directly open the link, when the user clicks on the
      /// corresponding preview item.
      case FDSourceType.github:
        return Container();

      /// Sources with type [FDSourceType.googlenews] do not provide a details
      /// view, because we directly open the link, when the user clicks on the
      /// corresponding preview item.
      case FDSourceType.googlenews:
        return Container();
      case FDSourceType.lemmy:
        return ItemDetailsLemmy(
          item: item,
          source: source,
        );
      case FDSourceType.mastodon:
        return ItemDetailsMastodon(
          item: item,
          source: source,
        );
      case FDSourceType.medium:
        return ItemDetailsMedium(
          item: item,
          source: source,
        );
      case FDSourceType.nitter:
        return ItemDetailsNitter(
          item: item,
          source: source,
        );
      case FDSourceType.pinterest:
        return ItemDetailsPinterest(
          item: item,
          source: source,
        );
      case FDSourceType.podcast:
        return ItemDetailsPodcast(
          item: item,
          source: source,
        );
      case FDSourceType.reddit:
        return ItemDetailsReddit(
          item: item,
          source: source,
        );
      case FDSourceType.rss:
        return ItemDetailsRSS(
          item: item,
          source: source,
        );
      case FDSourceType.stackoverflow:
        return ItemDetailsStackoverflow(
          item: item,
          source: source,
        );
      case FDSourceType.tumblr:
        return ItemDetailsTumblr(
          item: item,
          source: source,
        );
      // case FDSourceType.x:
      //   return ItemDetailsX(
      //     item: item,
      //     source: source,
      //   );
      case FDSourceType.youtube:
        return ItemDetailsYoutube(
          item: item,
          source: source,
        );
      default:
        return Container();
    }
  }

  @override
  Widget build(BuildContext context) {
    Provider.of<ItemsRepository>(context, listen: true);

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        leading: BackButton(
          onPressed: () {
            Navigator.of(context).pop();
          },
        ),
        shape: const Border(
          bottom: BorderSide(
            color: Constants.dividerColor,
            width: 1,
          ),
        ),
        actions: [
          IconButton(
            icon: item.isRead == true
                ? const Icon(
                    Icons.visibility_off,
                  )
                : const Icon(
                    Icons.visibility,
                  ),
            onPressed: () => _read(context),
          ),
          IconButton(
            icon: item.isBookmarked == true
                ? const Icon(
                    Icons.bookmark,
                  )
                : const Icon(
                    Icons.bookmark_outline,
                  ),
            onPressed: () => _bookmark(context),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(Constants.spacingMiddle),
                child: SingleChildScrollView(
                  child: _buildDetails(),
                ),
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
                label: const Text('Open Link'),
                onPressed: () => _openUrl(item.link),
                icon: const Icon(Icons.launch),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
