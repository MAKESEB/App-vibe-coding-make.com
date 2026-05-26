# Agify Make Custom App

Agify predicts a person's likely age from a first name. This local Make custom app targets the public Agify HTTP API documented at <https://agify.io/>.

## API details

- Base URL: `https://api.agify.io`
- Authentication: Agify API key sent as the `apikey` query parameter
- Connection validation: `GET https://api.agify.io?name=make&apikey=<api-key>`

## Modules

- **Make an API Call**: sends a custom request to the Agify API. Use `/` as the path and add query string parameters such as `name` and `country_id`.

## Notes

- The API key is stored in a password field and sanitized from request query logs.
- No remote upload has been performed for this batch.
