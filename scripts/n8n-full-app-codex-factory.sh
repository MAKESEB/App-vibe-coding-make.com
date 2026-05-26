#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  cat <<'USAGE'
Usage:
  scripts/n8n-full-app-codex-factory.sh <app-slug> <npm-package> [package-version]

Purpose:
  Build one production-ready Make custom app from one exact n8n package source.
  The script prefetches package source, creates a strict Codex prompt, runs Codex,
  validates the app, and optionally uploads/publishes it through Make CLI/API.

Required:
  <app-slug>       local app folder slug, e.g. activitysmith
  <npm-package>    exact n8n package, e.g. n8n-nodes-activitysmith
  [version]        package version, default latest

Important env vars:
  CODEX_HOME       optional isolated Codex profile; default ~/.codex-n8n-make-worker
  RUN_CODEX        1 to run Codex (default 1), 0 to only write prompt/validate existing files
  RUN_UPLOAD       1 to upload remote app after validation (default 0)
  MAKE_PUBLIC      1 to set app and modules public after upload/readback (default 0)
  CREATE_BRANCH    1 to create/switch feature/<slug>-full-mapping before Codex (default 0)
  CREATE_PR        1 to push branch and create a stacked PR against BASE_BRANCH (default 0)
  BASE_BRANCH      scaffold branch for stacked PRs (default fix/sdk-icon-upload-workflow)
  MAKE_ZONE        Make zone, e.g. eu1.make.com; .env.local fallback supported
  MAKE_API_KEY     Make API key; .env.local fallback supported

Examples:
  RUN_CODEX=1 RUN_UPLOAD=0 scripts/n8n-full-app-codex-factory.sh activitysmith n8n-nodes-activitysmith 1.0.5
  RUN_UPLOAD=1 MAKE_PUBLIC=1 scripts/n8n-full-app-codex-factory.sh ada n8n-nodes-ada 0.1.6
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -lt 2 ]]; then
  usage
  exit 1
fi

APP_SLUG="$1"
NPM_PACKAGE="$2"
PACKAGE_VERSION="${3:-latest}"
RUN_CODEX="${RUN_CODEX:-1}"
RUN_UPLOAD="${RUN_UPLOAD:-0}"
MAKE_PUBLIC="${MAKE_PUBLIC:-0}"
CREATE_BRANCH="${CREATE_BRANCH:-0}"
CREATE_PR="${CREATE_PR:-0}"
BASE_BRANCH="${BASE_BRANCH:-fix/sdk-icon-upload-workflow}"
CODEX_HOME="${CODEX_HOME:-${HOME}/.codex-n8n-make-worker}"

APP_DIR="${ROOT_DIR}/apps/${APP_SLUG}"
SCRIPT_DIR="${ROOT_DIR}/scripts/${APP_SLUG}"
SOURCE_DIR="${ROOT_DIR}/tmp/n8n-source/${APP_SLUG}"
PROMPT_DIR="${ROOT_DIR}/generated/n8n-full-app-prompts"
PROMPT_FILE="${PROMPT_DIR}/${APP_SLUG}.md"
REPORT_DIR="${ROOT_DIR}/generated/n8n-full-app-reports"
REPORT_FILE="${REPORT_DIR}/${APP_SLUG}.md"

load_env_local() {
  if [[ -f "${ROOT_DIR}/.env.local" ]]; then
    while IFS='=' read -r env_key env_value; do
      [[ -z "${env_key}" || "${env_key}" == \#* ]] && continue
      case "${env_key}" in
        MAKE_API_KEY|MAKE_ZONE|LOGO_DEV_TOKEN)
          if [[ -z "${!env_key:-}" ]]; then
            export "${env_key}=${env_value}"
          fi
          ;;
      esac
    done < "${ROOT_DIR}/.env.local"
  fi
}

validate_slug() {
  case "$APP_SLUG" in
    *[!a-z0-9-]*|''|-*|*-)
      echo "Invalid app slug: ${APP_SLUG}. Use lowercase letters, numbers, and hyphens." >&2
      exit 1
      ;;
  esac
}

