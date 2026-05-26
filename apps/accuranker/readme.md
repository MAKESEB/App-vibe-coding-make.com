# AccuRanker Make Custom App

This generated app provides a production-oriented Make custom app for the AccuRanker Write API. It keeps the mandatory universal **Make an API Call** fallback and adds first-class modules from the documented OpenAPI endpoint matrix.

## API documentation

- OpenAPI spec: https://app.accuranker.com/api/v4/openapi.json
- Base URL: `https://app.accuranker.com/api/v4`
- Authentication: `Authorization: Token <api key>` header populated from the connection API key.

## Included modules

- **Search Group Domains** (`searchGroupDomains`) calls `GET /overview/group_domains`.
- **Search Keywords for Domain** (`searchKeywordsForDomain`) calls `GET /overview/keywords_for_domain/{domainId}`.
- **Create Group**, **Update Group**, **Delete Group**.
- **Create Domain**, **Update Domain**, **Delete Domain**.
- **Create Keywords**, **Update Keywords**, **Delete Keywords**, and **Get Keyword Job Status**.
- **Create Brand**, **Update Brand**, **Delete Brand**.
- **Make an API Call** (`makeAnApiCall`) remains available as the required universal fallback.

## Generator classification

Classification: `production-ready`. This app is not universal-only; it includes endpoint-specific modules generated from AccuRanker's OpenAPI endpoint matrix.

## Notes

Do not add `Authorization` in module headers; the app sends the Token header from the connection. Some complex create/update modules expose an **Extra Fields** collection so advanced OpenAPI schema fields can be passed without losing the first-class endpoint module.
