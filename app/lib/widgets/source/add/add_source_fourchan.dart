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
The 4chan source can be used to follow your favorite 4chan boards.
''';

/// The [AddSourceFourChan] widget is used to display the form to add a new
/// 4chan board.
class AddSourceFourChan extends StatefulWidget {
  const AddSourceFourChan({
    super.key,
    required this.column,
  });

  final FDColumn column;

  @override
  State<AddSourceFourChan> createState() => _AddSourceFourChanState();
}

class _AddSourceFourChanState extends State<AddSourceFourChan> {
  final _formKey = GlobalKey<FormState>();
  String _fourChanBoard = 'a';
  bool _isLoading = false;
  String _error = '';

  /// [_addSource] adds a new 4chan board. The user can select a board from the
  /// dropdown and we will generate the corresponding URL.
  Future<void> _addSource() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      AppRepository app = Provider.of<AppRepository>(context, listen: false);
      await app.addSource(
        widget.column.id,
        FDSourceType.fourchan,
        FDSourceOptions(
          fourchan: _fourChanBoard,
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
            DropdownButton<String>(
              value: _fourChanBoard,
              isExpanded: true,
              underline: Container(height: 1, color: Constants.primary),
              onChanged: (String? value) {
                setState(() {
                  _fourChanBoard = value!;
                });
              },
              items: boards.map((FourChanBoard value) {
                return DropdownMenuItem(
                  value: value.id,
                  child: Text(value.name),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

/// [FourChanBoard] is the model for a supported 4chan boards.
class FourChanBoard {
  String id;
  String name;

  FourChanBoard({
    required this.id,
    required this.name,
  });
}

/// [boards] is the list of all supported 4chan boards.
final boards = <FourChanBoard>[
  FourChanBoard(
    id: 'a',
    name: 'Anime & Manga',
  ),
  FourChanBoard(
    id: 'c',
    name: 'Anime/Cute',
  ),
  FourChanBoard(
    id: 'w',
    name: 'Anime/Wallpapers',
  ),
  FourChanBoard(
    id: 'm',
    name: 'Mecha',
  ),
  FourChanBoard(
    id: 'cgl',
    name: 'Cosplay & EGL',
  ),
  FourChanBoard(
    id: 'cm',
    name: 'Cute/Male',
  ),
  FourChanBoard(
    id: 'f',
    name: 'Flash',
  ),
  FourChanBoard(
    id: 'n',
    name: 'Transportation',
  ),
  FourChanBoard(
    id: 'jp',
    name: 'Otaku Culture',
  ),
  FourChanBoard(
    id: 'vt',
    name: 'Virtual YouTubers',
  ),
  FourChanBoard(
    id: 'v',
    name: 'Video Games',
  ),
  FourChanBoard(
    id: 'vg',
    name: 'Video Game Generals',
  ),
  FourChanBoard(
    id: 'vm',
    name: 'Video Games/Multiplayer',
  ),
  FourChanBoard(
    id: 'vmg',
    name: 'Video Games/Mobile',
  ),
  FourChanBoard(
    id: 'vp',
    name: 'Pokémon',
  ),
  FourChanBoard(
    id: 'vr',
    name: 'Retro Games',
  ),
  FourChanBoard(
    id: 'vrpg',
    name: 'Video Games/RPG',
  ),
  FourChanBoard(
    id: 'vst',
    name: 'Video Games/Strategy',
  ),
  FourChanBoard(
    id: 'co',
    name: 'Comics & Cartoons',
  ),
  FourChanBoard(
    id: 'g',
    name: 'Technology',
  ),
  FourChanBoard(
    id: 'tv',
    name: 'Television & Film',
  ),
  FourChanBoard(
    id: 'k',
    name: 'Weapons',
  ),
  FourChanBoard(
    id: 'o',
    name: 'Auto',
  ),
  FourChanBoard(
    id: 'an',
    name: 'Animals & Nature',
  ),
  FourChanBoard(
    id: 'tg',
    name: 'Traditional Games',
  ),
  FourChanBoard(
    id: 'sp',
    name: 'Sports',
  ),
  FourChanBoard(
    id: 'xs',
    name: 'Extreme Sports',
  ),
  FourChanBoard(
    id: 'pw',
    name: 'Professional Wrestling',
  ),
  FourChanBoard(
    id: 'sci',
    name: 'Science & Math',
  ),
  FourChanBoard(
    id: 'his',
    name: 'History & Humanities',
  ),
  FourChanBoard(
    id: 'int',
    name: 'International',
  ),
  FourChanBoard(
    id: 'out',
    name: 'Outdoors',
  ),
  FourChanBoard(
    id: 'toy',
    name: 'Toys',
  ),
  FourChanBoard(
    id: 'i',
    name: 'Oekaki',
  ),
  FourChanBoard(
    id: 'po',
    name: 'Papercraft & Origami',
  ),
  FourChanBoard(
    id: 'p',
    name: 'Photography',
  ),
  FourChanBoard(
    id: 'ck',
    name: 'Food & Cooking',
  ),
  FourChanBoard(
    id: 'ic',
    name: 'Artwork/Critique',
  ),
  FourChanBoard(
    id: 'wg',
    name: 'Wallpapers/General',
  ),
  FourChanBoard(
    id: 'lit',
    name: 'Literature',
  ),
  FourChanBoard(
    id: 'mu',
    name: 'Music',
  ),
  FourChanBoard(
    id: 'fa',
    name: 'Fashion',
  ),
  FourChanBoard(
    id: '3',
    name: '3DCG',
  ),
  FourChanBoard(
    id: 'gd',
    name: 'Graphic Design',
  ),
  FourChanBoard(
    id: 'diy',
    name: 'Do-It-Yourself',
  ),
  FourChanBoard(
    id: 'wsg',
    name: 'Worksafe GIF',
  ),
  FourChanBoard(
    id: 'qst',
    name: 'Quests',
  ),
  FourChanBoard(
    id: 'biz',
    name: 'Business & Finance',
  ),
  FourChanBoard(
    id: 'trv',
    name: 'Travel',
  ),
  FourChanBoard(
    id: 'fit',
    name: 'Fitness',
  ),
  FourChanBoard(
    id: 'x',
    name: 'Paranormal',
  ),
  FourChanBoard(
    id: 'adv',
    name: 'Advice',
  ),
  FourChanBoard(
    id: 'lgbt',
    name: 'LGBT',
  ),
  FourChanBoard(
    id: 'mlp',
    name: 'Pony',
  ),
  FourChanBoard(
    id: 'news',
    name: 'Current News',
  ),
  FourChanBoard(
    id: 'wsr',
    name: 'Worksafe Requests',
  ),
  FourChanBoard(
    id: 'vip',
    name: 'Very Important Posts',
  ),
  FourChanBoard(
    id: 'b',
    name: 'Random (NSFW)',
  ),
  FourChanBoard(
    id: 'r9k',
    name: 'ROBOT9001 (NSFW)',
  ),
  FourChanBoard(
    id: 'pol',
    name: 'Politically Incorrect (NSFW)',
  ),
  FourChanBoard(
    id: 'bant',
    name: 'International/Random (NSFW)',
  ),
  FourChanBoard(
    id: 'soc',
    name: 'Cams & Meetups (NSFW)',
  ),
  FourChanBoard(
    id: 's4s',
    name: 'Shit 4chan Says (NSFW)',
  ),
  FourChanBoard(
    id: 's',
    name: 'Sexy Beautiful Women (NSFW)',
  ),
  FourChanBoard(
    id: 'hc',
    name: 'Hardcore (NSFW)',
  ),
  FourChanBoard(
    id: 'hm',
    name: 'Handsome Men (NSFW)',
  ),
  FourChanBoard(
    id: 'h',
    name: 'Hentai (NSFW)',
  ),
  FourChanBoard(
    id: 'e',
    name: 'Ecchi (NSFW)',
  ),
  FourChanBoard(
    id: 'u',
    name: 'Yuri (NSFW)',
  ),
  FourChanBoard(
    id: 'd',
    name: 'Hentai/Alternative (NSFW)',
  ),
  FourChanBoard(
    id: 'y',
    name: 'Yaoi (NSFW)',
  ),
  FourChanBoard(
    id: 't',
    name: 'Torrents (NSFW)',
  ),
  FourChanBoard(
    id: 'hr',
    name: 'High Resolution (NSFW)',
  ),
  FourChanBoard(
    id: 'gif',
    name: 'Adult GIF (NSFW)',
  ),
  FourChanBoard(
    id: 'aco',
    name: 'Adult Cartoons (NSFW)',
  ),
  FourChanBoard(
    id: 'r',
    name: 'Adult Requests (NSFW)',
  ),
];
