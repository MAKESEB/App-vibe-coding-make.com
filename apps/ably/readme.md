# Ably Make Custom App

This generated app provides a production-oriented Make custom app for Ably's REST API. It keeps the mandatory universal **Make an API Call** fallback and adds first-class modules from documented Ably REST endpoints.

## API documentation

- REST API docs: https://ably.com/docs/api/rest-api
- Base URL: `https://rest.ably.io`
- Authentication: HTTP Basic auth with the Ably API key name as username and key secret as password.

## Included modules

- **Publish a Message** (`publishMessage`) calls `POST /channels/{channelName}/messages`.
- **Search Message History** (`searchMessageHistory`) calls `GET /channels/{channelName}/messages`.
- **Search Presence Members** (`searchPresenceMembers`) calls `GET /channels/{channelName}/presence`.
- **Search Statistics** (`searchStats`) calls `GET /stats`.
- **Get Server Time** (`getServerTime`) calls `GET /time`.
- **Make an API Call** (`makeAnApiCall`) remains available as the required universal fallback.

## Generator classification

Classification: `production-ready`. This app is not universal-only; it includes endpoint-specific modules generated from the Ably REST endpoint matrix above.

## Notes

Create an Ably API key in the Ably dashboard and split it at the first colon. Use the part before the colon as **API Key Name** and the part after the colon as **API Key Secret**.
