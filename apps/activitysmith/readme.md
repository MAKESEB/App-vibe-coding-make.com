# ActivitySmith

ActivitySmith lets automations send push notifications and manage iOS Live Activities for paired devices.

This Make custom app is based on the locally extracted `n8n-nodes-activitysmith` 1.0.5 package. The n8n package defines the ActivitySmith API base URL as `https://activitysmith.com/api`, authenticates with `Authorization: Bearer <apiKey>`, and verifies credentials by sending a `POST /push-notification` request.

## Authentication

Create an API key in ActivitySmith at `https://activitysmith.com/app/keys`, then paste it into the API Key connection. The key is sent as a Bearer token and is sanitized from logs.

## Supported API areas

Use **Make an API Call** with ActivitySmith API paths such as:

- `POST /push-notification`
- `POST /live-activity/start`
- `POST /live-activity/update`
- `POST /live-activity/end`
- `PUT /live-activity/stream/{streamKey}`
- `DELETE /live-activity/stream/{streamKey}`

The module accepts relative paths under `https://activitysmith.com/api` and returns the status code, response headers, and response body.
