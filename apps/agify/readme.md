# Agify Make Custom App

This generated app provides a production-oriented Make custom app for the Agify API. It keeps the mandatory universal **Make an API Call** fallback and adds a first-class module for the documented age prediction endpoint.

## API documentation

- Docs: https://agify.io/
- Base URL: `https://api.agify.io`
- Authentication: Agify API key sent as the `apikey` query parameter by the app base configuration.

## Included modules

- **Predict Age** (`predictAge`) calls `GET /` with `name` and optional `country_id`.
- **Make an API Call** (`makeAnApiCall`) remains available as the required universal fallback.

## Generator classification

Classification: `production-ready`. The Agify product exposes a single documented prediction endpoint for this app, and that endpoint is included as a first-class module plus the required universal fallback.

## Notes

The API key is stored in a password field and sanitized from request query logs. Do not add `apikey` manually in module query parameters unless intentionally overriding the connection.
