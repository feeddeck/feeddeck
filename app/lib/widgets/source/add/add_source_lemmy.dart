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
The Lemmy source can be used to follow your favorite Lemmy communities.

- **Community**: Provide the url of the community you want to follow
  (e.g. `https://lemmy.world/c/lemmyworld`).
- **User**: Provide the url of the user you want to follow
  (e.g. `https://lemmy.world/u/lwCET`).
- **Lemmy Instance**: Provide the url of an Lemmy instance to follow all posts
  of this instance (e.g. `https://lemmy.world`).
''';

/// The [AddSourceLemmy] widget is used to display the form to add a new Lemmy
/// source.
class AddSourceLemmy extends StatefulWidget {
  const AddSourceLemmy({
    super.key,
    required this.column,
  });

  final FDColumn column;

  @override
  State<AddSourceLemmy> createState() => _AddSourceLemmyState();
}

class _AddSourceLemmyState extends State<AddSourceLemmy> {
  final _formKey = GlobalKey<FormState>();
  final _lemmyController = TextEditingController();
  bool _isLoading = false;
  String _error = '';

  /// [_addSource] adds a new Lemmy source. The user can provide a Lemmy url,
  /// which could be be a community or user or the corresponding RSS feed.
  Future<void> _addSource() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      AppRepository app = Provider.of<AppRepository>(context, listen: false);
      await app.addSource(
        widget.column.id,
        FDSourceType.lemmy,
        FDSourceOptions(
          lemmy: _lemmyController.text,
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
    _lemmyController.dispose();
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
              controller: _lemmyController,
              keyboardType: TextInputType.text,
              autocorrect: false,
              enableSuggestions: true,
              maxLines: 1,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Lemmy Url',
              ),
              onFieldSubmitted: (value) => _addSource(),
            ),
          ],
        ),
      ),
    );
  }
}