validate_make_zone() {
  local zone="${1:-}"
  case "$zone" in
    *[!A-Za-z0-9.-]*|.*|*-|*..*|*/*|http:*|https:*|'')
      echo "Invalid MAKE_ZONE: ${zone}" >&2
      return 1
      ;;
  esac
  [[ "$zone" == *.make.com ]] || {
    echo "Invalid MAKE_ZONE: ${zone}; expected *.make.com" >&2
    return 1
  }
}

ensure_clean_tracked_tree() {
  if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
    echo "Tracked working tree is dirty; commit/stash before running factory." >&2
    git status --short --untracked-files=no >&2
    exit 1
  fi
}

prefetch_package() {
  mkdir -p "$SOURCE_DIR"
  rm -rf "${SOURCE_DIR:?}"/*
  echo "Prefetching ${NPM_PACKAGE}@${PACKAGE_VERSION} into ${SOURCE_DIR}"
  (
    cd "$SOURCE_DIR"
    npm pack "${NPM_PACKAGE}@${PACKAGE_VERSION}" >/tmp/n8n-pack-${APP_SLUG}.log
    tarball="$(ls ./*.tgz | head -n 1)"
    tar -xzf "$tarball" --strip-components=1
  )
}

write_prompt() {
  mkdir -p "$PROMPT_DIR" "$REPORT_DIR" "$SCRIPT_DIR"
  cat > "$PROMPT_FILE" <<EOF_PROMPT
You are running inside the Make custom-app repository:

${ROOT_DIR}

TASK
Build exactly one production-ready Make custom app from exact n8n package source.

TARGET
- app slug: ${APP_SLUG}
- npm package: ${NPM_PACKAGE}@${PACKAGE_VERSION}
- local extracted package source: ${SOURCE_DIR}
- app output directory: apps/${APP_SLUG}
- generator output file: scripts/${APP_SLUG}/generate-${APP_SLUG}-app.mjs
- report file: generated/n8n-full-app-reports/${APP_SLUG}.md

MANDATORY READING
Read these first:
- AGENTS.md
- knowledgebase/00-LLM-DEVELOPMENT-RULES.md
- knowledgebase/02-FOLDER-STRUCTURE.md
- knowledgebase/03-ESSENTIAL-FILES.md
- knowledgebase/07-MODULE-PATTERNS.md
- knowledgebase/08-PARAMETER-TYPES.md
- knowledgebase/20-COMMON-PATTERNS.md
- knowledgebase/21-TROUBLESHOOTING.md
- knowledgebase/22-CONNECTION-UPLOAD-LEARNINGS.md
- knowledgebase/26-APP-ICON-LOGO-UPLOAD-WORKFLOW.md
- knowledgebase/27-COMPLETE-APP-MODULE-PUBLIC-WORKFLOW.md

SOURCE-OF-TRUTH RULES
- Treat ${SOURCE_DIR} as the primary source of truth.
- Inspect package.json, README files, credentials, nodes, generic functions, request helpers, resource descriptions, and routing definitions.
- Extract real base URL, auth pattern, credential test/validation endpoint, endpoints, methods, parameters, request bodies, response/iterate paths, and pagination from the package source.
- Public vendor docs may be used only to clarify package facts, not to invent endpoints.
- Do not create fake apps from catalogue descriptions.
- If facts are insufficient, write a blocked report instead of generating fake modules.

FULL APP REQUIREMENTS
- Generate apps/${APP_SLUG}/ with metadata.json, base.imljson, readme.md, assets/icon.png, connection files, and modules.
- Generate scripts/${APP_SLUG}/generate-${APP_SLUG}-app.mjs. The generator must be repeatable and own generated files.
- Always include a universal Make an API Call module with typeId 12.
- Universal Make an API Call is mandatory but not enough for production-ready.
- Add endpoint-specific modules from the real endpoint matrix:
  - list/search endpoints -> search modules, usually typeId 9
  - read/create/update/delete/status endpoints -> action modules, usually typeId 4
  - polling/webhook endpoints -> triggers only if package/source supports them
- README must classify the app as production-ready only if endpoint-specific modules are present. Otherwise classify as minimal-shell-scaffold and explain why.
- Ensure app metadata uses language "en" and audience "global".
- Ensure app icon is a valid 512x512 PNG. If a real logo cannot be fetched/converted locally, create a simple valid 512x512 PNG fallback; do not leave icon missing.
- Do not print, commit, or hard-code real credentials.

UPLOAD/PUBLIC REQUIREMENTS FOR GENERATED ARTIFACTS
The repository upload/public workflow after local validation is:
- ./scripts/upload-ready-apps.sh ${APP_SLUG}
- make-cli sdk-apps set-icon <remote-app> 1 apps/${APP_SLUG}/assets/icon.png
- make-cli sdk-apps get-icon <remote-app> 1 /tmp/${APP_SLUG}-icon.png
- make-cli sdk-apps set-public <remote-app> 1
- make-cli sdk-modules set-public <remote-app> 1 <each-module>
- read back app/module public flags and module sections before claiming success

Do not perform remote upload from Codex unless RUN_UPLOAD is explicitly handled by the outer Hermes script. Codex should generate and validate local files only.

LOCAL VALIDATION TO RUN
After generating files, run:

node scripts/${APP_SLUG}/generate-${APP_SLUG}-app.mjs
node --check scripts/${APP_SLUG}/generate-${APP_SLUG}-app.mjs
ruby -rjson -e 'ARGV.each { |f| JSON.parse(File.read(f)) }; puts "json_ok #{ARGV.length}"' \$(find apps/${APP_SLUG} -type f \( -name '*.json' -o -name '*.imljson' \) | sort)
file apps/${APP_SLUG}/assets/icon.png
grep -RInE 'example\.com|YOUR_SERVICE|SERVICE_NAME|testParam|sampleInput|/whoami|api\.example|Make\.com' apps/${APP_SLUG} scripts/${APP_SLUG} || true

Also run a module guard in Python: exactly one universal module with typeId 12, and at least one endpoint-specific module with typeId 4/9/1/10/11 for production-ready classification.

REPORT
Write ${REPORT_FILE} with:
- package inspected
- source files used as evidence
- base URL
- auth pattern
- validation endpoint
- endpoint matrix
- generated modules and typeIds
- local validation commands/results
- upload/public commands to run next
- risks or unsupported endpoints
EOF_PROMPT
  echo "Wrote Codex prompt: ${PROMPT_FILE}"
}

run_codex() {
  if [[ "$RUN_CODEX" != "1" ]]; then
    echo "RUN_CODEX=0, skipping Codex execution. Prompt remains at ${PROMPT_FILE}"
    return 0
  fi

  if ! command -v codex >/dev/null 2>&1; then
    echo "codex CLI not found on PATH." >&2
    exit 1
  fi

  mkdir -p "$CODEX_HOME"
  echo "Running Codex with CODEX_HOME=${CODEX_HOME}"
  if [[ -f "${CODEX_HOME}/auth.json" && -z "${OPENAI_API_KEY:-}" ]]; then
    OPENAI_API_KEY="$(python3 - <<'PY'
import json, os, pathlib
path = pathlib.Path(os.environ['CODEX_HOME']) / 'auth.json'
try:
    data = json.loads(path.read_text())
    print(data.get('OPENAI_API_KEY') or data.get('openai_api_key') or '')
except Exception:
    print('')
PY
)" CODEX_HOME="$CODEX_HOME" codex --ask-for-approval never exec --sandbox workspace-write "$(cat "$PROMPT_FILE")"
  else
    CODEX_HOME="$CODEX_HOME" codex --ask-for-approval never exec --sandbox workspace-write "$(cat "$PROMPT_FILE")"
  fi
}

validate_generated_app() {
  echo "Validating generated app ${APP_SLUG}"
  [[ -f "${SCRIPT_DIR}/generate-${APP_SLUG}-app.mjs" ]] || { echo "Missing generator script" >&2; exit 1; }
  [[ -d "$APP_DIR" ]] || { echo "Missing app directory" >&2; exit 1; }

  node "${SCRIPT_DIR}/generate-${APP_SLUG}-app.mjs"
  node --check "${SCRIPT_DIR}/generate-${APP_SLUG}-app.mjs"
  ruby -rjson -e 'ARGV.each { |f| JSON.parse(File.read(f)) }; puts "json_ok #{ARGV.length}"' $(find "$APP_DIR" -type f \( -name '*.json' -o -name '*.imljson' \) | sort)
  file "${APP_DIR}/assets/icon.png"
  if ! file "${APP_DIR}/assets/icon.png" | grep -q 'PNG image data, 512 x 512'; then
    echo "Icon must be a 512x512 PNG" >&2
    exit 1
  fi
  if grep -RInE 'example\.com|YOUR_SERVICE|SERVICE_NAME|testParam|sampleInput|/whoami|api\.example|Make\.com' "$APP_DIR" "$SCRIPT_DIR"; then
    echo "Placeholder scan found matches. Review and remove generated placeholders." >&2
    exit 1
  fi
  python3 - "$APP_SLUG" <<'PY'
import json, pathlib, sys
app = sys.argv[1]
mods = []
for p in pathlib.Path('apps', app, 'modules').glob('*/metadata.json'):
    mods.append(json.loads(p.read_text()))
universal = [m for m in mods if m.get('name') == 'makeAnApiCall' and m.get('typeId') == 12]
specific = [m for m in mods if m.get('name') != 'makeAnApiCall' and m.get('typeId') in (4, 9, 1, 10, 11)]
if len(universal) != 1:
    raise SystemExit(f'Expected exactly one universal makeAnApiCall module with typeId 12; found {len(universal)}')
if not specific:
    raise SystemExit('Expected at least one endpoint-specific module for a full production app')
print(f'module_guard_ok modules={len(mods)} specific={len(specific)}')
PY
}

