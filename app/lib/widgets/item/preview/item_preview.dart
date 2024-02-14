import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/repositories/items_repository.dart';
import 'package:feeddeck/widgets/item/preview/item_preview_fourchan.dart';
import 'package:feeddeck/widgets/item/preview/item_preview_github.dart';
import 'package:feeddeck/widgets/item/preview/item_preview_googlenews.dart';
import 'package:feeddeck/widgets/item/preview/item_preview_lemmy.dart';
import 'package:feeddeck/widgets/item/preview/item_preview_mastodon.dart';
import 'package:feeddeck/widgets/item/preview/item_preview_medium.dart';
import 'package:feeddeck/widgets/item/preview/item_preview_nitter.dart';
import 'package:feeddeck/widgets/item/preview/item_preview_pinterest.dart';
import 'package:feeddeck/widgets/item/preview/item_preview_podcast.dart';
import 'package:feeddeck/widgets/item/preview/item_preview_reddit.dart';
import 'package:feeddeck/widgets/item/preview/item_preview_rss.dart';
import 'package:feeddeck/widgets/item/preview/item_preview_stackoverflow.dart';
import 'package:feeddeck/widgets/item/preview/item_preview_tumblr.dart';
import 'package:feeddeck/widgets/item/preview/item_preview_youtube.dart';

/// The [ItemPreview] widget displays a preview for an item in a column based on
/// it's source type. When a user clicks on the item we show the details or
/// directly open the [item.link] in a browser.
class ItemPreview extends StatelessWidget {
  const ItemPreview({
    super.key,
    required this.item,
  });

  final FDItem item;

  @override
  Widget build(BuildContext context) {
    ItemsRepository items = Provider.of<ItemsRepository>(context, listen: true);
    final source = items.getSource(item.sourceId);

    /// If we are not able to get a source for the item something must be odd,
    /// so we don't display anything.
    if (source == null) {
      return Container();
    }

    /// Based on the [source.type] we display a different preview. The preview
    /// for each source type is implemented in a separate widget.
    switch (source.type) {
      case FDSourceType.fourchan:
        return ItemPreviewFourChan(
          item: item,
          source: source,
        );
      case FDSourceType.github:
        return ItemPreviewGithub(
          item: item,
          source: source,
        );
      case FDSourceType.googlenews:
        return ItemPreviewGooglenews(
          item: item,
          source: source,
        );
      case FDSourceType.lemmy:
        return ItemPreviewLemmy(
          item: item,
          source: source,
        );
      case FDSourceType.mastodon:
        return ItemPreviewMastodon(
          item: item,
          source: source,
        );
      case FDSourceType.medium:
        return ItemPreviewMedium(
          item: item,
          source: source,
        );
      case FDSourceType.nitter:
        return ItemPreviewNitter(
          item: item,
          source: source,
        );
      case FDSourceType.pinterest:
        return ItemPreviewPinterest(
          item: item,
          source: source,
        );
      case FDSourceType.podcast:
        return ItemPreviewPodcast(
          item: item,
          source: source,
        );
      case FDSourceType.reddit:
        return ItemPreviewReddit(
          item: item,
          source: source,
        );
      case FDSourceType.rss:
        return ItemPreviewRSS(
          item: item,
          source: source,
        );
      case FDSourceType.stackoverflow:
        return ItemPreviewStackoverflow(
          item: item,
          source: source,
        );
      case FDSourceType.tumblr:
        return ItemPreviewTumblr(
          item: item,
          source: source,
        );
      // case FDSourceType.x:
      //   return ItemPreviewX(
      //     item: item,
      //     source: source,
      //   );
      case FDSourceType.youtube:
        return ItemPreviewYoutube(
          item: item,
          source: source,
        );
      default:
        return Container();
    }
  }
}
