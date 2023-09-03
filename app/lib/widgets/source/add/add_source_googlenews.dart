import 'package:flutter/material.dart';

import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:provider/provider.dart';

import 'package:feeddeck/models/column.dart';
import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/models/sources/googlenews.dart';
import 'package:feeddeck/repositories/app_repository.dart';
import 'package:feeddeck/utils/api_exception.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/openurl.dart';
import 'package:feeddeck/widgets/source/add/add_source_form.dart';

const _helpText = '''
The Google News source can be used to get the latest news from Google News. You
can provide the url of a Google News page or a search query:

- **URL**: Get the latest news from the provided Google News page, e.g.
  `https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtUmxHZ0pFUlNnQVAB?hl=de&gl=DE&ceid=DE%3Ade`
  or `https://news.google.com/rss/search?q=Sport&hl=de&gl=DE&ceid=DE:de`.
- **Search**: Get the latest news for the provided search term, e.g. `Sport`.
  You also have to select the language and country for which you want to get the
  news.
''';

/// The [AddSourceGoogleNews] widget is used to display the form to add a new
/// Google News source.
class AddSourceGoogleNews extends StatefulWidget {
  const AddSourceGoogleNews({
    super.key,
    required this.column,
  });

  final FDColumn column;

  @override
  State<AddSourceGoogleNews> createState() => _AddSourceGoogleNewsState();
}

class _AddSourceGoogleNewsState extends State<AddSourceGoogleNews> {
  final _formKey = GlobalKey<FormState>();
  FDGoogleNewsType _googlenewsType = FDGoogleNewsType.url;
  final _googlenewsUrl = TextEditingController();
  final _googlenewsSearch = TextEditingController();
  GoogleNewsCode _googlenewsCode = googlenewsCodes[0];
  bool _isLoading = false;
  String _error = '';

