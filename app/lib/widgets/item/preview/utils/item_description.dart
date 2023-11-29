import 'package:flutter/material.dart';

import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:html2md/html2md.dart' as html2md;

import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/font.dart';
import 'package:feeddeck/utils/openurl.dart';
import 'package:feeddeck/widgets/utils/cached_network_image.dart';

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

  /// [_openUrl] opens the provided [url] in a browser.
  Future<void> _openUrl(String url) async {
    try {
      await openUrl(url);
    } catch (_) {}
  }

  /// [_buildMarkdown] renders the provided [content] as markdown.
  Widget _buildMarkdown(String content) {
    return Container(
      padding: const EdgeInsets.only(
        bottom: Constants.spacingExtraSmall,
      ),
      child: MarkdownBody(
        selectable: false,
        data: content.trim(),
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
          return Container(
            padding: const EdgeInsets.only(
              bottom: Constants.spacingExtraSmall,
            ),
            child: CachedNetworkImage(
              width: double.infinity,
              height: 200,
              fit: BoxFit.cover,
              imageUrl: uri.toString(),
              placeholder: (context, url) => Container(),
              errorWidget: (context, url, error) => Container(),
            ),
          );
        },
      ),
    );
  }

  /// [_buildPlain] renders the provided [content] as plain text.
  ///
  /// To not have some trailing newlines, the [content] is trimmed and splitted
  /// on newline characters, so that we can filter out empty lines, before the
  /// the content is rendered.
  Widget _buildPlain(String content) {
    if (content == '') {
      return Container();
    }

    return Container(
      padding: const EdgeInsets.only(
        bottom: Constants.spacingExtraSmall,
      ),
      child: Text(
        content.trim().split('\n').where((line) => line != '').join('\n'),
        maxLines: 5,
        style: const TextStyle(
          overflow: TextOverflow.ellipsis,
          fontWeight: FontWeight.normal,
          fontSize: 14,
        ),
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
      return _buildMarkdown(html2md.convert(itemDescription!));
    }

    if (sourceFormat == DescriptionFormat.markdown &&
        tagetFormat == DescriptionFormat.markdown) {
      return _buildMarkdown(itemDescription!);
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
