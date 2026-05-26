# Ada

Ada provides AI-powered data analysis, interpretation, and visualization tools.

This Make custom app is based on the locally extracted `n8n-nodes-ada` 0.1.6 package. The package defines the Ada API base URL as `https://ada.im/api`, authenticates by sending the configured API key directly in the `Authorization` header, and verifies credentials with `POST /platform_api/VerifyApikey`.

## Authentication

Create an API key in the Ada API management dashboard at `https://ada.im`, then paste it into the API Key connection. The key is sent as the raw `Authorization` header value and is sanitized from logs.

## Supported API areas

Use **Make an API Call** with Ada API paths discovered from the n8n package source:

- `POST /platform_api/VerifyApikey`
- `POST /platform_api/PythonDataAnalysis`
- `POST /platform_api/DataInterpretation`
- `POST /platform_api/EchartsVisualization`

The analysis, interpretation, and visualization endpoints accept JSON request bodies with fields such as `input_json` and `query`, matching the n8n node routing definitions. The module accepts relative paths under `https://ada.im/api` and returns the status code, response headers, and response body.

No remote Make upload was performed.