upload_and_publish() {
  if [[ "$RUN_UPLOAD" != "1" ]]; then
    echo "RUN_UPLOAD=0, skipping remote upload/public visibility."
    return 0
  fi
  load_env_local
  [[ -n "${MAKE_API_KEY:-}" ]] || { echo "MAKE_API_KEY required for upload" >&2; exit 1; }
  [[ -n "${MAKE_ZONE:-}" ]] || { echo "MAKE_ZONE required for upload" >&2; exit 1; }
  validate_make_zone "$MAKE_ZONE"

  UPLOAD_ICONS=1 "${ROOT_DIR}/scripts/upload-ready-apps.sh" "$APP_SLUG" | tee "/tmp/make-upload-${APP_SLUG}.out"
  result_line="$(grep 'APP_RESULT' "/tmp/make-upload-${APP_SLUG}.out" | tail -1 || true)"
  remote_app="$(printf '%s' "$result_line" | sed -n 's/.*remote_app=\([^ ]*\).*/\1/p')"
  [[ -n "$remote_app" ]] || { echo "Could not determine remote app from upload output" >&2; exit 1; }

  make-cli sdk-apps set-public "$remote_app" 1 >/dev/null
  find "${APP_DIR}/modules" -mindepth 2 -maxdepth 2 -name metadata.json | sort | while IFS= read -r module_meta; do
    module_name="$(ruby -rjson -e 'print JSON.parse(File.read(ARGV[0]))["name"]' "$module_meta")"
    make-cli sdk-modules set-public "$remote_app" 1 "$module_name" >/dev/null
  done

  # Retry until all module public flags read back true; Make can be eventually consistent.
  for attempt in 1 2 3 4 5; do
    make-cli sdk-apps get --name="$remote_app" --version=1 --output=json > "/tmp/${APP_SLUG}-app.json"
    make-cli sdk-modules list --app-name="$remote_app" --app-version=1 --output=json > "/tmp/${APP_SLUG}-modules.json"
    if python3 - "$APP_SLUG" "$remote_app" <<'PY'
import json, sys
app_slug, remote_app = sys.argv[1:]
app = json.load(open(f'/tmp/{app_slug}-app.json'))
mods = json.load(open(f'/tmp/{app_slug}-modules.json'))
items = mods if isinstance(mods, list) else mods.get('appModules') or mods.get('modules') or mods.get('items') or mods.get('data') or []
private = [m.get('name') for m in items if m.get('public') is not True]
if app.get('public') is True and not private:
    print(f'public_verify_ok remote_app={remote_app} modules={len(items)}')
    raise SystemExit(0)
print('private_modules=' + ','.join(private))
raise SystemExit(1)
PY
    then
      break
    fi
    find "${APP_DIR}/modules" -mindepth 2 -maxdepth 2 -name metadata.json | sort | while IFS= read -r module_meta; do
      module_name="$(ruby -rjson -e 'print JSON.parse(File.read(ARGV[0]))["name"]' "$module_meta")"
      make-cli sdk-modules set-public "$remote_app" 1 "$module_name" >/dev/null
    done
    sleep 8
  done
}

