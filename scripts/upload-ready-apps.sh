#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -f "${ROOT_DIR}/.env.local" ]]; then
  while IFS='=' read -r env_key env_value; do
    [[ -z "${env_key}" || "${env_key}" == \#* ]] && continue
    case "${env_key}" in
      MAKE_API_KEY|MAKE_ZONE|LOGO_DEV_TOKEN|MAKE_APPS_SDK_VERSION|UPLOAD_ICONS)
        if [[ -z "${!env_key:-}" ]]; then
          export "${env_key}=${env_value}"
        fi
        ;;
    esac
  done < "${ROOT_DIR}/.env.local"
fi

if [[ -z "${MAKE_API_KEY:-}" || -z "${MAKE_ZONE:-}" ]]; then
  echo "MAKE_API_KEY and MAKE_ZONE are required. Put them in .env.local or export them." >&2
  exit 1
fi

make_cli() {
  if command -v make-cli >/dev/null 2>&1; then
    make-cli "$@"
  else
    npx -y @makehq/cli "$@"
  fi
}

json_compact() {
  ruby -rjson -e 'puts JSON.generate(JSON.parse(File.read(ARGV[0])))' "$1"
}

metadata_value() {
  ruby -rjson -e 'data = JSON.parse(File.read(ARGV[0])); value = data[ARGV[1]]; exit(2) if value.nil?; print(value)' "$1" "$2"
}

metadata_value_default() {
  ruby -rjson -e 'data = JSON.parse(File.read(ARGV[0])); value = data[ARGV[1]]; value = ARGV[2] if value.nil? || value == ""; print(value)' "$1" "$2" "$3"
}

validate_make_zone() {
  local zone="$1"
  case "${zone}" in
    *[!A-Za-z0-9.-]*|.*|*-|*..*|*/*|http:*|https:*)
      echo "Invalid MAKE_ZONE: ${zone}" >&2
      return 1
      ;;
  esac
  if [[ "${zone}" != *.make.com ]]; then
    echo "Invalid MAKE_ZONE: ${zone}; expected a make.com zone hostname" >&2
    return 1
  fi
}

make_auth_curl_config() {
  local content_type="${1:-application/json}"
  local curl_config
  curl_config="$(mktemp)"
  {
    printf 'header = "Authorization: Token %s"\n' "${MAKE_API_KEY}"
    printf 'header = "Content-Type: %s"\n' "${content_type}"
  } > "${curl_config}"
  printf '%s' "${curl_config}"
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

api_request() {
  local method="$1"
  local path="$2"
  local body="${3:-}"
  local curl_config

  validate_make_zone "${MAKE_ZONE}"
  curl_config="$(make_auth_curl_config application/json)"

  if [[ -n "${body}" ]]; then
    set +e
    curl -fsS --config "${curl_config}" -X "${method}" "https://${MAKE_ZONE}/api/v2${path}" \
      --data "${body}"
    local curl_status=$?
    set -e
  else
    set +e
    curl -fsS --config "${curl_config}" -X "${method}" "https://${MAKE_ZONE}/api/v2${path}"
    local curl_status=$?
    set -e
  fi
  rm -f "${curl_config}"
  return "${curl_status}"
}

extract_app_name() {
  APP_PREFIX="$1" APP_LABEL_ENV="$2" APP_DESCRIPTION_ENV="$3" ruby -rjson -e '
    items = Array(JSON.parse(STDIN.read))
    matches = items.select do |item|
      name = item["name"].to_s
      label = item["label"].to_s
      description = item["description"].to_s
      name == ENV["APP_PREFIX"] ||
        name.start_with?(ENV["APP_PREFIX"] + "-") ||
        (label == ENV["APP_LABEL_ENV"] && description == ENV["APP_DESCRIPTION_ENV"])
    end
    match = matches.find { |item| item["name"].to_s == ENV["APP_PREFIX"] } || matches.first
    print(match && match["name"].to_s)
  '
}

extract_created_app_name() {
  ruby -rjson -e '
    data = JSON.parse(STDIN.read)
    print(data.dig("app", "name") || data["name"] || "")
  '
}

extract_connection_name() {
  TARGET_LABEL="$1" ruby -rjson -e '
    data = JSON.parse(STDIN.read)
    items =
      case data
      when Array then data
      when Hash then
        data["appConnections"] ||
        Array(data["appConnection"]).compact ||
        data["connections"] ||
        data["items"] ||
        data["data"] ||
        []
      else []
      end
    items = Array(items)
    match = items.find { |item| item["label"].to_s == ENV["TARGET_LABEL"] } || items.first
    print(match && (match["name"] || match["id"] || ""))
  '
}

normalize_connection_type() {
  case "$1" in
    api-key|apikey) echo "apikey" ;;
    oauth|oauth-refresh|basic|other) echo "$1" ;;
    *) echo "$1" ;;
  esac
}

app_domain() {
  ruby -rjson -ruri -e '
    data = JSON.parse(File.read(ARGV[0]))
    raw = data["url"].to_s
    raw = "https://#{raw}" unless raw.include?("://")
    host = URI(raw).host.to_s.downcase.sub(/^www\./, "")
    print(host)
  ' "$1"
}

ensure_icon_512() {
  local app_slug="$1"
  local app_dir="$2"
  local app_meta="$3"
  local icon_path="${app_dir}/assets/icon.png"

  if [[ -f "${icon_path}" ]] && file "${icon_path}" | grep -q 'PNG image data, 512 x 512'; then
    return 0
  fi

  mkdir -p "${app_dir}/assets" "${ROOT_DIR}/tmp/logo-dev-downloads"

  if [[ -n "${LOGO_DEV_TOKEN:-}" ]]; then
    local domain raw tmp_png
    domain="$(app_domain "${app_meta}")"
    if [[ -z "${domain}" ]]; then
      echo "FAIL ${app_slug}: cannot derive logo domain from metadata url" >&2
      return 1
    fi
    raw="${ROOT_DIR}/tmp/logo-dev-downloads/${app_slug}.raw"
    tmp_png="${ROOT_DIR}/tmp/logo-dev-downloads/${app_slug}.512.png"
    echo "${app_slug}: fetching 512x512 logo from img.logo.dev/${domain}"
    curl_logo_dev_to_file \
      "https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=512&format=png" \
      "${raw}"
    sips -s format png -z 512 512 "${raw}" --out "${tmp_png}" >/dev/null
    cp "${tmp_png}" "${icon_path}"
  elif [[ -f "${icon_path}" ]]; then
    echo "${app_slug}: resizing existing local icon to 512x512 (set LOGO_DEV_TOKEN to fetch brand logo)"
    sips -s format png -z 512 512 "${icon_path}" --out "${icon_path}" >/dev/null
  else
    echo "FAIL ${app_slug}: no icon found and LOGO_DEV_TOKEN is not set" >&2
    return 1
  fi

  if ! file "${icon_path}" | grep -q 'PNG image data, 512 x 512'; then
    echo "FAIL ${app_slug}: icon is not a 512x512 PNG after normalization" >&2
    file "${icon_path}" >&2 || true
    return 1
  fi
}

upload_app_icon() {
  local app_slug="$1"
  local app_dir="$2"
  local remote_app_name="$3"
  local app_version="$4"
  local icon_path="${app_dir}/assets/icon.png"
  local sdk_version="${MAKE_APPS_SDK_VERSION:-2.5.0}"
  local upload_url="https://${MAKE_ZONE}/api/v2/sdk/apps/${remote_app_name}/${app_version}/icon"
  local readback_url="https://${MAKE_ZONE}/api/v2/sdk/apps/${remote_app_name}/${app_version}/icon/512"

  if [[ "${UPLOAD_ICONS:-1}" == "0" ]]; then
    echo "${app_slug}: skipping icon upload because UPLOAD_ICONS=0"
    ICON_STATUS="skipped"
    return 0
  fi

  if ! file "${icon_path}" | grep -q 'PNG image data, 512 x 512'; then
    echo "FAIL ${app_slug}: cannot upload non-512x512 PNG icon" >&2
    file "${icon_path}" >&2 || true
    return 1
  fi

  if make_cli sdk-apps set-icon --help >/dev/null 2>&1; then
    echo "${app_slug}: uploading 512x512 app icon via make-cli"
    make_cli sdk-apps set-icon "${remote_app_name}" "${app_version}" "${icon_path}" >/dev/null
    local cli_readback
    cli_readback="$(mktemp)"
    make_cli sdk-apps get-icon "${remote_app_name}" "${app_version}" "${cli_readback}" >/dev/null
    if ! file "${cli_readback}" | grep -q 'PNG image data, 512 x 512'; then
      echo "FAIL ${app_slug}: make-cli icon readback was not a 512x512 PNG" >&2
      file "${cli_readback}" >&2 || true
      rm -f "${cli_readback}"
      return 1
    fi
    rm -f "${cli_readback}"
    ICON_STATUS="uploaded_verified"
    return 0
  fi

  echo "${app_slug}: uploading 512x512 app icon via raw SDK endpoint"
  local upload_body upload_code readback_file readback_code readback_type curl_config
  curl_config="$(make_auth_curl_config image/png)"
  upload_body="$(mktemp)"
  upload_code="$(curl -sS --config "${curl_config}" -o "${upload_body}" -w '%{http_code}' -X PUT "${upload_url}" \
    -H "imt-apps-sdk-version: ${sdk_version}" \
    --data-binary "@${icon_path}" || true)"
  rm -f "${curl_config}"

  if [[ "${upload_code}" != "200" && "${upload_code}" != "204" ]]; then
    echo "FAIL ${app_slug}: icon upload returned HTTP ${upload_code}: $(tr -d '\n' < "${upload_body}" | cut -c1-300)" >&2
    rm -f "${upload_body}"
    return 1
  fi
  rm -f "${upload_body}"

  readback_file="$(mktemp)"
  curl_config="$(make_auth_curl_config image/png)"
  readback_code="$(curl -sS -L --config "${curl_config}" -o "${readback_file}" -w '%{http_code}' "${readback_url}" \
    -H "imt-apps-sdk-version: ${sdk_version}" || true)"
  rm -f "${curl_config}"
  readback_type="$(file "${readback_file}")"
  rm -f "${readback_file}"

  if [[ "${readback_code}" != "200" || "${readback_type}" != *'PNG image data, 512 x 512'* ]]; then
    echo "FAIL ${app_slug}: icon readback failed HTTP ${readback_code}; ${readback_type}" >&2
    return 1
  fi
  ICON_STATUS="uploaded_verified"
}

validate_app_layout() {
  local app_dir="$1"
  [[ -f "${app_dir}/metadata.json" ]] || return 1
  [[ -f "${app_dir}/base.imljson" ]] || return 1
  [[ -f "${app_dir}/readme.md" ]] || return 1
  [[ -d "${app_dir}/connections" ]] || return 1
  [[ -d "${app_dir}/modules" ]] || return 1
  [[ -n "$(find "${app_dir}/connections" -mindepth 2 -maxdepth 2 -name metadata.json -print -quit)" ]] || return 1
  [[ -n "$(find "${app_dir}/modules" -mindepth 2 -maxdepth 2 -name metadata.json -print -quit)" ]] || return 1
}

upload_app() {
  local app_slug="$1"
  local app_dir="${ROOT_DIR}/apps/${app_slug}"
  local app_meta="${app_dir}/metadata.json"

  validate_app_layout "${app_dir}" || {
    echo "SKIP ${app_slug}: incomplete app layout"
    return 0
  }
  ensure_icon_512 "${app_slug}" "${app_dir}" "${app_meta}"

  local app_name app_label app_description app_theme app_language app_audience app_version
  app_name="$(metadata_value "${app_meta}" name)"
  app_label="$(metadata_value "${app_meta}" label)"
  app_description="$(metadata_value "${app_meta}" description)"
  app_theme="$(metadata_value_default "${app_meta}" theme "#54ACD2")"
  app_language="$(metadata_value_default "${app_meta}" language "en")"
  app_audience="$(metadata_value_default "${app_meta}" audience "global")"
  app_version="$(metadata_value_default "${app_meta}" version "1")"

  echo "=== ${app_slug}: ensuring remote app ${app_name} ==="
  local apps_json remote_app_name create_json
  apps_json="$(make_cli sdk-apps list --output=json)"
  remote_app_name="$(printf '%s' "${apps_json}" | extract_app_name "${app_name}" "${app_label}" "${app_description}")"

  if [[ -z "${remote_app_name}" ]]; then
    create_json="$(make_cli sdk-apps create \
      --name="${app_name}" \
      --label="${app_label}" \
      --description="${app_description}" \
      --theme="${app_theme}" \
      --language="${app_language}" \
      --audience="${app_audience}" \
      --private)"
    remote_app_name="$(printf '%s' "${create_json}" | extract_created_app_name)"
  fi

  if [[ -z "${remote_app_name}" ]]; then
    apps_json="$(make_cli sdk-apps list --output=json)"
    remote_app_name="$(printf '%s' "${apps_json}" | extract_app_name "${app_name}" "${app_label}" "${app_description}")"
  fi

  if [[ -z "${remote_app_name}" ]]; then
    echo "FAIL ${app_slug}: could not determine remote app name" >&2
    return 1
  fi

  echo "${app_slug}: uploading base and docs"
  make_cli sdk-apps set-section \
    --name="${remote_app_name}" \
    --version="${app_version}" \
    --section=base \
    --body="$(json_compact "${app_dir}/base.imljson")" >/dev/null

  make_cli sdk-apps set-docs \
    --name="${remote_app_name}" \
    --version="${app_version}" \
    --docs="$(cat "${app_dir}/readme.md")" >/dev/null

  local connection_meta connection_dir connection_label connection_type connections_json connection_name
  connection_meta="$(find "${app_dir}/connections" -mindepth 2 -maxdepth 2 -name metadata.json | sort | head -n 1)"
  connection_dir="$(dirname "${connection_meta}")"
  connection_label="$(metadata_value "${connection_meta}" label)"
  connection_type="$(normalize_connection_type "$(metadata_value "${connection_meta}" type)")"

  echo "${app_slug}: ensuring ${connection_type} connection"
  connections_json="$(api_request GET "/sdk/apps/${remote_app_name}/connections")"
  connection_name="$(printf '%s' "${connections_json}" | extract_connection_name "${connection_label}")"

  if [[ -z "${connection_name}" ]]; then
    api_request POST "/sdk/apps/${remote_app_name}/connections" "$(ruby -rjson -e 'puts JSON.generate({label: ARGV[0], type: ARGV[1]})' "${connection_label}" "${connection_type}")" >/dev/null
    connections_json="$(api_request GET "/sdk/apps/${remote_app_name}/connections")"
    connection_name="$(printf '%s' "${connections_json}" | extract_connection_name "${connection_label}")"
  fi

  if [[ -z "${connection_name}" ]]; then
    echo "FAIL ${app_slug}: could not determine remote connection name" >&2
    return 1
  fi

  echo "${app_slug}: uploading connection sections for ${connection_name}"
  api_request PUT "/sdk/apps/connections/${connection_name}/api" "$(json_compact "${connection_dir}/api.imljson")" >/dev/null
  api_request PUT "/sdk/apps/connections/${connection_name}/parameters" "$(json_compact "${connection_dir}/parameters.imljson")" >/dev/null

  local module_count=0
  while IFS= read -r module_meta; do
    local module_dir module_name module_label module_description module_type_id
    module_dir="$(dirname "${module_meta}")"
    module_name="$(metadata_value "${module_meta}" name)"
    module_label="$(metadata_value "${module_meta}" label)"
    module_description="$(metadata_value "${module_meta}" description)"
    module_type_id="$(metadata_value_default "${module_meta}" typeId "12")"

    echo "${app_slug}: ensuring module ${module_name}"
    if ! make_cli sdk-modules get \
      --app-name="${remote_app_name}" \
      --app-version="${app_version}" \
      --module-name="${module_name}" >/dev/null 2>&1; then
      make_cli sdk-modules create \
        --app-name="${remote_app_name}" \
        --app-version="${app_version}" \
        --name="${module_name}" \
        --type-id="${module_type_id}" \
        --label="${module_label}" \
        --description="${module_description}" \
        --module-init-mode=blank >/dev/null
    fi

    make_cli sdk-modules update \
      --app-name="${remote_app_name}" \
      --app-version="${app_version}" \
      --module-name="${module_name}" \
      --label="${module_label}" \
      --description="${module_description}" \
      --connection="${connection_name}" >/dev/null

    for section in api expect interface samples; do
      local section_file="${module_dir}/${section}.imljson"
      if [[ -f "${section_file}" ]]; then
        make_cli sdk-modules set-section \
          --app-name="${remote_app_name}" \
          --app-version="${app_version}" \
          --module-name="${module_name}" \
          --section="${section}" \
          --body="$(json_compact "${section_file}")" >/dev/null
      fi
    done
    module_count=$((module_count + 1))
  done < <(find "${app_dir}/modules" -mindepth 2 -maxdepth 2 -name metadata.json | sort)

  ICON_STATUS="pending"
  upload_app_icon "${app_slug}" "${app_dir}" "${remote_app_name}" "${app_version}"

  echo "APP_RESULT slug=${app_slug} remote_app=${remote_app_name} connection=${connection_name} modules=${module_count} icon=${ICON_STATUS}"
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

echo "Checking Make authentication..."
make_cli whoami >/dev/null

echo "Using Make zone: ${MAKE_ZONE}"
for app_slug in "${app_slugs[@]}"; do
  upload_app "${app_slug}"
done
