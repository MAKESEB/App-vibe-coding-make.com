#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const appDir = path.join(root, "apps/ada");
const modulesDir = path.join(appDir, "modules");

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}
function text(name, label, help, required = false) { return { name, type: "text", label, ...(required ? { required: true } : {}), ...(help ? { help } : {}) }; }
function collection(name, label, help, required = false) { return { name, type: "collection", label, ...(required ? { required: true } : {}), ...(help ? { help } : {}) }; }

const resultInterface = [
  { name: "code", type: "number", label: "Code" },
  { name: "message", type: "text", label: "Message" },
  { name: "data", type: "collection", label: "Data" },
  { name: "result", type: "any", label: "Result" }
];

const modules = [
  {
    dir: "verify-api-key",
    metadata: { name: "verifyApiKey", label: "Verify API Key", description: "Verify the configured Ada API key.", connection: "api-key", type: "action", typeId: 4 },
    expect: [],
    api: { url: "/platform_api/VerifyApikey", method: "POST", response: { output: "{{body}}" } },
    interface: resultInterface,
    samples: {}
  },
  {
    dir: "analyze-python-data",
    metadata: { name: "analyzePythonData", label: "Analyze Python Data", description: "Run Ada Python data analysis on JSON data with a natural-language query.", connection: "api-key", type: "action", typeId: 4 },
    expect: [collection("inputJson", "Input JSON", "JSON data to analyze.", true), text("query", "Query", "Analysis question or instruction.", true)],
    api: { url: "/platform_api/PythonDataAnalysis", method: "POST", body: { input_json: "{{parameters.inputJson}}", query: "{{parameters.query}}" }, response: { output: "{{body}}" } },
    interface: resultInterface,
    samples: { inputJson: { sales: [{ month: "Jan", revenue: 100 }] }, query: "Summarize revenue trends" }
  },
  {
    dir: "interpret-data",
    metadata: { name: "interpretData", label: "Interpret Data", description: "Ask Ada to interpret structured JSON data.", connection: "api-key", type: "action", typeId: 4 },
    expect: [collection("inputJson", "Input JSON", "JSON data to interpret.", true), text("query", "Query", "Interpretation question or instruction.", true)],
    api: { url: "/platform_api/DataInterpretation", method: "POST", body: { input_json: "{{parameters.inputJson}}", query: "{{parameters.query}}" }, response: { output: "{{body}}" } },
    interface: resultInterface,
    samples: { inputJson: { users: [{ segment: "trial", count: 42 }] }, query: "What is the dominant user segment?" }
  },
  {
    dir: "create-echarts-visualization",
    metadata: { name: "createEchartsVisualization", label: "Create ECharts Visualization", description: "Generate an ECharts visualization from JSON data and a natural-language prompt.", connection: "api-key", type: "action", typeId: 4 },
    expect: [collection("inputJson", "Input JSON", "JSON data to visualize.", true), text("query", "Query", "Visualization instruction.", true)],
    api: { url: "/platform_api/EchartsVisualization", method: "POST", body: { input_json: "{{parameters.inputJson}}", query: "{{parameters.query}}" }, response: { output: "{{body}}" } },
    interface: resultInterface,
    samples: { inputJson: { sales: [{ month: "Jan", revenue: 100 }] }, query: "Create a bar chart of revenue by month" }
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
  url: "https://ada.im/api{{parameters.url}}",
  method: "{{parameters.method}}",
  headers: { "{{...}}": "{{toCollection(parameters.headers, 'key', 'value')}}" },
  qs: { "{{...}}": "{{toCollection(parameters.qs, 'key', 'value')}}" },
  body: "{{parameters.body}}",
  response: { output: { statusCode: "{{statusCode}}", headers: "{{headers}}", body: "{{body}}" } }
});

const readme = `# Ada Make Custom App\n\nThis generated app provides a production-oriented Make custom app for Ada's API exposed by the extracted \`n8n-nodes-ada@0.1.6\` package. It keeps the mandatory universal **Make an API Call** fallback and adds first-class modules for each endpoint found in the package routing definitions.\n\n## Source details\n\n- n8n source package: \`n8n-nodes-ada@0.1.6\`\n- Base URL: \`https://ada.im/api\`\n- Authentication: raw \`Authorization\` header populated from the connection API key.\n\n## Included modules\n\n- **Verify API Key** (\`verifyApiKey\`) calls \`POST /platform_api/VerifyApikey\`.\n- **Analyze Python Data** (\`analyzePythonData\`) calls \`POST /platform_api/PythonDataAnalysis\`.\n- **Interpret Data** (\`interpretData\`) calls \`POST /platform_api/DataInterpretation\`.\n- **Create ECharts Visualization** (\`createEchartsVisualization\`) calls \`POST /platform_api/EchartsVisualization\`.\n- **Make an API Call** (\`makeAnApiCall\`) remains available as the required universal fallback.\n\n## Generator classification\n\nClassification: \`production-ready\`. This app is not universal-only; it includes endpoint-specific modules generated from the Ada endpoint matrix above.\n\n## Notes\n\nDo not add an \`Authorization\` header in module inputs; the app sends the configured API key from the connection. The data modules use \`input_json\` and \`query\` request fields matching the extracted n8n node routing definitions.\n`;
fs.writeFileSync(path.join(appDir, "readme.md"), readme);
console.log(`Generated ${modules.length} Ada-specific modules and updated universal fallback/readme`);
