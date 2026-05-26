# 2Captcha Make Custom App

This generated app provides a minimal, local Make custom app for 2Captcha.

## API documentation

- Docs: https://2captcha.com/api-docs
- Base URL: `https://api.2captcha.com`
- Authentication: clientKey JSON field

## Included module

- **Make an API Call** (`makeAnApiCall`) sends a custom request relative to the documented base URL and applies the app-specific authentication behavior.

## Notes

Do not include clientKey in the body. The module injects the connection API key as clientKey.
