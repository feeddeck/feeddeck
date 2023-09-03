import 'package:flutter/material.dart';

import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:provider/provider.dart';

import 'package:feeddeck/models/column.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/utils/api_exception.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/openurl.dart';
import 'package:feeddeck/widgets/source/add/add_source_form.dart';

const _helpText = '''
The Mastodon source can be used to add an RSS feed for Mastodon:

- **Username**: `@ricoberger@hachyderm.io`
- **Hashtag**: `#kubernetes`
- **Url**: `https://hachyderm.io/@ricoberger` or
  `https://hachyderm.io/tags/kubernetes`
''';

/// The [AddSourceMastodon] widget is used to display the form to add a new
/// Mastodon RSS feed.
class AddSourceMastodon extends StatefulWidget {
  const AddSourceMastodon({
    super.key,
    required this.column,
  });

  final FDColumn column;

  @override
  State<AddSourceMastodon> createState() => _AddSourceMastodonState();
}

class _AddSourceMastodonState extends State<AddSourceMastodon> {
  final _formKey = GlobalKey<FormState>();
  final _mastodonController = TextEditingController();
  bool _isLoading = false;
  String _error = '';

  /// [_addSource] adds a new Mastodon RSS feed. A user can provide the link to
  /// the RSS feed, a hastag or a username.
  Future<void> _addSource() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      AppRepository app = Provider.of<AppRepository>(context, listen: false);
      await app.addSource(
        widget.column.id,
        FDSourceType.mastodon,
        FDSourceOptions(
          mastodon: _mastodonController.text,
        ),
      );
      setState(() {
        _isLoading = false;
        _error = '';
      });
      if (mounted) {
        Navigator.of(context).pop();
      }
    } on ApiException catch (err) {
      setState(() {
        _isLoading = false;
        _error = 'Failed to add source: ${err.message}';
      });
    } catch (err) {
      setState(() {
        _isLoading = false;
        _error = 'Failed to add source: ${err.toString()}';
      });
    }
  }

  @override
  void dispose() {
    _mastodonController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AddSourceForm(
      onTap: _addSource,
      isLoading: _isLoading,
      error: _error,
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            MarkdownBody(
              selectable: true,
              data: _helpText,
              onTapLink: (text, href, title) {
                try {
                  if (href != null) {
                    openUrl(href);
                  }
                } catch (_) {}
              },
            ),
            const SizedBox(
              height: Constants.spacingMiddle,
            ),
            TextFormField(
              controller: _mastodonController,
              keyboardType: TextInputType.text,
              autocorrect: false,
              enableSuggestions: true,
              maxLines: 1,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Username, Hashtag, or Url',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
