#!/usr/bin/env bash

if [[ "$#" -lt 1 ]]; then
  echo "$(basename "$0") -- program to run the app

where:
    -e|--environment set the environment on which the app should be run, e.g. -e=local
    -d|--device set the device on which the app should be run, e.g. -d=chrome"
  exit
fi

for arg in "$@"
do
  case ${arg} in
    -e=*|--environment=*)
    environment="${arg#*=}"
    shift
    ;;
    -d=*|--device=*)
    device="${arg#*=}"
    shift
    ;;
    *)
    ;;
  esac
done

if [ -z "${environment}" ] || [ -z "${device}" ]; then
  echo "You have to provide an environment and a device"
  echo "Example: $0 -e=local -d=chrome"
  exit 1
fi

# Load the environment variables from the corresponding ".env" file in the
# "supabase" directory.
set -o allexport && source "../supabase/.env.${environment}" && set +o allexport

# When the local environment is used, we have to adjust the Supabase URL to the
# local Supabase instance, since the environment variable set by the .env file
# uses the Docker address of the Supabase instance.
supabase_url=$FEEDDECK_SUPABASE_URL
if [ "${environment}" == "local" ]; then
  supabase_url="http://localhost:54321"
fi

# If the selected device is "chrome" we have to add some additional flags to the
# "flutter run" command, since we want to run the app always on the same port
# and we want to disable the web security.
additional_flags=""
if [ "${device}" == "chrome" ]; then
  additional_flags="--web-port 3000 --web-browser-flag=--disable-web-security"
fi

# Run the app on the provided device and environment.
flutter run -d ${device} ${additional_flags} --dart-define SUPABASE_URL=${supabase_url} --dart-define SUPABASE_ANON_KEY=${FEEDDECK_SUPABASE_ANON_KEY} --dart-define SUPABASE_SITE_URL=${FEEDDECK_SUPABASE_SITE_URL} --dart-define GOOGLE_CLIENT_ID=${FEEDDECK_GOOGLE_CLIENT_ID}
