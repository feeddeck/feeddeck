import 'package:flutter/material.dart';

import 'package:cached_network_image/cached_network_image.dart';

import 'package:feeddeck/models/item.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/image_url.dart';
import 'package:feeddeck/widgets/item/details/utils/item_audio_palyer/item_audio_player.dart';
import 'package:feeddeck/widgets/item/details/utils/item_description.dart';
import 'package:feeddeck/widgets/item/details/utils/item_subtitle.dart';
import 'package:feeddeck/widgets/item/details/utils/item_title.dart';

class ItemDetailsPodcast extends StatelessWidget {
  const ItemDetailsPodcast({
    super.key,
    required this.item,
    required this.source,
  });

  final FDItem item;
  final FDSource source;

  String? _buildImageUrl() {
    if (source.icon != null && source.icon != '') {
      return getImageUrl(FDImageType.source, source.icon!);
    }

    return null;
  }

  /// [_buildImage] returns an image which is displayed above the
  /// [ItemAudioPlayer]. For this image we are using the [source.icon] if it is
  /// available. If the [source.icon] is not available, we are not displaying
  /// any image.
  Widget _buildImage(String? imageUrl) {
    if (imageUrl != null && imageUrl != '') {
      return Container(
        padding: const EdgeInsets.only(
          bottom: Constants.spacingMiddle,
        ),
        child: CachedNetworkImage(
          width: double.infinity,
          fit: BoxFit.contain,
          imageUrl: imageUrl,
          height: 300.0,
          placeholder: (context, url) => Container(),
          errorWidget: (context, url, error) => Container(),
        ),
      );
    }

    return Container();
  }

  @override
  Widget build(BuildContext context) {
    final imageUrl = _buildImageUrl();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        ItemTitle(
          itemTitle: item.title,
        ),
        ItemSubtitle(
          item: item,
          source: source,
        ),

        /// Instead of the [ItemMedia] widget, we use the [ItemAudioPlayer]
        /// widget for a item with a source type `podcast`, so that a user can
        /// directly listen to the podcast episode.
        Column(
          children: [
            _buildImage(imageUrl),
            const SizedBox(
              height: Constants.spacingMiddle,
            ),
            ItemAudioPlayer(
              audioId: item.id,
              audioFile: item.media!,
              audioTitle: item.title,
              audioArtist: source.title,
              audioArt: imageUrl,
            ),
            const SizedBox(
              height: Constants.spacingMiddle,
            ),
          ],
        ),
        ItemDescription(
          itemDescription: item.description,
          sourceFormat: DescriptionFormat.html,
          tagetFormat: DescriptionFormat.markdown,
        ),
      ],
    );
  }
}
