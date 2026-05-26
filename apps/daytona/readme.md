# Daytona Make API Call App

This app is the minimal Daytona Make.com app for custom API requests.

It intentionally ships only one module:
- `Make an API Call`

The module uses the shared Daytona base URL and automatically injects the Daytona API key from the connection as a bearer token.

## Local Structure

- `metadata.json`
- `base.imljson`
- `connections/api-key/*`
- `modules/make-api-call/*`

## Upload

Use:

```bash
MAKE_API_KEY=... MAKE_ZONE=eu1.make.com ./scripts/daytona/upload-daytona-api-call-app.sh
```

Notes:
- The script prefers a local `make-cli` binary and falls back to `npx -y @makehq/cli`.
- The script uses raw Make API calls for connection sections because the current CLI surface is incomplete there.
