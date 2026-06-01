# ActivitySmith Make Custom App

This generated app provides a production-oriented Make custom app for ActivitySmith. It keeps the mandatory universal **Make an API Call** fallback and adds first-class modules from the endpoint matrix found in the extracted n8n package source.

## Source details

- n8n source package: `n8n-nodes-activitysmith@1.0.5`
- Base URL: `https://activitysmith.com/api`
- Authentication: `Authorization: Bearer <api key>` header populated from the connection API key.

## Included modules

- **Send Push Notification** (`sendPushNotification`) calls `POST /push-notification`.
- **Start Live Activity** (`startLiveActivity`) calls `POST /live-activity/start`.
- **Update Live Activity** (`updateLiveActivity`) calls `POST /live-activity/update`.
- **End Live Activity** (`endLiveActivity`) calls `POST /live-activity/end`.
- **Update Live Activity Stream** (`updateLiveActivityStream`) calls `PUT /live-activity/stream/{streamKey}`.
- **Delete Live Activity Stream** (`deleteLiveActivityStream`) calls `DELETE /live-activity/stream/{streamKey}`.
- **Make an API Call** (`makeAnApiCall`) remains available as the required universal fallback.

## Generator classification

Classification: `production-ready`. This app is not universal-only; it includes endpoint-specific modules generated from the ActivitySmith endpoint matrix above.

## Notes

Do not add an `Authorization` header in module inputs; the app sends the Bearer token from the connection. Complex ActivitySmith payloads are exposed as collections so provider-specific JSON can be passed without reverting to a universal-only app.
