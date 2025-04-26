import 'dart:convert';
import 'dart:io';

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

class SettingsAppSettingsImport extends StatelessWidget {
  const SettingsAppSettingsImport({super.key});

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
              return Import();
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
                            Characters('Import')
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
                    Icon(Icons.upload),
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

class Import extends StatefulWidget {
  const Import({super.key});

  @override
  State<Import> createState() => _ExportState();
}

class _ExportState extends State<Import> {
  bool _isLoading = false;
  String _success = '';
  String _error = '';
  int _progressMax = 0;
  int _progressCurrent = 0;

  /// [_import] is the function to import a deck from a OPML file. In the first
  /// step we let the user select a file. Then we parse the file and create a
  /// new deck with all it's columns and sources.
  Future<void> _import() async {
    setState(() {
      _isLoading = true;
      _success = '';
      _error = '';
      _progressMax = 0;
      _progressCurrent = 0;
    });

    try {
      /// Show a file picker, where the user can select an OPML file, which will
      /// be parsed in the following.
      ///
      ///   - For Android we have to unset the [allowedExtensions] and [type],
      ///     because of https://github.com/miguelpruivo/flutter_file_picker/issues/1689
      ///   - For iOS we have to unset the [allowedExtensions] and [type],
      ///     otherwise we can not select files in the file browser.
      final files =
          (await FilePicker.platform.pickFiles(
            allowedExtensions:
                !kIsWeb && (Platform.isAndroid || Platform.isIOS)
                    ? null
                    : ['opml'],
            type:
                !kIsWeb && (Platform.isAndroid || Platform.isIOS)
                    ? FileType.any
                    : FileType.custom,
            allowMultiple: false,
            dialogTitle: 'Import',
            lockParentWindow: true,
            withData: true,
          ))?.files;

      /// If the list of selected files is empty or doesn't has a length of 1 or
      /// the selected file is empty we return here. This can happen if the user
      /// aborted the import and closed the file picker without selecting a
      /// file.
      if (files == null || files.length != 1 || files[0].bytes == null) {
        setState(() {
          _isLoading = false;
        });
        return;
      }

      /// Parse the selected OPML file and get the name of the deck which should
      /// be created and all the columns and sources.
      final opml = XmlDocument.parse(utf8.decode(files[0].bytes!));

      final deckName =
          opml
              .getElement('opml')
              ?.getElement('head')
              ?.getElement('title')
              ?.innerText ??
          'Unknown';

      final columns = <FDColumn>[];
      final unknownColumn = FDColumn(
        id: '',
        name: 'Unknown',
        position: 0,
        sources: [],
      );

      opml
          .getElement('opml')
          ?.getElement('body')
          ?.findElements('outline')
          .forEach((outline) {
            /// If the `outline` element contains a `type` attribute, it must be
            /// a source. This can happen if an OPML file from another RSS
            /// reader is imported, which doesn't categorize the RSS feed.
            ///
            /// In this case we try to parse the `outline` element as source and
            /// add the source to the [unknownColumn] column.
            if (outline.getAttribute('type') != null) {
              final source = FDSource.fromXml(outline);
              if (source.type != FDSourceType.none) {
                unknownColumn.sources.add(source);
              }
              return;
            }

            /// If the `outline` element doesn't contain a `type` attribute, it
            /// must be a column. This is the case for all exports from FeedDeck
            /// and for OPML files from other vendors, which categorize their
            /// feeds.
            ///
            /// In this case we parse the `outline` element as column and add it
            /// to the [columns]. Within the column parsing we also try to parse
            /// all sibling `outline` elements as source and add it to the
            /// column.
            final column = FDColumn.fromXml(outline);
            columns.add(column);
            return;
          });

      /// If we have added sources to the [unknownColumn] column, we add it to
      /// the list of [columns]. Otherwise we can ignore it.
      if (unknownColumn.sources.isNotEmpty) {
        columns.add(unknownColumn);
      }

      setState(() {
        _progressMax = columns
            .map((column) => column.sources.length)
            .reduce((a, b) => a + b);
      });

      /// Create a new deck with the name ([deckName]) we retrieved earlier from
      /// the selected OPML file.
      final newDeck = FDDeck.fromJson(
        await Supabase.instance.client
            .from('decks')
            .insert({
              'name': deckName,
              'userId': Supabase.instance.client.auth.currentUser!.id,
            })
            .select()
            .single(),
      );

      final errors = <String>[];

      /// Go through all the columns and sources we got from the OPML file and
      /// create them in the newly created deck. If this process throws an error
      /// we do not abort the import, instead we add the error to the list of
      /// [errors].
      for (var i = 0; i < columns.length; i++) {
        try {
          final newColumn = FDColumn.fromJson(
            await Supabase.instance.client
                .from('columns')
                .insert({
                  'deckId': newDeck.id,
                  'userId': Supabase.instance.client.auth.currentUser!.id,
                  'name': columns[i].name,
                  'position': i,
                })
                .select()
                .single(),
          );

          for (var j = 0; j < columns[i].sources.length; j++) {
            try {
              final result = await Supabase.instance.client.functions.invoke(
                'add-or-update-source-v1',
                body: {
                  'source': {
                    'id': '',
                    'columnId': newColumn.id,
                    'userId': '',
                    'type': columns[i].sources[j].type.toShortString(),
                    'title': '',
                    'options': columns[i].sources[j].options?.toJson(),
                  },
                },
              );

              if (result.status != 200) {
                errors.add('Failed to create source: ${result.data['error']}');
              }
            } catch (err) {
              errors.add('Failed to create source: ${err.toString()}');
            } finally {
              setState(() {
                _progressCurrent++;
              });
            }
          }
        } catch (err) {
          errors.add('Failed to create column: ${err.toString()}');
        }
      }

      /// When we have created the new deck with all it's columns and sources,
      /// we trigger an update of the decks in the [AppRepository] so that the
      /// new deck is also visible in the UI.
      if (mounted) {
        await Provider.of<AppRepository>(
          context,
          listen: false,
        ).getDecksWithNotifiy();
      }

      /// While creating all columns and sources we add the errors to the
      /// [errors] list. If the list is empty everthing went fine. If the list
      /// contains an error we show the error to the user.
      if (errors.isNotEmpty) {
        setState(() {
          _success = 'Import successfull, with ${errors.length} errors';
          _isLoading = false;
        });
        return;
      }

      setState(() {
        _success = 'Import successfull';
        _isLoading = false;
      });
    } catch (err) {
      setState(() {
        _error = 'Import failed: ${err.toString()}';
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

  /// [_buildProgress] returns a widget to display the progress when the
  /// [_progressMax] value if not 0.
  Widget _buildProgress() {
    if (_progressMax > 0) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Importing source $_progressCurrent of $_progressMax',
            style: const TextStyle(color: Constants.primary),
          ),
          LinearProgressIndicator(value: _progressCurrent / _progressMax),
        ],
      );
    }

    return Container();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        shape: const Border(
          bottom: BorderSide(color: Constants.dividerColor, width: 1),
        ),
        title: Text('Import'),
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
                        'Click the "Import" button to select an OPML file. This action will create a new deck containing all the columns and sources from the OPML file.',
                      ),
                      const SizedBox(height: Constants.spacingMiddle),
                      _buildProgress(),
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
                label: const Text('Import'),
                onPressed: _isLoading ? null : _import,
                icon:
                    _isLoading
                        ? const ElevatedButtonProgressIndicator()
                        : const Icon(Icons.upload),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
