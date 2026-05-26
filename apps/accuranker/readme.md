# AccuRanker Make Custom App

This generated app provides a minimal, local Make custom app for AccuRanker.

## API documentation

- Docs: https://www.accuranker.com/help/api/
- Base URL: `https://app.accuranker.com/api/v4`
- Authentication: Authorization: Token <api key>

## Included module

- **Make an API Call** (`makeAnApiCall`) sends a custom request relative to the documented base URL and applies the app-specific authentication behavior.

## Notes

Do not add Authorization in module headers; the app sends the Token header from the connection.
