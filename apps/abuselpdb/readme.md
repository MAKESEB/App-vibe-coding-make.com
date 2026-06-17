# AbuseIPDB Make Custom App

This generated app provides a production-oriented Make custom app for AbuseIPDB API v2. It keeps the mandatory universal **Make an API Call** fallback and adds first-class modules from documented AbuseIPDB endpoints.

## API documentation

- Docs: https://docs.abuseipdb.com/
- Base URL: `https://api.abuseipdb.com/api/v2`
- Authentication: `Key` header populated from the connection API key.

## Included modules

- **Check IP Address** (`checkIpAddress`) calls `GET /check`.
- **Check Network Block** (`checkNetworkBlock`) calls `GET /check-block`.
- **Search Blacklist** (`searchBlacklist`) calls `GET /blacklist`.
- **Report IP Address** (`reportIpAddress`) calls `POST /report`.
- **Bulk Report IP Addresses** (`bulkReportIpAddresses`) calls `POST /bulk-report`.
- **Make an API Call** (`makeAnApiCall`) remains available as the required universal fallback.

## Generator classification

Classification: `production-ready`. This app is not universal-only; it includes endpoint-specific modules generated from the AbuseIPDB endpoint matrix above.

## Notes

Do not add `Key` in module headers; the app sends it from the connection. The repository folder is currently named `abuselpdb` to preserve the existing uploaded app slug.
