# Ably Make Custom App

This generated app provides a minimal, local Make custom app for Ably.

## API documentation

- Docs: https://ably.com/docs/api/rest-api
- Base URL: `https://rest.ably.io`
- Authentication: HTTP Basic auth using Ably API key name and secret

## Included module

- **Make an API Call** (`makeAnApiCall`) sends a custom request relative to the documented base URL and applies the app-specific authentication behavior.

## Notes

Do not add Authorization in module headers; the app sends the Basic auth header from the connection.
