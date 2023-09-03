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
The RSS source can be used to follow all your RSS feeds. You have to provide
the url for the RSS feed, e.g. `https://www.tagesschau.de/xml/rss2/`.
''';

/// The [AddSourceRSS] widget is used to display the form to add a new RSS
/// source.
class AddSourceRSS extends StatefulWidget {
  const AddSourceRSS({
    super.key,
    required this.column,
  });

  final FDColumn column;

  @override
  State<AddSourceRSS> createState() => _AddSourceRSSState();
}

class _AddSourceRSSState extends State<AddSourceRSS> {
  final _formKey = GlobalKey<FormState>();
  final _rssController = TextEditingController();
  bool _isLoading = false;
  String _error = '';

  /// [_addSource] adds a new RSS source. To add a new RSS source the user must
  /// provide the URL of the RSS feed via the [_rssController].
  ///
  /// If a user provides the RSS feed for a YouTube channeld, Medium page or a
  /// Reddit we have some special parsing in the backend to convert the the
  /// provided url to the correct source type.
  Future<void> _addSource() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      AppRepository app = Provider.of<AppRepository>(context, listen: false);
      await app.addSource(
        widget.column.id,
        FDSourceType.rss,
        FDSourceOptions(
          rss: _rssController.text,
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
    _rssController.dispose();
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
              controller: _rssController,
              keyboardType: TextInputType.text,
              autocorrect: false,
              enableSuggestions: true,
              maxLines: 1,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'RSS Feed',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
