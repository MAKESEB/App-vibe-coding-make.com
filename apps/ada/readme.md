# Ada Make Custom App

This generated app provides a production-oriented Make custom app for Ada's API exposed by the extracted `n8n-nodes-ada@0.1.6` package. It keeps the mandatory universal **Make an API Call** fallback and adds first-class modules for each endpoint found in the package routing definitions.

## Source details

- n8n source package: `n8n-nodes-ada@0.1.6`
- Base URL: `https://ada.im/api`
- Authentication: raw `Authorization` header populated from the connection API key.

## Included modules

- **Verify API Key** (`verifyApiKey`) calls `POST /platform_api/VerifyApikey`.
- **Analyze Python Data** (`analyzePythonData`) calls `POST /platform_api/PythonDataAnalysis`.
- **Interpret Data** (`interpretData`) calls `POST /platform_api/DataInterpretation`.
- **Create ECharts Visualization** (`createEchartsVisualization`) calls `POST /platform_api/EchartsVisualization`.
- **Make an API Call** (`makeAnApiCall`) remains available as the required universal fallback.

## Generator classification

Classification: `production-ready`. This app is not universal-only; it includes endpoint-specific modules generated from the Ada endpoint matrix above.

## Notes

Do not add an `Authorization` header in module inputs; the app sends the configured API key from the connection. The data modules use `input_json` and `query` request fields matching the extracted n8n node routing definitions.
