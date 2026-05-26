#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const appDir = path.join(root, "apps/agify");
const modulesDir = path.join(appDir, "modules");

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

const ageInterface = [
  { name: "count", type: "number", label: "Count" },
  { name: "name", type: "text", label: "Name" },
  { name: "age", type: "number", label: "Age" },
  { name: "country_id", type: "text", label: "Country ID" }
];

const modules = [
  {
    dir: "predict-age",
    metadata: {
      name: "predictAge",
      label: "Predict Age",
      description: "Predict a likely age from a first name using Agify.",
      connection: "api-key",
      type: "action",
      typeId: 4
    },
    expect: [
      { name: "name", type: "text", label: "Name", required: true, help: "First name to predict age for." },
      { name: "countryId", type: "text", label: "Country ID", help: "Optional ISO 3166-1 alpha-2 country code such as US, DK, or DE." }
    ],
    api: {
      url: "/",
      method: "GET",
      qs: {
        name: "{{parameters.name}}",
        country_id: "{{ifempty(parameters.countryId, undefined)}}"
      },
      response: {
        output: "{{body}}"
      }
    },
    interface: ageInterface,
    samples: { name: "michael", countryId: "US" }
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
  url: "https://api.agify.io{{parameters.url}}",
  method: "{{parameters.method}}",
  headers: { "{{...}}": "{{toCollection(parameters.headers, 'key', 'value')}}" },
  qs: { "{{...}}": "{{toCollection(parameters.qs, 'key', 'value')}}" },
  body: "{{parameters.body}}",
  response: { output: { statusCode: "{{statusCode}}", headers: "{{headers}}", body: "{{body}}" } }
});

const readme = `# Agify Make Custom App\n\nThis generated app provides a production-oriented Make custom app for the Agify API. It keeps the mandatory universal **Make an API Call** fallback and adds a first-class module for the documented age prediction endpoint.\n\n## API documentation\n\n- Docs: https://agify.io/\n- Base URL: \`https://api.agify.io\`\n- Authentication: Agify API key sent as the \`apikey\` query parameter by the app base configuration.\n\n## Included modules\n\n- **Predict Age** (\`predictAge\`) calls \`GET /\` with \`name\` and optional \`country_id\`.\n- **Make an API Call** (\`makeAnApiCall\`) remains available as the required universal fallback.\n\n## Generator classification\n\nClassification: \`production-ready\`. The Agify product exposes a single documented prediction endpoint for this app, and that endpoint is included as a first-class module plus the required universal fallback.\n\n## Notes\n\nThe API key is stored in a password field and sanitized from request query logs. Do not add \`apikey\` manually in module query parameters unless intentionally overriding the connection.\n`;
fs.writeFileSync(path.join(appDir, "readme.md"), readme);
console.log(`Generated ${modules.length} Agify-specific module and updated universal fallback/readme`);
