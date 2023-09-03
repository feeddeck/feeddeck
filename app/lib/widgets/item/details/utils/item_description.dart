import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:html2md/html2md.dart' as html2md;
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/font.dart';
import 'package:feeddeck/utils/openurl.dart';

/// The [DescriptionFormat] enum defines the source and target format of a
/// description.
enum DescriptionFormat {
  html,
  markdown,
  plain,
}

/// The [ItemDescription] widget displays the description of an item. The
/// provided [itemDescription] is converted from the [sourceFormat] to the
/// [tagetFormat] before displayed.
class ItemDescription extends StatelessWidget {
  const ItemDescription({
    super.key,
    required this.itemDescription,
    required this.sourceFormat,
    required this.tagetFormat,
  });

  final String? itemDescription;
  final DescriptionFormat sourceFormat;
  final DescriptionFormat tagetFormat;

  /// [_openUrl] opens the item url in the default browser of the current
  /// device.
  Future<void> _openUrl(String link) async {
    try {
      await openUrl(link);
    } catch (_) {}
  }

  /// [_buildMarkdown] renders the provided [content] as markdown.
  Widget _buildMarkdown(BuildContext context, String content) {
    return MarkdownBody(
      selectable: true,
      data: content,
      styleSheet: MarkdownStyleSheet(
        code: TextStyle(
          fontFamily: getMonospaceFontFamily(),
          backgroundColor: Constants.secondary,
        ),
        codeblockDecoration: const BoxDecoration(
          color: Constants.secondary,
        ),
      ),
      onTapLink: (text, href, title) {
        if (href != null) {
          _openUrl(href);
        }
      },
      imageBuilder: (uri, title, alt) {
        String imageUrl = uri.toString();
        if (kIsWeb) {
          imageUrl =
              '${Supabase.instance.client.functionsUrl}/image-proxy-v1?media=${Uri.encodeQueryComponent(imageUrl)}';
        }

        return Container(
          padding: const EdgeInsets.only(
            bottom: Constants.spacingMiddle,
          ),
          child: MouseRegion(
            cursor: SystemMouseCursors.click,
            child: GestureDetector(
              onTap: () {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  isDismissible: true,
                  useSafeArea: true,
                  backgroundColor: Colors.black,
                  builder: (BuildContext context) {
                    return Scaffold(
                      backgroundColor: Colors.black,
                      body: Stack(
                        children: [
                          Center(
                            child: CachedNetworkImage(
                              fit: BoxFit.contain,
                              imageUrl: imageUrl,
                              placeholder: (context, url) => Container(),
                              errorWidget: (context, url, error) => Container(),
                            ),
                          ),
                          Positioned(
                            top: Constants.spacingExtraSmall,
                            right: Constants.spacingExtraSmall,
                            child: IconButton(
                              icon: const Icon(
                                Icons.close,
                              ),
                              onPressed: () {
                                Navigator.of(context).pop();
                              },
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
              child: CachedNetworkImage(
                width: double.infinity,
                fit: BoxFit.contain,
                imageUrl: imageUrl,
                placeholder: (context, url) => Container(),
                errorWidget: (context, url, error) => Container(),
              ),
            ),
          ),
        );
      },
    );
  }

  /// [_buildPlain] renders the provided [content] as plain text.
  Widget _buildPlain(String content) {
    return SelectableText(
      content,
      textAlign: TextAlign.left,
      style: const TextStyle(
        fontWeight: FontWeight.normal,
        fontSize: 14,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (itemDescription == null || itemDescription == '') {
      return Container();
    }

    if (sourceFormat == DescriptionFormat.html &&
        tagetFormat == DescriptionFormat.markdown) {
      return _buildMarkdown(context, html2md.convert(itemDescription!));
    }

    if (sourceFormat == DescriptionFormat.markdown &&
        tagetFormat == DescriptionFormat.markdown) {
      return _buildMarkdown(context, itemDescription!);
    }

    if (sourceFormat == DescriptionFormat.html &&
        tagetFormat == DescriptionFormat.plain) {
      return _buildPlain(
        itemDescription!.replaceAll(RegExp(r'<[^>]*>|&[^;]+;'), ''),
      );
    }

    return _buildPlain(itemDescription!);
  }
}
