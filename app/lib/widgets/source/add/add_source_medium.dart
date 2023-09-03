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
The Medium source can be used to follow your favorite Medium authors,
publications or tags, e.g.

- **Publication**: `https://medium.com/jaegertracing` or
  `https://medium.com/feed/jaegertracing`
- **Author**: `@YuriShkuro`, `https://medium.com/@YuriShkuro` or
  `https://medium.com/feed/@YuriShkuro`
- **Tag**: `#jaeger`, `https://medium.com/tag/jaeger` or
  `https://medium.com/feed/tag/jaeger`
''';

/// The [AddSourceMedium] widget is used to display the form to add a new Medium
/// page.
class AddSourceMedium extends StatefulWidget {
  const AddSourceMedium({
    super.key,
    required this.column,
  });

  final FDColumn column;

  @override
  State<AddSourceMedium> createState() => _AddSourceMediumState();
}

class _AddSourceMediumState extends State<AddSourceMedium> {
  final _formKey = GlobalKey<FormState>();
  final _mediumController = TextEditingController();
  bool _isLoading = false;
  String _error = '';

  /// [_addSource] adds a new Medium page. A user can provide the link to the
  /// Medium page or the username or an hashtag. It is also possible to directly
  /// provided the RSS url, we then convert the user input in the Go code to the
  /// correct RSS url.
  Future<void> _addSource() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      AppRepository app = Provider.of<AppRepository>(context, listen: false);
      await app.addSource(
        widget.column.id,
        FDSourceType.medium,
        FDSourceOptions(
          medium: _mediumController.text,
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
    _mediumController.dispose();
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
              controller: _mediumController,
              keyboardType: TextInputType.text,
              autocorrect: false,
              enableSuggestions: true,
              maxLines: 1,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Medium Url, Author or Tag',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
