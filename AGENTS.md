# Make App Generation Guide

This repository is a Make.com custom-app workspace. Future agents should use this file as the first local operating guide before creating, modifying, uploading, or testing custom Make apps.

## Core Rule

Build real, uploadable Make apps from real API documentation. Do not leave placeholder service names, placeholder domains, example endpoints, or generic response paths in generated app files.

Start with:

- `knowledgebase/00-LLM-DEVELOPMENT-RULES.md`
- `knowledgebase/02-FOLDER-STRUCTURE.md`
- `knowledgebase/03-ESSENTIAL-FILES.md`
- `knowledgebase/07-MODULE-PATTERNS.md`
- `knowledgebase/08-PARAMETER-TYPES.md`
- `knowledgebase/22-CONNECTION-UPLOAD-LEARNINGS.md`
- `knowledgebase/26-APP-ICON-LOGO-UPLOAD-WORKFLOW.md`

Use existing app implementations as references:

- `apps/daytona`
- `apps/rindegastos`
- for more examples: /Users/s.mertens/Documents/GitHub/App-vibe-coding-make.com/raw_data

Use existing upload scripts as references:

- `scripts/daytona/upload-daytona-api-call-app.sh`
- `scripts/rindegastos/upload-rindegastos-app.sh`

## App Layout

Each app should live under `apps/<app-name>/` and follow this shape:

```text
apps/<app-name>/
  assets/icon.png
  base.imljson
  metadata.json
  readme.md
  connections/<connection-name>/
    metadata.json
    parameters.imljson
    api.imljson
  modules/<module-dir>/
    metadata.json
    api.imljson
    expect.imljson
    interface.imljson
    samples.imljson
```

For large APIs, prefer a generator under `scripts/<app-name>/generate-<app-name>-app.mjs` over hand-maintaining many repeated module files. The generated files should still be plain Make app JSON/IML files in `apps/<app-name>/`.

## Discovery Workflow

Before generating files:

1. Read the target API docs and capture:
   - base URL
   - auth type and header format
   - validation endpoint
   - endpoint names, methods, query params, body params
   - list response array paths
   - pagination model
   - important error formats
2. Map endpoint groups to Make modules:
   - list endpoints become search modules, usually `typeId: 9`
   - read-one endpoints become action modules, usually `typeId: 4`
   - create/update/status endpoints become action modules, usually `typeId: 4`
   - include a universal "Make an API Call" module, usually `typeId: 12`
3. For list/search modules, include a user-facing `limit` parameter and implement API pagination if the service supports it.
4. Preserve falsy-but-valid filter values such as `0` and `false`; do not use `ifempty()` for optional numeric, select, or boolean values where `0` is meaningful.

### Production module completeness rule

The universal **Make an API Call** module is mandatory for generated apps, but it is not sufficient for a production-ready app unless the app is explicitly marked as a minimal shell/scaffold.

Every generator that emits app files must classify each app as one of:

- `minimal-shell-scaffold`: intentionally universal-only; README and generated report must say this is not product-complete.
- `production-ready`: includes the universal module plus specific modules generated from a real endpoint matrix.

For `production-ready` apps, the generator must add specific modules from real API endpoints: searches for list endpoints, actions for read/create/update/delete/status endpoints, and triggers/webhooks where the API supports them. Do not call an app production-ready if it only contains `modules/make-api-call`.

## Base and Connection Rules

`base.imljson` should include:

- real `baseUrl`
- auth header using connection data
- `Accept` and `Content-Type` when appropriate
- useful error messages for common status codes
- log sanitization for authorization headers and credentials

Connection validation does not inherit the app base. Use a full URL in `connections/<name>/api.imljson`.

For API key or bearer-token apps:

- collect tokens with a `password` parameter
- sanitize authorization headers
- use a lightweight service endpoint for validation
- do not print or commit real tokens

For remote Make connection creation, use the actual Make API connection type such as `apikey`, `basic`, `oauth`, or `other`. The local folder name can be `api-key`, but upload scripts must create the remote connection object with Make's expected enum.

## Upload Workflow

Each app should have an upload script under `scripts/<app-name>/upload-<app-name>-app.sh`.

The script should:

1. Require `MAKE_API_KEY` and `MAKE_ZONE`.
2. Prefer local `make-cli`, falling back to `npx -y @makehq/cli`.
3. Create or find the remote SDK app.
4. Upload app `base` and docs.
5. Create or find the remote connection object.
6. Upload connection sections through non-versioned connection endpoints:
   - `PUT /api/v2/sdk/apps/connections/<connection-name>/api`
   - `PUT /api/v2/sdk/apps/connections/<connection-name>/parameters`
7. Create or update all modules.
8. Bind each module to the remote connection.
9. Upload each module section: `api`, `expect`, `interface`, `samples`.
10. Generate/fetch a 512x512 PNG logo at `apps/<app>/assets/icon.png`.
11. Upload the app icon with `PUT /api/v2/sdk/apps/<app>/<version>/icon` and verify readback from `/icon/512`.
12. Print remote app name, connection name, module count, and icon status.

Do not expose API keys or logo.dev tokens in terminal output. If local Make CLI config exists, it is acceptable to derive env vars from it for a one-off command, but keep secrets masked in user-facing reports.

## Verification Checklist

Before remote upload:

```bash
node scripts/<app-name>/generate-<app-name>-app.mjs
bash -n scripts/<app-name>/upload-<app-name>-app.sh
node --check scripts/<app-name>/generate-<app-name>-app.mjs
ruby -rjson -e 'ARGV.each { |f| JSON.parse(File.read(f)) }; puts "ok"' $(find apps/<app-name> -type f \( -name '*.json' -o -name '*.imljson' \) | sort)
file apps/<app-name>/assets/icon.png
```

After remote upload, read back at least:

- remote module count
- remote base URL
- remote connection API section
- one representative module API section

For example:

```bash
make-cli sdk-modules list --app-name=<remote-app> --app-version=1 --output=json
make-cli sdk-apps get-section --name=<remote-app> --version=1 --section=base --output=json
make-cli sdk-connections get-section --connection-name=<remote-connection> --section=api --output=json
make-cli sdk-modules get-section --app-name=<remote-app> --app-version=1 --module-name=<module> --section=api --output=json
```

Only claim live API functionality after testing with a real provider credential in Make. Upload success and read-back success prove the custom app exists; they do not prove the third-party API accepts the user's credentials or data.

## Documentation Expectations

When a new app is added:

- document the app in `apps/<app-name>/readme.md`
- keep generator metadata close to the endpoint definitions
- mention the remote app name and connection name in the final report after upload
- add a knowledgebase note only when the build reveals a reusable Make platform behavior, upload workaround, or API pattern not already covered in the knowledgebase

Prefer improving the generator or upload script over documenting manual recovery steps that can be automated.
