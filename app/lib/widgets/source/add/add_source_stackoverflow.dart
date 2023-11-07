import 'package:flutter/material.dart';

import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:provider/provider.dart';

import 'package:feeddeck/models/column.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/models/sources/stackoverflow.dart';
import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/utils/api_exception.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/openurl.dart';
import 'package:feeddeck/widgets/source/add/add_source_form.dart';

const _helpText = '''
The StackOverflow source can be used to follow your RSS feeds or tags from
StackOverflow:

- **RSS Feed**: Provide the url for a Stackoverflow RSS feed, e.g.
  `https://stackoverflow.com/feeds/question/11227809`.
- **Tag**: Provide a tag to follow and the order of the questions,
  e.g. `kubernetes`.
''';

class AddSourceStackOverflow extends StatefulWidget {
  const AddSourceStackOverflow({
    super.key,
    required this.column,
  });

  final FDColumn column;

  @override
  State<AddSourceStackOverflow> createState() => _AddSourceStackOverflowState();
}

class _AddSourceStackOverflowState extends State<AddSourceStackOverflow> {
  final _formKey = GlobalKey<FormState>();
  FDStackOverflowType _stackoverflowType = FDStackOverflowType.url;
  final _stackoverflowUrl = TextEditingController();
  final _stackoverflowTag = TextEditingController();
  FDStackOverflowSort _stackoverflowSort = FDStackOverflowSort.newest;
  bool _isLoading = false;
  String _error = '';

  /// [_addSource] is used to add a new Google News source. Depending on the
  /// selected [_stackoverflowType] we need different information to add the
  /// source. Which data is required for which type is defined in the
  /// [_buildForm] function.
  Future<void> _addSource() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      AppRepository app = Provider.of<AppRepository>(context, listen: false);
      await app.addSource(
        widget.column.id,
        FDSourceType.stackoverflow,
        FDSourceOptions(
          stackoverflow: FDStackOverflowOptions(
            type: _stackoverflowType,
            url: _stackoverflowUrl.text,
            tag: _stackoverflowTag.text,
            sort: _stackoverflowSort,
          ),
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

  /// [_buildForm] displays the correct fields for the selected
  /// [_stackoverflowType]. Depending on the type we need different information
  /// from the user (e.g. a Google News URl or a search term).
  List<Widget> _buildForm() {
    if (_stackoverflowType == FDStackOverflowType.url) {
      return [
        TextFormField(
          controller: _stackoverflowUrl,
          keyboardType: TextInputType.text,
          autocorrect: false,
          enableSuggestions: true,
          maxLines: 1,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
            labelText: 'Url',
          ),
          onFieldSubmitted: (value) => _addSource(),
        ),
        const SizedBox(height: Constants.spacingMiddle),
      ];
    }

    if (_stackoverflowType == FDStackOverflowType.tag) {
      return [
        TextFormField(
          controller: _stackoverflowTag,
          keyboardType: TextInputType.text,
          autocorrect: false,
          enableSuggestions: true,
          maxLines: 1,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
            labelText: 'Tag',
          ),
          onFieldSubmitted: (value) => _addSource(),
        ),
        const SizedBox(height: Constants.spacingMiddle),
        DropdownButton<FDStackOverflowSort>(
          value: _stackoverflowSort,
          isExpanded: true,
          underline: Container(height: 1, color: Constants.primary),
          onChanged: (FDStackOverflowSort? value) {
            setState(() {
              _stackoverflowSort = value!;
            });
          },
          items: FDStackOverflowSort.values
              .map<DropdownMenuItem<FDStackOverflowSort>>(
                  (FDStackOverflowSort value) {
            return DropdownMenuItem<FDStackOverflowSort>(
              value: value,
              child: Text(value.toLocalizedString()),
            );
          }).toList(),
        ),
        const SizedBox(height: Constants.spacingMiddle),
      ];
    }

    return [];
  }

  @override
  void dispose() {
    _stackoverflowUrl.dispose();
    _stackoverflowTag.dispose();
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
            DropdownButton<FDStackOverflowType>(
              value: _stackoverflowType,
              isExpanded: true,
              underline: Container(height: 1, color: Constants.primary),
              onChanged: (FDStackOverflowType? value) {
                setState(() {
                  _stackoverflowType = value!;
                });
              },
              items: FDStackOverflowType.values
                  .map<DropdownMenuItem<FDStackOverflowType>>(
                      (FDStackOverflowType value) {
                return DropdownMenuItem<FDStackOverflowType>(
                  value: value,
                  child: Text(value.toLocalizedString()),
                );
              }).toList(),
            ),
            const SizedBox(
              height: Constants.spacingMiddle,
            ),
            ..._buildForm(),
          ],
        ),
      ),
    );
  }
}
