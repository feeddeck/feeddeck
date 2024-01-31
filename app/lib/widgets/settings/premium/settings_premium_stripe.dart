import 'package:flutter/material.dart';

import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as supabase;

import 'package:feeddeck/utils/api_exception.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/fd_icons.dart';
import 'package:feeddeck/utils/openurl.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';

const _settingsPremiumStripeText = '''
You are currently using the free version of FeedDeck, which allows you to add up
to 10 sources for the first 7 days. After that trial period your sources will
not be updated anymore.

To use FeedDeck after the trial period with up to 1000 sources, you need to
upgrade to a premium account. The premium account costs 5€ per month and can be
canceled at any time.
''';

class SettingsPremiumStripe extends StatefulWidget {
  const SettingsPremiumStripe({super.key});

  @override
  State<SettingsPremiumStripe> createState() => _SettingsPremiumStripeState();
}

class _SettingsPremiumStripeState extends State<SettingsPremiumStripe> {
  late Future<String> _futureFetchCheckoutSessionLink;

  /// [_fetchCheckoutSessionLink] is used to fetch the Stripe checkout session
  /// link. For that we have to call the `stripe-create-checkout-session-v1`
  /// Supabase edge function. If the link is generated successfully, the
  /// function returns the url, which can then be opened by the user.
  Future<String> _fetchCheckoutSessionLink() async {
    final result = await supabase.Supabase.instance.client.functions.invoke(
      'stripe-create-checkout-session-v1',
      method: supabase.HttpMethod.get,
    );

    if (result.status != 200) {
      throw ApiException(result.data['error'], result.status);
    }

    return result.data['url'];
  }

  /// [_openUrl] is used to open the [url] in a browser. If the link can not be
  /// opened the error is ignored.
  Future<void> _openUrl(String? url) async {
    try {
      if (url != null) {
        await openUrl(url);
      }
    } catch (_) {}
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    setState(() {
      _futureFetchCheckoutSessionLink = _fetchCheckoutSessionLink();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        shape: const Border(
          bottom: BorderSide(
            color: Constants.dividerColor,
            width: 1,
          ),
        ),
        title: const Text('FeedDeck Premium'),
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
        child: FutureBuilder(
          future: _futureFetchCheckoutSessionLink,
          builder: (
            BuildContext context,
            AsyncSnapshot<String> snapshot,
          ) {
            return Column(
              children: [
                const Expanded(
                  child: Padding(
                    padding: EdgeInsets.all(Constants.spacingMiddle),
                    child: SingleChildScrollView(
                      child: MarkdownBody(
                        selectable: true,
                        data: _settingsPremiumStripeText,
                      ),
                    ),
                  ),
                ),
                const SizedBox(
                  height: Constants.spacingSmall,
                ),
                const Divider(
                  color: Constants.dividerColor,
                  height: 1,
                  thickness: 1,
                ),
                Padding(
                  padding: const EdgeInsets.all(Constants.spacingMiddle),
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Constants.primary,
                      foregroundColor: Constants.onPrimary,
                      maximumSize: const Size.fromHeight(
                        Constants.elevatedButtonSize,
                      ),
                      minimumSize: const Size.fromHeight(
                        Constants.elevatedButtonSize,
                      ),
                    ),
                    label: const Text('Subscribe to FeedDeck Premium'),
                    onPressed:
                        snapshot.connectionState == ConnectionState.none ||
                                snapshot.connectionState ==
                                    ConnectionState.waiting ||
                                snapshot.hasError
                            ? null
                            : () => _openUrl(snapshot.data),
                    icon: snapshot.connectionState == ConnectionState.none ||
                            snapshot.connectionState ==
                                ConnectionState.waiting ||
                            snapshot.hasError
                        ? const ElevatedButtonProgressIndicator()
                        : const Icon(FDIcons.feeddeck),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
