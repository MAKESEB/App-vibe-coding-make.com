#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const appDir = path.join(root, "apps/abstract");
const modulesDir = path.join(appDir, "modules");

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

const validationInterface = [
  { name: "email", type: "email", label: "Email" },
  { name: "autocorrect", type: "email", label: "Autocorrect" },
  { name: "deliverability", type: "text", label: "Deliverability" },
  { name: "quality_score", type: "number", label: "Quality Score" },
  { name: "is_valid_format", type: "collection", label: "Is Valid Format" },
  { name: "is_free_email", type: "collection", label: "Is Free Email" },
  { name: "is_disposable_email", type: "collection", label: "Is Disposable Email" },
  { name: "is_role_email", type: "collection", label: "Is Role Email" },
  { name: "is_catchall_email", type: "collection", label: "Is Catch-All Email" },
  { name: "is_mx_found", type: "collection", label: "Is MX Found" },
  { name: "is_smtp_valid", type: "collection", label: "Is SMTP Valid" }
];

const modules = [
  {
    dir: "validate-email",
    metadata: {
      name: "validateEmail",
      label: "Validate Email",
      description: "Validate an email address with Abstract Email Validation API.",
      connection: "api-key",
      type: "action",
      typeId: 4
    },
    expect: [
      {
        name: "email",
        type: "email",
        label: "Email",
        required: true,
        help: "Email address to validate."
      }
    ],
    api: {
      url: "/v1/",
      method: "GET",
      qs: {
        api_key: "{{connection.apiKey}}",
        email: "{{parameters.email}}"
      },
      response: {
        output: "{{body}}"
      }
    },
    interface: validationInterface,
    samples: { email: "support@abstractapi.com" }
  }
];

for (const mod of modules) {
  const dir = path.join(modulesDir, mod.dir);
  writeJson(path.join(dir, "metadata.json"), mod.metadata);
  writeJson(path.join(dir, "api.imljson"), mod.api);
  writeJson(path.join(dir, "expect.imljson"), mod.expect);
  writeJson(path.join(dir, "interface.imljson"), mod.interface);
  writeJson(path.join(dir, "samples.imljson"), mod.samples);
}

writeJson(path.join(modulesDir, "make-api-call/api.imljson"), {
  url: "https://emailvalidation.abstractapi.com{{parameters.url}}",
  method: "{{parameters.method}}",
  headers: { "{{...}}": "{{toCollection(parameters.headers, 'key', 'value')}}" },
  qs: {
    api_key: "{{connection.apiKey}}",
    "{{...}}": "{{toCollection(parameters.qs, 'key', 'value')}}"
  },
  body: "{{parameters.body}}",
  response: {
    output: {
      statusCode: "{{statusCode}}",
      headers: "{{headers}}",
      body: "{{body}}"
    }
  }
});

const readme = `# Abstract Email Validation Make Custom App\n\nThis generated app provides a production-oriented Make custom app for Abstract Email Validation. It keeps the mandatory universal **Make an API Call** fallback and adds a first-class module for the documented email validation endpoint.\n\n## API documentation\n\n- Docs: https://docs.abstractapi.com/email-validation\n- Base URL: \`https://emailvalidation.abstractapi.com\`\n- Authentication: \`api_key\` query parameter populated from the connection API key.\n\n## Included modules\n\n- **Validate Email** (\`validateEmail\`) calls \`GET /v1/\` with the connection API key and target email address.\n- **Make an API Call** (\`makeAnApiCall\`) remains available as the required universal fallback.\n\n## Generator classification\n\nClassification: \`production-ready\`. The Abstract Email Validation API exposes a single documented validation endpoint for this product, and this app includes that endpoint as a first-class module plus the required universal fallback.\n\n## Notes\n\nDo not add \`api_key\` in Query String. The app injects it from the connection.\n`;
fs.writeFileSync(path.join(appDir, "readme.md"), readme);
console.log(`Generated ${modules.length} Abstract-specific module and updated universal fallback/readme`);
