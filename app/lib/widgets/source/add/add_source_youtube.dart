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
The YouTube source can be used to follow your YouTube channels, e.g.
`https://www.youtube.com/user/tagesschau`.
''';

/// The [AddSourceYouTube] widget is used to display the form to add a new
/// YouTube source.
class AddSourceYouTube extends StatefulWidget {
  const AddSourceYouTube({
    super.key,
    required this.column,
  });

  final FDColumn column;

  @override
  State<AddSourceYouTube> createState() => _AddSourceYouTubeState();
}

class _AddSourceYouTubeState extends State<AddSourceYouTube> {
  final _formKey = GlobalKey<FormState>();
  final _youtubeController = TextEditingController();
  bool _isLoading = false;
  String _error = '';

  /// [_addSource] adds a new YouTube source, The user can provide the RSS feed
  /// of an channeld or a link to the YouTube channel, we will then try to parse
  /// the provided input to get the correct RSS feed url.
  Future<void> _addSource() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      AppRepository app = Provider.of<AppRepository>(context, listen: false);
      await app.addSource(
        widget.column.id,
        FDSourceType.youtube,
        FDSourceOptions(
          youtube: _youtubeController.text,
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
    _youtubeController.dispose();
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
              controller: _youtubeController,
              keyboardType: TextInputType.text,
              autocorrect: false,
              enableSuggestions: true,
              maxLines: 1,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Channel Url',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
