import 'package:feeddeck/widgets/source/add/add_source_fourchan.dart';
import 'package:flutter/material.dart';

import 'package:feeddeck/models/column.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/widgets/source/add/add_source_github.dart';
import 'package:feeddeck/widgets/source/add/add_source_googlenews.dart';
import 'package:feeddeck/widgets/source/add/add_source_lemmy.dart';
import 'package:feeddeck/widgets/source/add/add_source_mastodon.dart';
import 'package:feeddeck/widgets/source/add/add_source_medium.dart';
import 'package:feeddeck/widgets/source/add/add_source_nitter.dart';
import 'package:feeddeck/widgets/source/add/add_source_pinterest.dart';
import 'package:feeddeck/widgets/source/add/add_source_podcast.dart';
import 'package:feeddeck/widgets/source/add/add_source_reddit.dart';
import 'package:feeddeck/widgets/source/add/add_source_rss.dart';
import 'package:feeddeck/widgets/source/add/add_source_stackoverflow.dart';
import 'package:feeddeck/widgets/source/add/add_source_tumblr.dart';
import 'package:feeddeck/widgets/source/add/add_source_youtube.dart';
import 'package:feeddeck/widgets/source/source_icon.dart';

/// The [AddSource] widget allows users to create new sources. In the first step
/// the widgets shows a list of all available source types. When the user
/// selects a source type from the list we show a from for the selected type,
/// where the user can provide all the required information.
///
/// The created source is then passed to the [addSource] function so we can use
/// the created source in other widgets.
class AddSource extends StatefulWidget {
  const AddSource({
    super.key,
    required this.column,
  });

  final FDColumn column;

  @override
  State<AddSource> createState() => _AddSourceState();
}

class _AddSourceState extends State<AddSource> {
  FDSourceType _sourceType = FDSourceType.none;

  /// [_buildBody] returns a list of all supported source types when no source
  /// type was selected by the user ([_sourceType] == FDSourceType.none). If the
  /// user selected a source type, the functions returns the form for the
  /// selected source type.
  Widget _buildBody() {
    if (_sourceType == FDSourceType.fourchan) {
      return AddSourceFourChan(column: widget.column);
    }

    if (_sourceType == FDSourceType.github) {
      return AddSourceGitHub(column: widget.column);
    }

    if (_sourceType == FDSourceType.googlenews) {
      return AddSourceGoogleNews(column: widget.column);
    }

    if (_sourceType == FDSourceType.lemmy) {
      return AddSourceLemmy(column: widget.column);
    }

    if (_sourceType == FDSourceType.mastodon) {
      return AddSourceMastodon(column: widget.column);
    }

    if (_sourceType == FDSourceType.medium) {
      return AddSourceMedium(column: widget.column);
    }

    if (_sourceType == FDSourceType.nitter) {
      return AddSourceNitter(column: widget.column);
    }

    if (_sourceType == FDSourceType.pinterest) {
      return AddSourcePinterst(column: widget.column);
    }

    if (_sourceType == FDSourceType.podcast) {
      return AddSourcePodcast(column: widget.column);
    }

    if (_sourceType == FDSourceType.reddit) {
      return AddSourceReddit(column: widget.column);
    }

    if (_sourceType == FDSourceType.rss) {
      return AddSourceRSS(column: widget.column);
    }

    if (_sourceType == FDSourceType.stackoverflow) {
      return AddSourceStackOverflow(column: widget.column);
    }

    if (_sourceType == FDSourceType.tumblr) {
      return AddSourceTumblr(column: widget.column);
    }

    // if (_sourceType == FDSourceType.x) {
    //   return AddSourceX(column: widget.column);
    // }

    if (_sourceType == FDSourceType.youtube) {
      return AddSourceYouTube(column: widget.column);
    }

    return ListView.separated(
      padding: const EdgeInsets.all(Constants.spacingMiddle),
      separatorBuilder: (context, index) {
        return const SizedBox(
          height: Constants.spacingMiddle,
        );
      },
      itemCount: FDSourceType.values.length - 1,
      itemBuilder: (context, index) {
        return MouseRegion(
          cursor: SystemMouseCursors.click,
          child: GestureDetector(
            onTap: () {
              setState(() {
                _sourceType = FDSourceType.values[index];
              });
            },
            child: Container(
              padding: const EdgeInsets.all(Constants.spacingMiddle),
              decoration: BoxDecoration(
                /// Use the brand color for each source as background color.
                /// If we decide later to use a generic color as background
                /// the following line can be used:
                /// color: Constants.secondary,
                color: FDSourceType.values[index].bgColor,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  SourceIcon(
                    type: FDSourceType.values[index],
                    icon: null,
                    size: 48,
                  ),
                  const SizedBox(
                    height: Constants.spacingSmall,
                  ),
                  Text(
                    FDSourceType.values[index].toLocalizedString(),
                    style: TextStyle(
                      /// Since we are using the brand color as background
                      /// color, we are using the same color as for the icon
                      /// as text color (source_icon.dart). If we decide later
                      /// to use a generic color as background the following
                      /// line can be used:
                      /// color: Constants.onSecondary,
                      color: FDSourceType.values[index].fgColor,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        leading: _sourceType == FDSourceType.none
            ? null
            : BackButton(
                onPressed: () {
                  setState(() {
                    _sourceType = FDSourceType.none;
                  });
                },
              ),
        title: _sourceType == FDSourceType.none
            ? const Text('Add Source')
            : Text(_sourceType.toLocalizedString()),
        shape: const Border(
          bottom: BorderSide(
            color: Constants.dividerColor,
            width: 1,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.close,
            ),
            onPressed: () {
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
      body: SafeArea(
        child: _buildBody(),
      ),
    );
  }
}
