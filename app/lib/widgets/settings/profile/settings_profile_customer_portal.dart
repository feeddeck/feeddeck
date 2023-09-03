import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:feeddeck/utils/api_exception.dart';
import 'package:feeddeck/utils/constants.dart';
import 'package:feeddeck/utils/openurl.dart';
import 'package:feeddeck/widgets/general/elevated_button_progress_indicator.dart';

const _settingsProfileCustomerPortalText = '''
The customer portal allows you to manage your payment methods and subscriptions.
To open the customer portal click on the **Open Customer Portal** button below.
''';

/// The [SettingsProfileCustomerPortal] widget displays a button which allows
/// a user to open the Stripe customer portal to manage his payment methods and
/// subscriptions.
class SettingsProfileCustomerPortal extends StatelessWidget {
  const SettingsProfileCustomerPortal({super.key});

  @override
  Widget build(BuildContext context) {
    if (!kIsWeb) {
      return Container();
    }

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
              return const SettingsProfileCustomerPortalModal();
            },
          );
        },
        child: Card(
          color: Constants.secondary,
          margin: const EdgeInsets.only(
            bottom: Constants.spacingSmall,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.all(
                  Constants.spacingMiddle,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            Characters('Customer Portal')
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
                    const Icon(Icons.receipt),
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

/// The [SettingsProfileCustomerPortalModal] widget displays a modal. When the
/// modal is opened the Stripe customer portal link is loaded. Once the link is
/// loaded the user can open the link in a browser.
class SettingsProfileCustomerPortalModal extends StatefulWidget {
  const SettingsProfileCustomerPortalModal({super.key});

  @override
  State<SettingsProfileCustomerPortalModal> createState() =>
      _SettingsProfileCustomerPortalModalState();
}

class _SettingsProfileCustomerPortalModalState
    extends State<SettingsProfileCustomerPortalModal> {
  late Future<String> _futureFetchCustomerPortalLink;

  /// [_fetchCustomerPortalLink] is used to fetch the Stripe customer portal
  /// link. For that we have to call the `stripe-create-billing-portal-link-v1`
  /// Supabase edge function. If the link is generated successfully, the
  /// function returns the url, which can then be opened by the user.
  Future<String> _fetchCustomerPortalLink() async {
    final result = await Supabase.instance.client.functions.invoke(
      'stripe-create-billing-portal-link-v1',
      method: HttpMethod.get,
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
      _futureFetchCustomerPortalLink = _fetchCustomerPortalLink();
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
        title: const Text('Customer Portal'),
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
      body: FutureBuilder(
        future: _futureFetchCustomerPortalLink,
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
                      data: _settingsProfileCustomerPortalText,
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
                    maximumSize: const Size.fromHeight(
                      Constants.elevatedButtonSize,
                    ),
                    minimumSize: const Size.fromHeight(
                      Constants.elevatedButtonSize,
                    ),
                  ),
                  label: const Text('Open Customer Portal'),
                  onPressed: snapshot.connectionState == ConnectionState.none ||
                          snapshot.connectionState == ConnectionState.waiting ||
                          snapshot.hasError
                      ? null
                      : () => _openUrl(snapshot.data),
                  icon: snapshot.connectionState == ConnectionState.none ||
                          snapshot.connectionState == ConnectionState.waiting ||
                          snapshot.hasError
                      ? const ElevatedButtonProgressIndicator()
                      : const Icon(Icons.receipt),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