create_branch_if_requested() {
  if [[ "$CREATE_BRANCH" != "1" ]]; then
    return 0
  fi
  ensure_clean_tracked_tree
  git fetch origin --prune
  git checkout "$BASE_BRANCH"
  git checkout -B "feature/${APP_SLUG}-full-mapping"
}

create_pr_if_requested() {
  if [[ "$CREATE_PR" != "1" ]]; then
    return 0
  fi
  branch="feature/${APP_SLUG}-full-mapping"
  git add "apps/${APP_SLUG}" "scripts/${APP_SLUG}/generate-${APP_SLUG}-app.mjs" "generated/n8n-full-app-reports/${APP_SLUG}.md"
  git commit -m "feat(${APP_SLUG}): add endpoint-specific modules" || true
  git push -u origin "$branch"
  echo "Create PR against ${BASE_BRANCH}: https://github.com/MAKESEB/App-vibe-coding-make.com/compare/${BASE_BRANCH}...${branch}?expand=1"
}

main() {
  cd "$ROOT_DIR"
  validate_slug
  create_branch_if_requested
  prefetch_package
  write_prompt
  run_codex
  validate_generated_app
  upload_and_publish
  create_pr_if_requested
  echo "n8n full-app factory completed for ${APP_SLUG}."
}

main "$@"
