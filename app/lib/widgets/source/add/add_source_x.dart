import 'package:flutter/material.dart';

import 'package:flutter_markdown/flutter_markdown.dart';

import 'package:feeddeck/models/column.dart';
import 'package:feeddeck/utils/api_exception.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/openurl.dart';
import 'package:feeddeck/widgets/source/add/add_source_form.dart';

const _helpText = '''
The X (formerly Twitter) source can be used to follow a user on X, e.g. `@rico_berger`.
''';

/// The [AddSourceX] widget is used to display the form to add a new X
/// (formerly) source.
class AddSourceX extends StatefulWidget {
  const AddSourceX({
    super.key,
    required this.column,
  });

  final FDColumn column;

  @override
  State<AddSourceX> createState() => _AddSourceXState();
}

class _AddSourceXState extends State<AddSourceX> {
  final _formKey = GlobalKey<FormState>();
  final _xController = TextEditingController();
  bool _isLoading = false;
  String _error = '';

  /// [_addSource] adds a new X source where the user can provide the username
  /// of a x user.
  Future<void> _addSource() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      // AppRepository app = Provider.of<AppRepository>(context, listen: false);
      // await app.addSource(
      //   widget.column.id,
      //   FDSourceType.x,
      //   FDSourceOptions(
      //     x: _xController.text,
      //   ),
      // );
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
    _xController.dispose();
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
              controller: _xController,
              keyboardType: TextInputType.text,
              autocorrect: false,
              enableSuggestions: true,
              maxLines: 1,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Username',
              ),
              onFieldSubmitted: (value) => _addSource(),
            ),
          ],
        ),
      ),
    );
  }
}
