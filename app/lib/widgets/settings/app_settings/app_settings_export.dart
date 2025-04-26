import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'package:file_picker/file_picker.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:xml/xml.dart';

import 'package:feeddeck/models/column.dart';
import 'package:feeddeck/models/deck.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';

class SettingsAppSettingsExport extends StatelessWidget {
  const SettingsAppSettingsExport({super.key});

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            isDismissible: true,
            useSafeArea: true,
            backgroundColor: Colors.transparent,
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.vertical(
                top: Radius.circular(Constants.spacingMiddle),
              ),
            ),
            clipBehavior: Clip.antiAliasWithSaveLayer,
            constraints: const BoxConstraints(
              maxWidth: Constants.centeredFormMaxWidth,
            ),
            builder: (BuildContext context) {
              return Export();
            },
          );
        },
        child: Card(
          color: Constants.secondary,
          margin: const EdgeInsets.only(bottom: Constants.spacingSmall),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.all(Constants.spacingMiddle),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            Characters('Export')
                                .replaceAll(
                                  Characters(''),
                                  Characters('\u{200B}'),
                                )
                                .toString(),
                            maxLines: 1,
                            style: const TextStyle(
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Icon(Icons.download),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class Export extends StatefulWidget {
  const Export({super.key});

  @override
  State<Export> createState() => _ExportState();
}

class _ExportState extends State<Export> {
  FDDeck? _selectedDeck;
  bool _isLoading = false;
  String _success = '';
  String _error = '';

  /// [_export] is the function to export a deck as OPML file. In the first step
  /// we have to get the columns for the selected deck and all sources for all
  /// the columns of the deck. Afterwards we create the OPML file and save it.
  Future<void> _export() async {
    setState(() {
      _isLoading = true;
      _success = '';
      _error = '';
    });

    /// If the [_selectedDeckId] is an empty string the user didn't selected a
    /// deck which should be exported, so that we return an error.
    if (_selectedDeck == null) {
      setState(() {
        _error = 'Please select a deck to export.';
        _isLoading = false;
      });
      return;
    }

    try {
      /// Get all the columns for the [_selectedDeckId].
      final data = await Supabase.instance.client
          .from('columns')
          .select('id, name, position')
          .eq('deckId', _selectedDeck!.id)
          .order('position', ascending: true);
      final columns = List<FDColumn>.from(
        data.map((column) => FDColumn.fromJson(column)),
      );

      /// Loop through all the columns and get the sources for each column. The
      /// sources are then added to the `sources` field of the column.
      for (var i = 0; i < columns.length; i++) {
        final data = await Supabase.instance.client
            .from('sources')
            .select('id, type, title, options, link, icon')
            .eq('columnId', columns[i].id)
            .order('position', ascending: true, nullsFirst: false)
            .order('createdAt', ascending: true);
        columns[i].sources = List<FDSource>.from(
          data.map((source) => FDSource.fromJson(source)),
        );
      }

      /// Build the OPML file. Here we only add the `opml` tag with the `head`
      /// and `body` tags. The `head` tag contains the deck name within the
      /// `title` tag. To fill the body we go through all columns to create a
      /// `outline` tag for each column and a nested `outline` tag for each
      /// souce. This is handled by the [toXml] methhod of the corresponding
      /// models.
      var builder = XmlBuilder();
      builder.processing('xml', 'version="1.0" encoding="utf-8"');
      builder.element(
        'opml',
        nest: () {
          builder.attribute('version', '2.0');
          builder.element(
            'head',
            nest: () {
              builder.element(
                'title',
                nest: () {
                  builder.text(_selectedDeck!.name);
                },
              );
            },
          );
          builder.element(
            'body',
            nest: () {
              for (var i = 0; i < columns.length; i++) {
                columns[i].toXml(builder);
              }
            },
          );
        },
      );
      final opml = builder.buildDocument().toXmlString(pretty: true);

      /// On native platforms the file name should not contain the extension,
      /// otherwise the extension is added twice. On the web the file name must
      /// contain the extension.
      String fileName = 'feeddeck-export-${_selectedDeck!.id}';
      if (kIsWeb) {
        fileName = 'feeddeck-export-${_selectedDeck!.id}.opml';
      }

      /// Open a file picker to let the user save the OPML file. When the file
      /// is saved successfully the file picker will return the file path on
      /// native platforms. If the file path is `null` the user aborted the
      /// export. On the web the file path will always be empty, so that we can
      /// directly display a [_success] message.
      final filePath = await FilePicker.platform.saveFile(
        allowedExtensions: ['opml'],
        type: FileType.custom,
        dialogTitle: 'Export',
        fileName: fileName,
        lockParentWindow: true,
        bytes: utf8.encode(opml),
      );

      if (kIsWeb) {
        setState(() {
          _success = 'Export successful';
          _isLoading = false;
        });
        return;
      }

      if (filePath == null) {
        setState(() {
          _isLoading = false;
        });
        return;
      }

      setState(() {
        _success = 'Export successful: $filePath';
        _isLoading = false;
      });
    } catch (err) {
      setState(() {
        _error = 'Export failed: ${err.toString()}';
        _isLoading = false;
      });
    }
  }

  /// [_buildSuccess] returns a widget to display the [_success] when it is not
  /// an empty string.
  Widget _buildSuccess() {
    if (_success != '') {
      return Padding(
        padding: const EdgeInsets.all(Constants.spacingMiddle),
        child: Text(_success, style: const TextStyle(color: Constants.primary)),
      );
    }

    return Container();
  }

  /// [_buildError] returns a widget to display the [_error] when it is not an
  /// empty string.
  Widget _buildError() {
    if (_error != '') {
      return Padding(
        padding: const EdgeInsets.all(Constants.spacingMiddle),
        child: Text(_error, style: const TextStyle(color: Constants.error)),
      );
    }

    return Container();
  }

  @override
  Widget build(BuildContext context) {
    AppRepository app = Provider.of<AppRepository>(context, listen: true);

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        shape: const Border(
          bottom: BorderSide(color: Constants.dividerColor, width: 1),
        ),
        title: Text('Export'),
        actions: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () {
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(Constants.spacingMiddle),
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      Text(
                        'Select a deck, which should be exported from the following list. Click the "Export" button afterwards to save the deck as OPML file.',
                      ),
                      const SizedBox(height: Constants.spacingMiddle),
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: app.decks.length,
                        itemBuilder: (context, index) {
                          return RadioListTile(
                            title: Text(app.decks[index].name),
                            dense: true,
                            visualDensity: const VisualDensity(
                              horizontal: VisualDensity.minimumDensity,
                              vertical: VisualDensity.minimumDensity,
                            ),
                            value: app.decks[index].id,
                            groupValue: _selectedDeck?.id,
                            onChanged: (String? deckId) {
                              if (deckId != null) {
                                setState(() {
                                  _selectedDeck = app.decks[index];
                                });
                              }
                            },
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: Constants.spacingSmall),
            const Divider(
              color: Constants.dividerColor,
              height: 1,
              thickness: 1,
            ),
            _buildSuccess(),
            _buildError(),
            Padding(
              padding: const EdgeInsets.all(Constants.spacingMiddle),
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Constants.secondary,
                  foregroundColor: Constants.onSecondary,
                  maximumSize: const Size.fromHeight(
                    Constants.elevatedButtonSize,
                  ),
                  minimumSize: const Size.fromHeight(
                    Constants.elevatedButtonSize,
                  ),
                ),
                label: const Text('Export'),
                onPressed: _isLoading ? null : _export,
                icon:
                    _isLoading
                        ? const ElevatedButtonProgressIndicator()
                        : const Icon(Icons.download),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
