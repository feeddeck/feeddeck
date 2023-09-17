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
The Reddit source can be used to follow your favorite subreddits or users:

- **Subreddit**: Provide the name of the subreddit (e.g. `/r/kubernetes`)
- **User**: Provide the name of the user (e.g. `/u/reddit`)
- **Url**: Provide the url for a user or subbreddit (e.g.
  `https://www.reddit.com/r/kubernetes/` or `https://www.reddit.com/r/kubernetes.rss`)
''';

/// The [AddSourceReddit] widget is used to display the form to add a new Reddit
/// source.
class AddSourceReddit extends StatefulWidget {
  const AddSourceReddit({
    super.key,
    required this.column,
  });

  final FDColumn column;

  @override
  State<AddSourceReddit> createState() => _AddSourceRedditState();
}

class _AddSourceRedditState extends State<AddSourceReddit> {
  final _formKey = GlobalKey<FormState>();
  final _redditController = TextEditingController();
  bool _isLoading = false;
  String _error = '';

  /// [_addSource] adds a new Reddit source. The user can provide a subreddit or
  /// a user. It is also possible to provide the complete RSS feed url.
  /// Depending on the user input we convert the input to the correct RSS feed
  /// url in the Go code.
  Future<void> _addSource() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      AppRepository app = Provider.of<AppRepository>(context, listen: false);
      await app.addSource(
        widget.column.id,
        FDSourceType.reddit,
        FDSourceOptions(
          reddit: _redditController.text,
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
    _redditController.dispose();
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
              controller: _redditController,
              keyboardType: TextInputType.text,
              autocorrect: false,
              enableSuggestions: true,
              maxLines: 1,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Reddit Url, Subreddit or User',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
