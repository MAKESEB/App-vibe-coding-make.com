# Actaport

This local Make custom app was generated from the exact npm package `@actaport/n8n-nodes-actaport@0.3.0`.

The package defines an Actaport OAuth2 PKCE connection and Actaport REST API routing. This Make app provides a connection and a universal **Make an API Call** module so authorized requests can be sent to the Actaport API.

## Source details

- npm package: `@actaport/n8n-nodes-actaport@0.3.0`
- Package API base URL: `https://app.actaport.de/v1`
- Credential test endpoint: `GET https://app.actaport.de/v1/info/me`
- OAuth authorization URL pattern: `https://app.actaport.de/auth/realms/{realm}/protocol/openid-connect/auth`
- OAuth token URL pattern: `https://app.actaport.de/auth/realms/{realm}/protocol/openid-connect/token`
- Client ID: `automation`
- Scope: `openid offline_access`
- Grant type: authorization code with PKCE

## Connection setup

Create an Actaport OAuth connection and enter the Actaport realm supplied with the Actaport subscription. API access must be enabled for the Actaport account.

## Make an API Call

Enter a path relative to `https://app.actaport.de/v1`, for example `/info/me`, `/kontakte`, or `/webhooks`.

Do not add an `Authorization` header in the module input. The app adds `Authorization: Bearer {{connection.accessToken}}` automatically.

## Notes

The n8n package contains many operation definitions for Actaport resources, but this task requested a local app with a universal API call module rather than a full resource-by-resource Make translation. No remote upload was performed.
