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
The Pinterest source can be used to follow your favorite Pinterest users or
boards.

- **User**: `@username` or `https://www.pinterest.com/username/`
- **Board**: `@username/board` or `https://www.pinterest.com/username/board/`
''';

/// The [AddSourcePinterest] widget is used to display the form to add a new
/// Pinterest source.
class AddSourcePinterst extends StatefulWidget {
  const AddSourcePinterst({
    super.key,
    required this.column,
  });

  final FDColumn column;

  @override
  State<AddSourcePinterst> createState() => _AddSourcePinterstState();
}

class _AddSourcePinterstState extends State<AddSourcePinterst> {
  final _formKey = GlobalKey<FormState>();
  final _pinterestController = TextEditingController();
  bool _isLoading = false;
  String _error = '';

  /// [_addSource] adds a new Pinterst source. To add a new Pinterest source the
  /// user must provide the URL of an user / a board or an url via the
  /// [_pinterestController].
  Future<void> _addSource() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      AppRepository app = Provider.of<AppRepository>(context, listen: false);
      await app.addSource(
        widget.column.id,
        FDSourceType.pinterest,
        FDSourceOptions(
          pinterest: _pinterestController.text,
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
    _pinterestController.dispose();
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
              controller: _pinterestController,
              keyboardType: TextInputType.text,
              autocorrect: false,
              enableSuggestions: true,
              maxLines: 1,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Pinterest Url, Username or Board',
              ),
              onFieldSubmitted: (value) => _addSource(),
            ),
          ],
        ),
      ),
    );
  }
}
