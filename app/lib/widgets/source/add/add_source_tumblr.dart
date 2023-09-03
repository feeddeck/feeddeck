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
The Tumblr source can be used to follow your Tumblr blogs, e.g.
`https://todayontumblr.tumblr.com/rss` or
`https://www.tumblr.com/todayontumblr`.
''';

/// The [AddSourceTumblr] widget is used to display the form to add a new Tumblr
/// source.
class AddSourceTumblr extends StatefulWidget {
  const AddSourceTumblr({
    super.key,
    required this.column,
  });

  final FDColumn column;

  @override
  State<AddSourceTumblr> createState() => _AddSourceTumblrState();
}

class _AddSourceTumblrState extends State<AddSourceTumblr> {
  final _formKey = GlobalKey<FormState>();
  final _tumblrController = TextEditingController();
  bool _isLoading = false;
  String _error = '';

  /// [_addSource] adds a new Tumblr source, The user can provide the RSS feed
  /// of a Tumblr blog or a link to Tumblr blog. When the link to the blog is
  /// provided it will be converted to the corresponding RSS feed in the backend
  /// code.
  Future<void> _addSource() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      AppRepository app = Provider.of<AppRepository>(context, listen: false);
      await app.addSource(
        widget.column.id,
        FDSourceType.tumblr,
        FDSourceOptions(
          tumblr: _tumblrController.text,
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
    _tumblrController.dispose();
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
              controller: _tumblrController,
              keyboardType: TextInputType.text,
              autocorrect: false,
              enableSuggestions: true,
              maxLines: 1,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Blog',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
