#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROGRESS_JSON="${ROOT_DIR}/generated/make-upload-progress.json"
SDK_VERSION="${MAKE_APPS_SDK_VERSION:-2.5.0}"

if [[ -f "${ROOT_DIR}/.env.local" ]]; then
  while IFS='=' read -r env_key env_value; do
    [[ -z "${env_key}" || "${env_key}" == \#* ]] && continue
    case "${env_key}" in
      MAKE_API_KEY|MAKE_ZONE)
        if [[ -z "${!env_key:-}" ]]; then
          export "${env_key}=${env_value}"
        fi
        ;;
    esac
  done < "${ROOT_DIR}/.env.local"
fi

if [[ -z "${MAKE_API_KEY:-}" ]]; then
  echo "MAKE_API_KEY is required. Put it in .env.local or export it." >&2
  exit 1
fi

if [[ ! -f "${PROGRESS_JSON}" ]]; then
  echo "Progress JSON not found: ${PROGRESS_JSON}" >&2
  exit 1
fi

validate_make_zone() {
  local zone="$1"
  case "${zone}" in
    *[!A-Za-z0-9.-]*|.*|*-|*..*|*/*|http:*|https:*)
      echo "Invalid Make zone in progress JSON: ${zone}" >&2
      return 1
      ;;
  esac
  if [[ "${zone}" != *.make.com ]]; then
    echo "Invalid Make zone in progress JSON: ${zone}; expected a make.com zone hostname" >&2
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


make_cli() {
  if command -v make-cli >/dev/null 2>&1; then
    make-cli "$@"
  else
    npx -y @makehq/cli "$@"
  fi
}

app_list_json() {
  python3 - "$PROGRESS_JSON" "$@" <<'PY'
import json, sys
from pathlib import Path
progress = json.loads(Path(sys.argv[1]).read_text())
requested = sys.argv[2:]
apps = progress.get('apps', {})
if requested:
    slugs = requested
else:
    slugs = sorted(apps)
for slug in slugs:
    if slug not in apps:
        raise SystemExit(f"Unknown app slug in progress JSON: {slug}")
    rec = apps[slug]
    print(json.dumps({
        'slug': slug,
        'zone': rec['zone'],
        'remoteAppName': rec['remoteAppName'],
        'version': rec.get('version', 1),
        'iconPath': (rec.get('logo') or {}).get('iconPath') or f"{rec['localPath']}/assets/icon.png",
    }))
PY
}

upload_one() {
  local slug="$1"
  local zone="$2"
  local remote_app="$3"
  local version="$4"
  local icon_path="$5"
  local abs_icon="${ROOT_DIR}/${icon_path}"

  if [[ ! -f "${abs_icon}" ]]; then
    echo "FAIL ${slug}: icon not found at ${icon_path}" >&2
    return 1
  fi

  validate_make_zone "${zone}"

  if ! file "${abs_icon}" | grep -q 'PNG image data, 512 x 512'; then
    echo "FAIL ${slug}: icon is not a 512x512 PNG: ${icon_path}" >&2
    file "${abs_icon}" >&2 || true
    return 1
  fi

  local upload_url="https://${zone}/api/v2/sdk/apps/${remote_app}/${version}/icon"
  local readback_url="https://${zone}/api/v2/sdk/apps/${remote_app}/${version}/icon/512"

  echo "=== ${slug}: uploading icon to ${remote_app} (${zone}) ==="
  if MAKE_ZONE="${zone}" make_cli sdk-apps set-icon --help >/dev/null 2>&1; then
    MAKE_ZONE="${zone}" make_cli sdk-apps set-icon "${remote_app}" "${version}" "${abs_icon}" >/dev/null
    local cli_readback
    cli_readback="$(mktemp)"
    MAKE_ZONE="${zone}" make_cli sdk-apps get-icon "${remote_app}" "${version}" "${cli_readback}" >/dev/null
    if ! file "${cli_readback}" | grep -q 'PNG image data, 512 x 512'; then
      echo "FAIL ${slug}: make-cli icon readback was not a 512x512 PNG" >&2
      file "${cli_readback}" >&2 || true
      rm -f "${cli_readback}"
      return 1
    fi
    rm -f "${cli_readback}"
    echo "ICON_RESULT slug=${slug} remote_app=${remote_app} zone=${zone} status=uploaded_verified"
    return 0
  fi

  local upload_body upload_code
  local curl_config
  curl_config="$(make_auth_curl_config image/png)"
  upload_body="$(mktemp)"
  upload_code="$(curl -sS --config "${curl_config}" -o "${upload_body}" -w '%{http_code}' -X PUT "${upload_url}" \
    -H "imt-apps-sdk-version: ${SDK_VERSION}" \
    --data-binary "@${abs_icon}" || true)"
  rm -f "${curl_config}"

  if [[ "${upload_code}" != "200" && "${upload_code}" != "204" ]]; then
    echo "FAIL ${slug}: icon upload returned HTTP ${upload_code}: $(tr -d '\n' < "${upload_body}" | cut -c1-300)" >&2
    rm -f "${upload_body}"
    return 1
  fi
  rm -f "${upload_body}"

  local readback_file readback_code readback_type
  readback_file="$(mktemp)"
  curl_config="$(make_auth_curl_config image/png)"
  readback_code="$(curl -sS -L --config "${curl_config}" -o "${readback_file}" -w '%{http_code}' "${readback_url}" \
    -H "imt-apps-sdk-version: ${SDK_VERSION}" || true)"
  rm -f "${curl_config}"
  readback_type="$(file "${readback_file}")"
  rm -f "${readback_file}"

  if [[ "${readback_code}" != "200" || "${readback_type}" != *'PNG image data, 512 x 512'* ]]; then
    echo "FAIL ${slug}: readback failed HTTP ${readback_code}; ${readback_type}" >&2
    return 1
  fi

  echo "ICON_RESULT slug=${slug} remote_app=${remote_app} zone=${zone} status=uploaded_verified"
}

while IFS= read -r app_json; do
  slug="$(python3 -c 'import json,sys; print(json.loads(sys.argv[1])["slug"])' "${app_json}")"
  zone="$(python3 -c 'import json,sys; print(json.loads(sys.argv[1])["zone"])' "${app_json}")"
  remote_app="$(python3 -c 'import json,sys; print(json.loads(sys.argv[1])["remoteAppName"])' "${app_json}")"
  version="$(python3 -c 'import json,sys; print(json.loads(sys.argv[1])["version"])' "${app_json}")"
  icon_path="$(python3 -c 'import json,sys; print(json.loads(sys.argv[1])["iconPath"])' "${app_json}")"
  upload_one "${slug}" "${zone}" "${remote_app}" "${version}" "${icon_path}"
done < <(app_list_json "$@")