  /// [_addSource] is used to add a new Google News source. Depending on the
  /// selected [_googlenewsType] we need different information to add the source.
  /// Which data is required for which type is defined in the [_buildForm]
  /// function.
  Future<void> _addSource() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      AppRepository app = Provider.of<AppRepository>(context, listen: false);
      await app.addSource(
        widget.column.id,
        FDSourceType.googlenews,
        FDSourceOptions(
          googlenews: FDGoogleNewsOptions(
            type: _googlenewsType,
            url: _googlenewsUrl.text,
            search: _googlenewsSearch.text,
            ceid: _googlenewsCode.ceid,
            gl: _googlenewsCode.gl,
            hl: _googlenewsCode.hl,
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
  /// [_googlenewsType]. Depending on the type we need different information
  /// from the user (e.g. a Google News URl or a search term).
  List<Widget> _buildForm() {
    if (_googlenewsType == FDGoogleNewsType.url) {
      return [
        TextFormField(
          controller: _googlenewsUrl,
          keyboardType: TextInputType.text,
          autocorrect: false,
          enableSuggestions: true,
          maxLines: 1,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
            labelText: 'Url',
          ),
        ),
        const SizedBox(height: Constants.spacingMiddle),
      ];
    }

    if (_googlenewsType == FDGoogleNewsType.search) {
      return [
        TextFormField(
          controller: _googlenewsSearch,
          keyboardType: TextInputType.text,
          autocorrect: false,
          enableSuggestions: true,
          maxLines: 1,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
            labelText: 'Search',
          ),
        ),
        const SizedBox(height: Constants.spacingMiddle),
        DropdownButton<GoogleNewsCode>(
          value: _googlenewsCode,
          isExpanded: true,
          underline: Container(height: 1, color: Constants.primary),
          onChanged: (GoogleNewsCode? value) {
            setState(() {
              _googlenewsCode = value!;
            });
          },
          items: googlenewsCodes
              .map<DropdownMenuItem<GoogleNewsCode>>((GoogleNewsCode value) {
            return DropdownMenuItem<GoogleNewsCode>(
              value: value,
              child: Text(value.name),
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
    _googlenewsUrl.dispose();
    _googlenewsSearch.dispose();
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
            DropdownButton<FDGoogleNewsType>(
              value: _googlenewsType,
              isExpanded: true,
              underline: Container(height: 1, color: Constants.primary),
              onChanged: (FDGoogleNewsType? value) {
                setState(() {
                  _googlenewsType = value!;
                });
              },
              items: FDGoogleNewsType.values
                  .map<DropdownMenuItem<FDGoogleNewsType>>(
                      (FDGoogleNewsType value) {
                return DropdownMenuItem<FDGoogleNewsType>(
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

/// [GoogleNewsCode] is the model for a supported language and region by Google
/// News.
class GoogleNewsCode {
  String ceid;
  String name;
  String gl;
  String hl;

  GoogleNewsCode({
    required this.ceid,
    required this.name,
    required this.gl,
    required this.hl,
  });
}

/// [googlenewsCodes] is the list of all supported languages and regions by
/// Google News.
final googlenewsCodes = <GoogleNewsCode>[
  GoogleNewsCode(
    ceid: 'DE:de',
    name: 'Deutsch (Deutschland)',
    gl: 'DE',
    hl: 'de',
  ),
  GoogleNewsCode(
    ceid: 'AT:de',
    name: 'Deutsch (Österreich)',
    gl: 'AT',
    hl: 'de',
  ),
  GoogleNewsCode(
    ceid: 'CH:de',
    name: 'Deutsch (Schweiz)',
    gl: 'CH',
    hl: 'de',
  ),
  GoogleNewsCode(
    ceid: 'ID:id',
    name: 'Bahasa Indonesia (Indonesia)',
    gl: 'ID',
    hl: 'id',
  ),
  GoogleNewsCode(
    ceid: 'CZ:cs',
    name: 'Čeština (Česko)',
    gl: 'CZ',
    hl: 'cs',
  ),
  GoogleNewsCode(
    ceid: 'AU:en',
    name: 'English (Australia)',
    gl: 'AU',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'BW:en',
    name: 'English (Botswana)',
    gl: 'BW',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'CA:en',
    name: 'English (Canada)',
    gl: 'CA',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'ET:en',
    name: 'English (Ethiopia)',
    gl: 'ET',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'GH:en',
    name: 'English (Ghana)',
    gl: 'GH',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'IN:en',
    name: 'English (India)',
    gl: 'IN',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'ID:en',
    name: 'English (Indonesia)',
    gl: 'ID',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'IE:en',
    name: 'English (Ireland)',
    gl: 'IE',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'IL:en',
    name: 'English (Israel)',
    gl: 'IL',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'KE:en',
    name: 'English (Kenya)',
    gl: 'KE',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'LV:en',
    name: 'English (Latvia)',
    gl: 'LV',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'MY:en',
    name: 'English (Malaysia)',
    gl: 'MY',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'NA:en',
    name: 'English (Namibia)',
    gl: 'NA',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'NZ:en',
    name: 'English (New Zealand)',
    gl: 'NZ',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'NG:en',
    name: 'English (Nigeria)',
    gl: 'NG',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'PK:en',
    name: 'English (Pakistan)',
    gl: 'PK',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'PH:en',
    name: 'English (Philippines)',
    gl: 'PH',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'SG:en',
    name: 'English (Singapore)',
    gl: 'SG',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'ZA:en',
    name: 'English (South Africa)',
    gl: 'ZA',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'TZ:en',
    name: 'English (Tanzania)',
    gl: 'TZ',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'UG:en',
    name: 'English (Uganda)',
    gl: 'UG',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'GB:en',
    name: 'English (United Kingdom)',
    gl: 'GB',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'US:en',
    name: 'English (United States)',
    gl: 'US',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'ZW:en',
    name: 'English (Zimbabwe)',
    gl: 'ZW',
    hl: 'en',
  ),
  GoogleNewsCode(
    ceid: 'AR:es-419',
    name: 'Español (Argentina)',
    gl: 'AR',
    hl: 'es-419',
  ),
  GoogleNewsCode(
    ceid: 'CL:es-419',
    name: 'Español (Chile)',
    gl: 'CL',
    hl: 'es-419',
  ),
  GoogleNewsCode(
    ceid: 'CO:es-419',
    name: 'Español (Colombia)',
    gl: 'CO',
    hl: 'es-419',
  ),
  GoogleNewsCode(
    ceid: 'CU:es-419',
    name: 'Español (Cuba)',
    gl: 'CU',
    hl: 'es-419',
  ),
  GoogleNewsCode(
    ceid: 'ES:es',
    name: 'Español (España)',
    gl: 'ES',
    hl: 'es',
  ),
  GoogleNewsCode(
    ceid: 'US:es-419',
    name: 'Español (Estados Unidos)',
    gl: 'US',
    hl: 'es-419',
  ),
  GoogleNewsCode(
    ceid: 'MX:es-419',
    name: 'Español (México)',
    gl: 'MX',
    hl: 'es-419',
  ),
  GoogleNewsCode(
    ceid: 'PE:es-419',
    name: 'Español (Perú)',
    gl: 'PE',
    hl: 'es-419',
  ),
  GoogleNewsCode(
    ceid: 'VE:es-419',
    name: 'Español (Venezuela)',
    gl: 'VE',
    hl: 'es-419',
  ),
  GoogleNewsCode(
    ceid: 'BE:fr',
    name: 'Français (Belgique)',
    gl: 'BE',
    hl: 'fr',
  ),
  GoogleNewsCode(
    ceid: 'CA:fr',
    name: 'Français (Canada)',
    gl: 'CA',
    hl: 'fr',
  ),
  GoogleNewsCode(
    ceid: 'FR:fr',
    name: 'Français (France)',
    gl: 'FR',
    hl: 'fr',
  ),
  GoogleNewsCode(
    ceid: 'MA:fr',
    name: 'Français (Maroc)',
    gl: 'MA',
    hl: 'fr',
  ),
  GoogleNewsCode(
    ceid: 'SN:fr',
    name: 'Français (Sénégal)',
    gl: 'SN',
    hl: 'fr',
  ),
  GoogleNewsCode(
    ceid: 'CH:fr',
    name: 'Français (Suisse)',
    gl: 'CH',
    hl: 'fr',
  ),
  GoogleNewsCode(
    ceid: 'IT:it',
    name: 'Italiano (Italia)',
    gl: 'IT',
    hl: 'it',
  ),
  GoogleNewsCode(
    ceid: 'LV:lv',
    name: 'Latviešu (Latvija)',
    gl: 'LV',
    hl: 'lv',
  ),
  GoogleNewsCode(
    ceid: 'LT:lt',
    name: 'Lietuvių (Lietuva)',
    gl: 'LT',
    hl: 'lt',
  ),
  GoogleNewsCode(
    ceid: 'HU:hu',
    name: 'Magyar (Magyarország)',
    gl: 'HU',
    hl: 'hu',
  ),
  GoogleNewsCode(
    ceid: 'BE:nl',
    name: 'Nederlands (België)',
    gl: 'BE',
    hl: 'nl',
  ),
  GoogleNewsCode(
    ceid: 'NL:nl',
    name: 'Nederlands (Nederland)',
    gl: 'NL',
    hl: 'nl',
  ),
  GoogleNewsCode(
    ceid: 'NO:no',
    name: 'Norsk (Norge)',
    gl: 'NO',
    hl: 'no',
  ),
  GoogleNewsCode(
    ceid: 'PL:pl',
    name: 'Polski (Polska)',
    gl: 'PL',
    hl: 'pl',
  ),
  GoogleNewsCode(
    ceid: 'BR:pt-419',
    name: 'Português (Brasil)',
    gl: 'BR',
    hl: 'pt-BR',
  ),
  GoogleNewsCode(
    ceid: 'PT:pt-150',
    name: 'Português (Portugal)',
    gl: 'PT',
    hl: 'pt-PT',
  ),
  GoogleNewsCode(
    ceid: 'RO:ro',
    name: 'Română (România)',
    gl: 'RO',
    hl: 'ro',
  ),
  GoogleNewsCode(
    ceid: 'SK:sk',
    name: 'Slovenčina (Slovensko)',
    gl: 'SK',
    hl: 'sk',
  ),
  GoogleNewsCode(
    ceid: 'SI:sl',
    name: 'Slovenščina (Slovenija)',
    gl: 'SI',
    hl: 'sl',
  ),
  GoogleNewsCode(
    ceid: 'SE:sv',
    name: 'Svenska (Sverige)',
    gl: 'SE',
    hl: 'sv',
  ),
  GoogleNewsCode(
    ceid: 'VN:vi',
    name: 'Tiếng Việt (Việt Nam)',
    gl: 'VN',
    hl: 'vi',
  ),
  GoogleNewsCode(
    ceid: 'TR:tr',
    name: 'Türkçe (Türkiye)',
    gl: 'TR',
    hl: 'tr',
  ),
  GoogleNewsCode(
    ceid: 'GR:el',
    name: 'Ελληνικά (Ελλάδα)',
    gl: 'GR',
    hl: 'el',
  ),
  GoogleNewsCode(
    ceid: 'BG:bg',
    name: 'Български (България)',
    gl: 'BG',
    hl: 'bg',
  ),
  GoogleNewsCode(
    ceid: 'RU:ru',
    name: 'Русский (Россия)',
    gl: 'RU',
    hl: 'ru',
  ),
  GoogleNewsCode(
    ceid: 'UA:ru',
    name: 'Русский (Украина)',
    gl: 'UA',
    hl: 'ru',
  ),
  GoogleNewsCode(
    ceid: 'RS:sr',
    name: 'Српски (Србија)',
    gl: 'RS',
    hl: 'sr',
  ),
  GoogleNewsCode(
    ceid: 'UA:uk',
    name: 'Українська (Україна)',
    gl: 'UA',
    hl: 'uk',
  ),
  GoogleNewsCode(
    ceid: 'IL:he',
    name: 'עברית (ישראל)',
    gl: 'IL',
    hl: 'he',
  ),
  GoogleNewsCode(
    ceid: 'AE:ar',
    name: 'العربية (الإمارات العربية المتحدة)',
    gl: 'AE',
    hl: 'ar',
  ),
  GoogleNewsCode(
    ceid: 'SA:ar',
    name: 'العربية (المملكة العربية السعودية)',
    gl: 'SA',
    hl: 'ar',
  ),
  GoogleNewsCode(
    ceid: 'LB:ar',
    name: 'العربية (لبنان)',
    gl: 'LB',
    hl: 'ar',
  ),
  GoogleNewsCode(
    ceid: 'EG:ar',
    name: 'العربية (مصر)',
    gl: 'EG',
    hl: 'ar',
  ),
  GoogleNewsCode(
    ceid: 'IN:mr',
    name: 'मराठी (भारत)',
    gl: 'IN',
    hl: 'mr',
  ),
  GoogleNewsCode(
    ceid: 'IN:hi',
    name: 'हिन्दी (भारत)',
    gl: 'IN',
    hl: 'hi',
  ),
  GoogleNewsCode(
    ceid: 'BD:bn',
    name: 'বাংলা (বাংলাদেশ)',
    gl: 'BD',
    hl: 'bn',
  ),
  GoogleNewsCode(
    ceid: 'IN:bn',
    name: 'বাংলা (ভারত)',
    gl: 'IN',
    hl: 'bn',
  ),
  GoogleNewsCode(
    ceid: 'IN:ta',
    name: 'தமிழ் (இந்தியா)',
    gl: 'IN',
    hl: 'ta',
  ),
  GoogleNewsCode(
    ceid: 'IN:te',
    name: 'తెలుగు (భారతదేశం)',
    gl: 'IN',
    hl: 'te',
  ),
  GoogleNewsCode(
    ceid: 'IN:ml',
    name: 'മലയാളം (ഇന്ത്യ)',
    gl: 'IN',
    hl: 'ml',
  ),
  GoogleNewsCode(
    ceid: 'TH:th',
    name: 'ไทย (ไทย)',
    gl: 'TH',
    hl: 'th',
  ),
  GoogleNewsCode(
    ceid: 'CN:zh-Hans',
    name: '中文 (中国)',
    gl: 'CN',
    hl: 'zh-Hans',
  ),
  GoogleNewsCode(
    ceid: 'TW:zh-Hant',
    name: '中文 (台灣)',
    gl: 'TW',
    hl: 'zh-TW',
  ),
  GoogleNewsCode(
    ceid: 'HK:zh-Hant',
    name: '中文 (香港)',
    gl: 'HK',
    hl: 'zh-HK',
  ),
  GoogleNewsCode(
    ceid: 'JP:ja',
    name: '日本語 (日本)',
    gl: 'JP',
    hl: 'ja',
  ),
  GoogleNewsCode(
    ceid: 'KR:ko',
    name: '한국어 (대한민국)',
    gl: 'KR',
    hl: 'ko',
  ),
];
