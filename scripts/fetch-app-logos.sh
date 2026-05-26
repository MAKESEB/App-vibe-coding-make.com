#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -f "${ROOT_DIR}/.env.local" ]]; then
  while IFS='=' read -r env_key env_value; do
    [[ -z "${env_key}" || "${env_key}" == \#* ]] && continue
    case "${env_key}" in
      LOGO_DEV_TOKEN)
        if [[ -z "${!env_key:-}" ]]; then
          export "${env_key}=${env_value}"
        fi
        ;;
    esac
  done < "${ROOT_DIR}/.env.local"
fi

if [[ -z "${LOGO_DEV_TOKEN:-}" ]]; then
  echo "LOGO_DEV_TOKEN is required to fetch brand logos from img.logo.dev." >&2
  echo "Add LOGO_DEV_TOKEN=... to .env.local or export it for this command." >&2
  exit 1
fi

app_domain() {
  ruby -rjson -ruri -e '
    data = JSON.parse(File.read(ARGV[0]))
    raw = data["url"].to_s
    raw = "https://#{raw}" unless raw.include?("://")
    host = URI(raw).host.to_s.downcase.sub(/^www\./, "")
    print(host)
  ' "$1"
}

curl_logo_dev_to_file() {
  local url="$1"
  local output="$2"
  local curl_config
  curl_config="$(mktemp)"
  {
    printf 'url = "%s"\n' "${url}"
    printf 'output = "%s"\n' "${output}"
    printf 'user-agent = "Mozilla/5.0"\n'
    printf 'fail\n'
    printf 'silent\n'
    printf 'show-error\n'
    printf 'location\n'
    printf 'retry = 2\n'
  } > "${curl_config}"
  curl --config "${curl_config}"
  rm -f "${curl_config}"
}

fetch_logo() {
  local app_slug="$1"
  local app_dir="${ROOT_DIR}/apps/${app_slug}"
  local app_meta="${app_dir}/metadata.json"
  local icon_path="${app_dir}/assets/icon.png"

  if [[ ! -f "${app_meta}" ]]; then
    echo "SKIP ${app_slug}: missing metadata.json" >&2
    return 0
  fi

  local domain raw tmp_png
  domain="$(app_domain "${app_meta}")"
  if [[ -z "${domain}" ]]; then
    echo "FAIL ${app_slug}: cannot derive logo domain from metadata url" >&2
    return 1
  fi

  mkdir -p "${app_dir}/assets" "${ROOT_DIR}/tmp/logo-dev-downloads"
  raw="${ROOT_DIR}/tmp/logo-dev-downloads/${app_slug}.raw"
  tmp_png="${ROOT_DIR}/tmp/logo-dev-downloads/${app_slug}.512.png"

  echo "${app_slug}: fetching https://img.logo.dev/${domain}"
  curl_logo_dev_to_file \
    "https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=512&format=png" \
    "${raw}"
  sips -s format png -z 512 512 "${raw}" --out "${tmp_png}" >/dev/null
  cp "${tmp_png}" "${icon_path}"

  if ! file "${icon_path}" | grep -q 'PNG image data, 512 x 512'; then
    echo "FAIL ${app_slug}: fetched logo is not a 512x512 PNG" >&2
    file "${icon_path}" >&2 || true
    return 1
  fi

  echo "LOGO_RESULT slug=${app_slug} domain=${domain} icon=${icon_path#${ROOT_DIR}/} status=downloaded_verified_512x512"
}

if [[ $# -gt 0 ]]; then
  app_slugs=("$@")
elif [[ -n "${APP_LIST:-}" ]]; then
  # shellcheck disable=SC2206
  app_slugs=(${APP_LIST//,/ })
else
  app_slugs=()
  while IFS= read -r app_slug; do
    app_slugs+=("${app_slug}")
  done < <(find "${ROOT_DIR}/apps" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort)
fi

for app_slug in "${app_slugs[@]}"; do
  fetch_logo "${app_slug}"
done
