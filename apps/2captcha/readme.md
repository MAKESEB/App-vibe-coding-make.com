# 2Captcha Make Custom App

This generated app provides a production-oriented Make custom app for 2Captcha API v2. It keeps the mandatory universal **Make an API Call** fallback and adds first-class modules from documented 2Captcha endpoints.

## API documentation

- Docs: https://2captcha.com/api-docs
- Base URL: `https://api.2captcha.com`
- Authentication: `clientKey` JSON field populated from the connection API key.

## Included modules

- **Create reCAPTCHA v2 Task** (`createRecaptchaV2Task`) calls `POST /createTask` with `RecaptchaV2TaskProxyless`.
- **Create Image to Text Task** (`createImageToTextTask`) calls `POST /createTask` with `ImageToTextTask`.
- **Get Task Result** (`getTaskResult`) calls `POST /getTaskResult`.
- **Get Balance** (`getBalance`) calls `POST /getBalance`.
- **Report Correct** (`reportCorrect`) calls `POST /reportCorrect`.
- **Report Incorrect** (`reportIncorrect`) calls `POST /reportIncorrect`.
- **Make an API Call** (`makeAnApiCall`) remains available as the required universal fallback.

## Generator classification

Classification: `production-ready`. This app is not universal-only; it includes endpoint-specific modules generated from the 2Captcha API v2 endpoint matrix above.

## Notes

Do not include `clientKey` in module bodies. The app injects the connection API key as `clientKey`.
