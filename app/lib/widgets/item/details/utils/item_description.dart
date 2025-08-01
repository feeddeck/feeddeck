import 'package:flutter/material.dart';

import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:html2md/html2md.dart' as html2md;

import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/font.dart';
import 'package:feeddeck/utils/openurl.dart';
import 'package:feeddeck/widgets/utils/cached_network_image.dart';

/// The [DescriptionFormat] enum defines the source and target format of a
/// description.
enum DescriptionFormat { html, markdown, plain }

/// The [ItemDescription] widget displays the description of an item. The
/// provided [itemDescription] is converted from the [sourceFormat] to the
/// [tagetFormat] before displayed.
class ItemDescription extends StatelessWidget {
  const ItemDescription({
    super.key,
    required this.itemDescription,
    required this.sourceFormat,
    required this.tagetFormat,
    this.disableImages,
  });

  final String? itemDescription;
  final DescriptionFormat sourceFormat;
  final DescriptionFormat tagetFormat;
  final bool? disableImages;

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
      data: content.trim(),
      styleSheet: MarkdownStyleSheet(
        code: TextStyle(
          fontFamily: getMonospaceFontFamily(),
          backgroundColor: Constants.secondary,
        ),
        codeblockDecoration: const BoxDecoration(color: Constants.secondary),
        blockquoteDecoration: const BoxDecoration(
          color: Constants.secondary,
          border: Border(left: BorderSide(color: Constants.primary, width: 1)),
        ),
      ),
      onTapLink: (text, href, title) {
        if (href != null) {
          _openUrl(href);
        }
      },
      // TODO: The "flutter_markdown" package is deprecated and we have to
      // replace it with an alternative.
      // See:  https://pub.dev/packages/flutter_markdown
      // ignore: deprecated_member_use
      imageBuilder: (uri, title, alt) {
        if (disableImages == true) {
          return Container();
        }

        return Container(
          padding: const EdgeInsets.only(bottom: Constants.spacingMiddle),
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
                  constraints: const BoxConstraints(maxWidth: double.infinity),
                  builder: (BuildContext context) {
                    return Scaffold(
                      backgroundColor: Colors.black,
                      body: Stack(
                        children: [
                          Center(
                            child: CachedNetworkImage(
                              fit: BoxFit.contain,
                              imageUrl: uri.toString(),
                              placeholder: (context, url) => Container(),
                              errorWidget: (context, url, error) => Container(),
                            ),
                          ),
                          Positioned(
                            top: Constants.spacingExtraSmall,
                            right: Constants.spacingExtraSmall,
                            child: IconButton(
                              icon: const Icon(Icons.close),
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
                imageUrl: uri.toString(),
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
      content.trim(),
      textAlign: TextAlign.left,
      style: const TextStyle(fontWeight: FontWeight.normal, fontSize: 14),
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
        itemDescription!
            .replaceAll(RegExp(r'<[^>]*>|&[^;]+;'), ' ')
            .replaceAll(RegExp('\\s+'), ' '),
      );
    }

    return _buildPlain(itemDescription!);
  }
}
