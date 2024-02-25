# Contributing

- [Feedback, Issues and Questions](#feedback-issues-and-questions)
- [Adding new Features](#adding-new-features)
- [Development](#development)
  - [Working with Flutter](#working-with-flutter)
    - [Sort all Imports](#sort-all-imports)
    - [Add a Custom Icon](#add-a-custom-icon)
    - [Update the Icons and Splash Screen](#update-the-icons-and-splash-screen)
    - [Run Release Build on a Device](#run-release-build-on-a-device)
  - [Working with Supabase](#working-with-supabase)
  - [Working with Deno](#working-with-deno)
- [Hosting](#hosting)
- [Release](#release)

Every contribution to FeedDeck is welcome, whether it is reporting a bug,
submitting a fix, proposing new features or becoming a maintainer. To make
contributing to FeedDeck as easy as possible you will find more details for the
development flow in this documentation.

Please note we have a
[Code of Conduct](https://github.com/feeddeck/feeddeck/blob/main/CODE_OF_CONDUCT.md),
please follow it in all your interactions with the project.

## Feedback, Issues and Questions

If you encounter any issue or you have an idea to improve, please:

- Search through
  [existing open and closed GitHub Issues](https://github.com/feeddeck/feeddeck/issues)
  and [discussions](https://github.com/feeddeck/feeddeck/discussions) for the
  answer first. If you find a relevant topic, please comment on the issue.
- If none of the issues are relevant, please add an issue to
  [GitHub issues](https://github.com/feeddeck/feeddeck/issues) or start a new
  [discussions](https://github.com/feeddeck/feeddeck/discussions). Please use
  the issue templates and provide any relevant information.

If you encounter a security vulnerability, please do not open an issue and
instead send an email to
[admin@feeddeck.app](mailto:admin@feeddeck.app?subject=[GitHub]%20Security%20Vulnerability)
or report the security vulnerability via
[GitHub](https://github.com/feeddeck/feeddeck/security/advisories).

## Adding new Features

When contributing a complex change to the FeedDeck repository, please discuss
the change you wish to make within a Github issue with the owners of this
repository before making the change.

## Development

FeedDeck uses [Flutter](https://flutter.dev), [Supabase](https://supabase.com)
and [Deno](https://deno.com), make sure that you have the correct version
installed before starting development. You can use the following commands to
check your installed version:

```sh
$ flutter --version

Flutter 3.19.1 • channel stable • https://github.com/flutter/flutter.git
Framework • revision abb292a07e (5 days ago) • 2024-02-20 14:35:05 -0800
Engine • revision 04817c99c9
Tools • Dart 3.3.0 • DevTools 2.31.1

$ deno --version

deno 1.40.2 (release, aarch64-apple-darwin)
v8 12.1.285.6
typescript 5.3.3
```

### Working with Flutter

To run the app you can use the [`run.sh`](./app/run.sh) script, which will
automatically load the `.env` file from the Supabase project and passes the
required variables to the `flutter run` command:

```sh
./run.sh --device="chrome" --environment="local"
```

To run the tests the following command can be used:

```sh
flutter test
```

To check the test coverage the `--coverage` flag can be added to the command and
an HTML report can be generated:

```sh
flutter test --coverage

# To generate the HTML report lcov is required, which can be installed via Homebrew:
brew install lcov

genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

#### Sort all Imports

To sort all imports in the Dart code in a uniformly way you have to run the
`flutter pub run import_sorter:main` command.

#### Add a Custom Icon

If you have to add a custom icon to the Flutter app we are using
[https://www.fluttericon.com](https://www.fluttericon.com). The configuration
file for all existing icons can be found at
`app/templates/iconfont/config.json`.

When you add a new custom icon place the `.svg` file in the
`app/templates/iconfont` folder. Please also update the `config.json` file. The
content of the generated Dart class should be placed into the
`app/lib/utils/fd_icons.dart` file.

#### Update the Icons and Splash Screen

To update the icon for the app or the splash screens the following two commands
can be used:

```sh
flutter pub run flutter_launcher_icons:main
flutter pub run flutter_native_splash:create
```

The icons can be found in the `app/templates/app-icon` folder. The splash screen
icons can be found in the `app/templates/splash-screen` folder.

#### Run Release Build on a Device

To run the release build on a device for testing, we have to get the Device ID
first by running the following command:

```sh
$ flutter devices

3 connected devices:

Ricos iPad (mobile) • 00008027-0004785E0A31002E • ios            • iOS 16.2 20C65
macOS (desktop)     • macos                     • darwin-arm64   • macOS 13.1 22C65 darwin-arm
Chrome (web)        • chrome                    • web-javascript • Google Chrome 108.0.5359.124
```

Then we can use one of the listed devices and execute the following command to
build and run the app on this device:

```sh
flutter run --release --device-id=00008027-0004785E0A31002E --dart-define SUPABASE_URL=<SUPABASE_URL> --dart-define SUPABASE_ANON_KEY=<SUPABASE_ANON_KEY> --dart-define SUPABASE_SITE_URL=<SUPABASE_SITE_URL> --dart-define GOOGLE_CLIENT_ID=<GOOGLE_CLIENT_ID>
```

With the above command we can also savely quit the terminal process (by pressing
`q`) and continue testing on the device, while it is not connected to our
development machine.

### Working with Supabase

The Supabase CLI can be installed via Homebrew. For other platforms the install
instruction can be found in the
[Installing the Supabase CLI](https://supabase.com/docs/guides/cli/getting-started#installing-the-supabase-cli)
section in the Supabase documentation:

```sh
brew install supabase/tap/supabase
```

After the Supabase CLI is installed we can run Supabase locally by running the
following command in the root folder of the repository:

```sh
supabase start
```

This can take some time on your first run. Once it is finished the Supabase
Studio should be available at [localhost:54323](http://localhost:54323/).

After Supabase is running we can reset the local database and apply all the
migrations from the `supabase/migrations` directory by running the following
command:

```sh
supabase db reset
```

We are also using Supabase functions for some parts of the app (e.g. adding a
new source). Before we can run the function we have to create a
`supabase/.env.local` file. This file contains all the environment variables
needed by the functions. All the needed environment variables can be found in
the `supabase/.env.example` file.

Once the `supabase/.env.local` file is created, we can run the functions with
the `supabase functions` command:

```sh
supabase functions serve --no-verify-jwt --env-file supabase/.env.local
```

Some other usful commands during development are:

- `supabase migration new <MIGRATION-NAME>`: Create a new migration in the
  `supabase/migrations` folder.
- `supabase functions new <FUNCTION-NAME>`: Create a new function in the
  `supabase/functions` folder.

### Working with Deno

While we try to use Supabase for almost everything, we can not use it to fetch
the items for sources. For this we are using Deno (because it is already used
within the Supabase functions) and run them via Docker.

The Deno code can be found in the `supabase/functions/_cmd` folder so we can
share the code with the code for the Supabase functions. It contains two
components:

- `scheduler`: Fetch all sources which must be updated and write them to Redis.
- `worker`: Listen to all sources in Redis and fetch all items for the provided
  sources.

To run Redis, the `scheduler` and the `worker` we provide a Docker Compose file.
Before we can run it, we have to create `supabase/.env.local` file, which
contains all the environment variables for the `scheduler` and `worker`. All the
needed environment variables can be found in the `supabase/.env.example` file.

Once the `supabase/.env.local` file is created we can run Redis, the `scheduler`
and the `worker` via the following command:

```sh
cd supabase/functions/_cmd
docker-compose up --build
```

To build the Docker image, the following commands can be run:

```sh
docker build -f supabase/functions/_cmd/Dockerfile -t ghcr.io/feeddeck/feeddeck:dev supabase/functions

# To build the Docker image for another platform use the following:
docker buildx build --platform linux/amd64 -f supabase/functions/_cmd/Dockerfile -t ghcr.io/feeddeck/feeddeck:dev supabase/functions

# The Docker image can then be used to run the scheduler, worker or tools, e.g.
docker run ghcr.io/feeddeck/feeddeck:dev tools get-feed '{"type": "reddit", "options": {"reddit": "/r/kubernetes"}}'
```

To run the tests for our code, the following command can be used:

```sh
deno test --allow-env --import-map=supabase/functions/import_map.json supabase/functions
```

To check the test coverage the `--coverage` flag can be added to the command and
an HTML report can be generated:

```sh
deno test --allow-env --import-map=supabase/functions/import_map.json supabase/functions --coverage=coverage_deno

# To generate the HTML report lcov is required, which can be installed via Homebrew:
brew install lcov

deno coverage coverage_deno --lcov --output=coverage_deno/coverage_deno.lcov
genhtml -o coverage_deno/html coverage_deno/coverage_deno.lcov
open coverage_deno/html/index.html
```

## Hosting

FeedDeck uses Supabase as backend. For Supabase we can use
[Supabase Cloud](https://supabase.com/dashboard) or their
[Self-Hosting](https://supabase.com/docs/guides/self-hosting) offer.

Once we have a running Supabase instance, we can apply all our database
migrations, set the secrets and deploy our functions:

```sh
# Link your local development project to a hosted Supabase project
supabase link --project-ref <PROJECT-ID>

# Push all local migrations to a remote database
supabase db push

# Push all the secrets from the .env file to our remote project and list all secrets afterwards
supabase secrets set --env-file supabase/.env
supabase secrets list

# Deploy all functions
supabase functions deploy add-or-update-source-v1 --project-ref <PROJECT-ID> --import-map supabase/functions/import_map.json
supabase functions deploy add-source-v1 --project-ref <PROJECT-ID> --import-map supabase/functions/import_map.json
supabase functions deploy delete-user-v1 --project-ref <PROJECT-ID> --import-map supabase/functions/import_map.json
supabase functions deploy generate-magic-link-v1 --project-ref <PROJECT-ID> --import-map supabase/functions/import_map.json
supabase functions deploy image-proxy-v1 --no-verify-jwt --project-ref <PROJECT-ID> --import-map supabase/functions/import_map.json
supabase functions deploy profile-v1 --project-ref <PROJECT-ID> --import-map supabase/functions/import_map.json
supabase functions deploy profile-v2 --project-ref <PROJECT-ID> --import-map supabase/functions/import_map.json
supabase functions deploy revenuecat-webhooks-v1 --no-verify-jwt --project-ref <PROJECT-ID> --import-map supabase/functions/import_map.json
supabase functions deploy stripe-create-billing-portal-link-v1 --project-ref <PROJECT-ID> --import-map supabase/functions/import_map.json
supabase functions deploy stripe-create-checkout-session-v1 --project-ref <PROJECT-ID> --import-map supabase/functions/import_map.json
supabase functions deploy stripe-webhooks-v1 --no-verify-jwt --project-ref <PROJECT-ID> --import-map supabase/functions/import_map.json
```

Now we have to do some manual steps to finish the setup of our Supabase project:

1. Select the [`settings`](https://supabase.com/dashboard/project/_/editor)
   table and provide the values for the `supabase_service_role_key` and
   `supabase_api_url` rows (**Note**: For local development the
   `supabase_api_url` must be `http://supabase_kong_feeddeck:8000`). These
   values are needed for the clean up of media files saved in the Supabase
   storage. The media files are deleted when the corresponding item / source is
   deleted and via a cron job.
2. Go to
   [url configuration](https://supabase.com/dashboard/project/_/auth/url-configuration)
   in the authentication section and set the site url, e.g.
   `https://app.feeddeck.app`.
3. On the same
   [page](https://supabase.com/dashboard/project/_/auth/url-configuration) you
   also have to add the following redirect urls:
   - `<SITE-URL>`, e.g. `https://app.feeddeck.app`
   - `<SITE-URL>/reset-password`, e.g. `https://app.feeddeck.app/reset-password`
   - `http://localhost:*/auth`
   - `app.feeddeck.feeddeck://signin-callback/`
4. Add your
   [email templates](https://supabase.com/dashboard/project/_/auth/templates).
5. Enable and configure all
   [auth providers](https://supabase.com/dashboard/project/_/auth/providers):
   - Enable the email provider
   - _(Optional)_ Enable the Apple provider (the documentation can be found in
     the
     [Login with Apple](https://supabase.com/docs/guides/auth/social-login/auth-apple)
     section) and provide the following values:
     - Service ID, e.g. `app.feeddeck.signin`
     - Service Key
     - Authorized Client IDs, e.g. `app.feeddeck.feeddeck`
   - _(Optional)_ Enable the Google provider (the documentation can be found in
     the
     [Login with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
     section) and provide the following values:
     - Client ID
     - Client Secret
     - Authorized Client IDs, e.g. `app.feeddeck.feeddeck`
6. _(Optional)_ Enable custom SMTP in the
   [auth section](https://supabase.com/dashboard/project/_/settings/auth) on the
   settings page.
7. _(Optional)_ Configure Stripe by adding a webhook endpoint. The endpoint url
   should look as follows:
   `https://<PROJECT-ID>.supabase.co/functions/v1/stripe-webhooks-v1`. Once the
   endpoint is configured the `customer.subscription.created`,
   `customer.subscription.deleted` and `checkout.session.completed` event types
   must be added.

Now that we have finished the setup for our Supabase project we have to run the
`scheduler`, `worker` and Redis. The `scheduler` and `worker` can be run via the
`ghcr.io/feeddeck/feeddeck` Docker image. You can create a similar Docker
Compose file as we are providing for the development to run the `scheduler`,
`worker` and Redis. The Docker Compose file can be found here:
[docker-compose.yaml](supabase/functions/_cmd/docker-compose.yaml).

You can use the official clients for mobile clients for iOS and Android and
desktop clients for macOS, Windows and Linux with your self hosted instance of
FeedDeck. To configure the clients double tap on the FeedDeck logo on the sign
in page and provide your **Supabase Url**, **Supabase Anon Key** and **Supabase
Site Url**. After you have saved the values restart the app.

The web version of FeedDeck must be build by your own. Please have a look at the
[release](#release) section to see how to build the web version. In the release
section you also find the instructions to build your own native clients for iOS,
Android, macOS, Windows and Linux if you do not want to use the official ones.

## Release

1. Ensure that all secrets are updated in the Supabase project:

   ```sh
   supabase link --project-ref <PROJECT-ID>
   supabase secrets set --env-file supabase/.env.prod
   supabase secrets list
   ```

2. Update the `version` key and the `msix_config.msix_version` key in the
   `pubspec.yaml` file.

3. Add the new release to the `releases` section in
   [`app.feeddeck.feeddeck.metainfo.xml`](app/linux/flatpak/app.feeddeck.feeddeck.metainfo.xml).

4. Delete the `build/` and `.dart_tool/` directories via the `flutter clean`
   command.

5. Build the app for Web by running `flutter build web`. The build can be found
   at `app/build/web` and must be uploaded to your hosting provider.

6. Build the app for Linux by running `flutter build linux --release`. Update
   the `app.feeddeck.feeddeck.yml` file at
   [github.com/flathub/app.feeddeck.feeddeck](https://github.com/flathub/app.feeddeck.feeddeck)
   with the new release.

7. Build the app for macOS by running `flutter build macos --release`. Open
   Xcode and select **Product** > **Archive** to create and open the archive.
   After that the **Validate App** and **Distribute App** options can be used to
   upload the build to
   [https://appstoreconnect.apple.com](https://appstoreconnect.apple.com).

8. Build the app for Windows by running `flutter build windows --release`. and
   `flutter pub run msix:create --output-path build --output-name feeddeck`. The
   build can be found at `app/build/feeddeck.msix` and must be uploaded to
   [https://partner.microsoft.com/en-us/dashboard/products/9NPHPGRRCT5H/overview](https://partner.microsoft.com/en-us/dashboard/products/9NPHPGRRCT5H/overview).

9. Create a file `app/android/key.properties` with the following content:

   ```plain
   storePassword=
   keyPassword=
   keyAlias=upload
   storeFile=
   ```

10. Build the app for Android by running `flutter build appbundle`. The build
    can be found at `app/build/app/outputs/bundle/release/app-release.aab` and
    must be uploaded to
    [https://play.google.com/apps/publish](https://play.google.com/apps/publish).

11. Build the app for iOS by running `flutter build ipa`. The build can be found
    at `app/build/ios/archive/Runner.xcarchive` and must be opened in Xcode. In
    Xcode the **Validate App** and **Distribute App** options can be used to
    upload the build to
    [https://appstoreconnect.apple.com](https://appstoreconnect.apple.com).
