import 'package:feeddeck/models/source.dart';
import 'package:feeddeck/utils/api_exception.dart';
import 'package:http/http.dart' as http;

/// [getFeed] returns the feed for the provided [sourceType] and [options]. It
/// can be used to fetch the feed for a source on the client side (app) instead
/// of via the corresponding `add-or-update-source-v1` edge function or via our
/// worker.
///
/// The functions for the different sources must implement the same parsing for
/// the source options as it is done in the edge function.
Future<String> getFeed(FDSourceType sourceType, FDSourceOptions options) async {
  switch (sourceType) {
    case FDSourceType.reddit:
      return getFeedReddit(options.reddit);
    default:
      throw const ApiException('Unknown source type', 400);
  }
}

/// [getFeedReddit] returns the feed for the provided [input]. It is used to
/// fetch the RSS feed for a Reddit source, which can be passed to the
/// `add-or-update-source-v1` edge function.
///
/// The function must implement the same parsing logic as it is done in the
/// `supabase/functions/_shared/feed/reddit.ts` file.
Future<String> getFeedReddit(String? input) async {
  if (input == null || input.isEmpty) {
    throw const ApiException('No input provided', 400);
  }

  String url = '';
  try {
    if (input.startsWith('/r/') || input.startsWith('/u/')) {
      url = 'https://www.reddit.com$input.rss';
    } else {
      final inputUri = Uri.parse(input);
      if (inputUri.host.endsWith('reddit.com')) {
        if (input.endsWith('.rss')) {
          url = input;
        } else {
          url = '$input.rss';
        }
      } else {
        throw const ApiException('Invalid input', 400);
      }
    }
  } catch (err) {
    throw const ApiException('Invalid input', 400);
  }

  final response = await http.get(Uri.parse(url));
  return response.body;
}
