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
The Podcast source can be used to follow your favorite Podcasts. You have to
provide the RSS feed of the Podcast (e.g. `https://kubernetespodcast.com/feeds/audio.xml`)
or the url for an Apple Podcast (e.g. `https://podcasts.apple.com/de/podcast/kubernetes-podcast-from-google/id1370049232`)
''';

/// The [AddSourcePodcast] widget is used to display the form to add a new
/// Podcast.
class AddSourcePodcast extends StatefulWidget {
  const AddSourcePodcast({
    super.key,
    required this.column,
  });

  final FDColumn column;

  @override
  State<AddSourcePodcast> createState() => _AddSourcePodcastState();
}

class _AddSourcePodcastState extends State<AddSourcePodcast> {
  final _formKey = GlobalKey<FormState>();
  final _podcastController = TextEditingController();
  bool _isLoading = false;
  String _error = '';

  /// [_addSource] is used to add a new Podcast. To add a new Podcast the user
  /// must provide the RSS url of the podcast or a link to the Podcast on Apple
  /// Podcast.
  Future<void> _addSource() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      AppRepository app = Provider.of<AppRepository>(context, listen: false);
      await app.addSource(
        widget.column.id,
        FDSourceType.podcast,
        FDSourceOptions(
          podcast: _podcastController.text,
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
    _podcastController.dispose();
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
              controller: _podcastController,
              keyboardType: TextInputType.text,
              autocorrect: false,
              enableSuggestions: true,
              maxLines: 1,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Podcast Url',
              ),
              onFieldSubmitted: (value) => _addSource(),
            ),
          ],
        ),
      ),
    );
  }
}
