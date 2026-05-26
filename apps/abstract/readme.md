# Abstract Email Validation Make Custom App

This generated app provides a production-oriented Make custom app for Abstract Email Validation. It keeps the mandatory universal **Make an API Call** fallback and adds a first-class module for the documented email validation endpoint.

## API documentation

- Docs: https://docs.abstractapi.com/email-validation
- Base URL: `https://emailvalidation.abstractapi.com`
- Authentication: `api_key` query parameter populated from the connection API key.

## Included modules

- **Validate Email** (`validateEmail`) calls `GET /v1/` with the connection API key and target email address.
- **Make an API Call** (`makeAnApiCall`) remains available as the required universal fallback.

## Generator classification

Classification: `production-ready`. The Abstract Email Validation API exposes a single documented validation endpoint for this product, and this app includes that endpoint as a first-class module plus the required universal fallback.

## Notes

Do not add `api_key` in Query String. The app injects it from the connection.
