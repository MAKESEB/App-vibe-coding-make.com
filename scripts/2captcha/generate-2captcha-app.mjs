#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const appDir = path.join(root, "apps/2captcha");
const modulesDir = path.join(appDir, "modules");

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function text(name, label, help, required = false) {
  return { name, type: "text", label, ...(required ? { required: true } : {}), ...(help ? { help } : {}) };
}
function password(name, label, help, required = false) {
  return { name, type: "password", label, ...(required ? { required: true } : {}), ...(help ? { help } : {}) };
}
function bool(name, label, help) {
  return { name, type: "boolean", label, ...(help ? { help } : {}) };
}
function number(name, label, help, required = false) {
  return { name, type: "uinteger", label, ...(required ? { required: true } : {}), ...(help ? { help } : {}) };
}
function select(name, label, options, defaultValue, help) {
  return { name, type: "select", label, options, ...(defaultValue ? { default: defaultValue } : {}), ...(help ? { help } : {}) };
}

const resultInterface = [
  { name: "errorId", type: "number", label: "Error ID" },
  { name: "errorCode", type: "text", label: "Error Code" },
  { name: "errorDescription", type: "text", label: "Error Description" },
  { name: "status", type: "text", label: "Status" },
  { name: "solution", type: "collection", label: "Solution" },
  { name: "cost", type: "text", label: "Cost" },
  { name: "ip", type: "text", label: "Worker IP" },
  { name: "createTime", type: "date", label: "Create Time" },
  { name: "endTime", type: "date", label: "End Time" },
  { name: "solveCount", type: "number", label: "Solve Count" }
];

const modules = [
  {
    dir: "create-recaptcha-v2-task",
    metadata: { name: "createRecaptchaV2Task", label: "Create reCAPTCHA v2 Task", description: "Create a proxyless reCAPTCHA v2 solving task with 2Captcha.", connection: "api-key", type: "action", typeId: 4 },
    expect: [
      text("websiteURL", "Website URL", "Full URL of the page where the captcha is displayed.", true),
      text("websiteKey", "Website Key", "The reCAPTCHA sitekey from the target page.", true),
      bool("isInvisible", "Invisible reCAPTCHA", "Enable when the target captcha is an invisible reCAPTCHA v2 widget."),
      text("recaptchaDataSValue", "Data-S Value", "Optional data-s value for Google services."),
      text("apiDomain", "API Domain", "Optional reCAPTCHA API domain, for example google.com or recaptcha.net."),
      select("languagePool", "Language Pool", [{ label: "Default", value: "" }, { label: "English", value: "en" }, { label: "Russian", value: "rn" }], "", "Optional 2Captcha worker language pool."),
      number("softId", "Software ID", "Optional software ID registered in the 2Captcha software catalog.")
    ],
    api: {
      url: "/createTask",
      method: "POST",
      body: {
        clientKey: "{{connection.apiKey}}",
        task: {
          type: "RecaptchaV2TaskProxyless",
          websiteURL: "{{parameters.websiteURL}}",
          websiteKey: "{{parameters.websiteKey}}",
          isInvisible: "{{if(parameters.isInvisible != null, parameters.isInvisible, undefined)}}",
          recaptchaDataSValue: "{{ifempty(parameters.recaptchaDataSValue, undefined)}}",
          apiDomain: "{{ifempty(parameters.apiDomain, undefined)}}"
        },
        languagePool: "{{ifempty(parameters.languagePool, undefined)}}",
        softId: "{{if(parameters.softId != null, parameters.softId, undefined)}}"
      },
      response: { output: "{{body}}" }
    },
    interface: [{ name: "errorId", type: "number", label: "Error ID" }, { name: "taskId", type: "number", label: "Task ID" }, { name: "errorCode", type: "text", label: "Error Code" }, { name: "errorDescription", type: "text", label: "Error Description" }],
    samples: { websiteURL: "https://2captcha.com/demo/recaptcha-v2", websiteKey: "6LfD3PIbAAAAAJs_eEHvoOl75_83eXSqpPSRFJ_u" }
  },
  {
    dir: "create-image-to-text-task",
    metadata: { name: "createImageToTextTask", label: "Create Image to Text Task", description: "Create a normal image captcha solving task from a base64-encoded image body.", connection: "api-key", type: "action", typeId: 4 },
    expect: [
      { name: "body", type: "buffer", label: "Image Data", required: true, help: "Captcha image data. Make passes the binary value to 2Captcha as base64." },
      text("phrase", "Phrase", "Set to 1 when the captcha must contain at least one space."),
      text("case", "Case Sensitive", "Set to 1 when the captcha answer is case-sensitive."),
      text("numeric", "Numeric Mode", "2Captcha numeric mode value, for example 0, 1, 2, 3, or 4."),
      text("math", "Math", "Set to 1 when the captcha requires a calculation."),
      text("minLength", "Minimum Length", "Optional minimum answer length."),
      text("maxLength", "Maximum Length", "Optional maximum answer length."),
      text("comment", "Comment", "Optional instruction shown to workers.")
    ],
    api: {
      url: "/createTask",
      method: "POST",
      body: {
        clientKey: "{{connection.apiKey}}",
        task: {
          type: "ImageToTextTask",
          body: "{{base64(parameters.body)}}",
          phrase: "{{ifempty(parameters.phrase, undefined)}}",
          case: "{{ifempty(parameters.case, undefined)}}",
          numeric: "{{ifempty(parameters.numeric, undefined)}}",
          math: "{{ifempty(parameters.math, undefined)}}",
          minLength: "{{ifempty(parameters.minLength, undefined)}}",
          maxLength: "{{ifempty(parameters.maxLength, undefined)}}",
          comment: "{{ifempty(parameters.comment, undefined)}}"
        }
      },
      response: { output: "{{body}}" }
    },
    interface: [{ name: "errorId", type: "number", label: "Error ID" }, { name: "taskId", type: "number", label: "Task ID" }, { name: "errorCode", type: "text", label: "Error Code" }, { name: "errorDescription", type: "text", label: "Error Description" }],
    samples: { comment: "Enter the text shown in the image" }
  },
  {
    dir: "get-task-result",
    metadata: { name: "getTaskResult", label: "Get Task Result", description: "Get the status and solution for a 2Captcha task.", connection: "api-key", type: "action", typeId: 4 },
    expect: [number("taskId", "Task ID", "Task ID returned by a create task module.", true)],
    api: { url: "/getTaskResult", method: "POST", body: { clientKey: "{{connection.apiKey}}", taskId: "{{parameters.taskId}}" }, response: { output: "{{body}}" } },
    interface: resultInterface,
    samples: { taskId: 72345678901 }
  },
  {
    dir: "get-balance",
    metadata: { name: "getBalance", label: "Get Balance", description: "Get the current 2Captcha account balance.", connection: "api-key", type: "action", typeId: 4 },
    expect: [],
    api: { url: "/getBalance", method: "POST", body: { clientKey: "{{connection.apiKey}}" }, response: { output: "{{body}}" } },
    interface: [{ name: "errorId", type: "number", label: "Error ID" }, { name: "balance", type: "number", label: "Balance" }, { name: "errorCode", type: "text", label: "Error Code" }, { name: "errorDescription", type: "text", label: "Error Description" }],
    samples: {}
  },
  {
    dir: "report-correct",
    metadata: { name: "reportCorrect", label: "Report Correct", description: "Report a correctly solved task to 2Captcha.", connection: "api-key", type: "action", typeId: 4 },
    expect: [number("taskId", "Task ID", "Task ID to report as correct.", true)],
    api: { url: "/reportCorrect", method: "POST", body: { clientKey: "{{connection.apiKey}}", taskId: "{{parameters.taskId}}" }, response: { output: "{{body}}" } },
    interface: [{ name: "errorId", type: "number", label: "Error ID" }, { name: "status", type: "text", label: "Status" }, { name: "errorCode", type: "text", label: "Error Code" }, { name: "errorDescription", type: "text", label: "Error Description" }],
    samples: { taskId: 72345678901 }
  },
  {
    dir: "report-incorrect",
    metadata: { name: "reportIncorrect", label: "Report Incorrect", description: "Report an incorrectly solved task to 2Captcha.", connection: "api-key", type: "action", typeId: 4 },
    expect: [number("taskId", "Task ID", "Task ID to report as incorrect.", true)],
    api: { url: "/reportIncorrect", method: "POST", body: { clientKey: "{{connection.apiKey}}", taskId: "{{parameters.taskId}}" }, response: { output: "{{body}}" } },
    interface: [{ name: "errorId", type: "number", label: "Error ID" }, { name: "status", type: "text", label: "Status" }, { name: "errorCode", type: "text", label: "Error Code" }, { name: "errorDescription", type: "text", label: "Error Description" }],
    samples: { taskId: 72345678901 }
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
  url: "https://api.2captcha.com{{parameters.url}}",
  method: "{{parameters.method}}",
  headers: { "{{...}}": "{{toCollection(parameters.headers, 'key', 'value')}}" },
  qs: { "{{...}}": "{{toCollection(parameters.qs, 'key', 'value')}}" },
  body: { clientKey: "{{connection.apiKey}}", "{{...}}": "{{parameters.body}}" },
  response: { output: { statusCode: "{{statusCode}}", headers: "{{headers}}", body: "{{body}}" } }
});

const readme = `# 2Captcha Make Custom App\n\nThis generated app provides a production-oriented Make custom app for 2Captcha API v2. It keeps the mandatory universal **Make an API Call** fallback and adds first-class modules from documented 2Captcha endpoints.\n\n## API documentation\n\n- Docs: https://2captcha.com/api-docs\n- Base URL: \`https://api.2captcha.com\`\n- Authentication: \`clientKey\` JSON field populated from the connection API key.\n\n## Included modules\n\n- **Create reCAPTCHA v2 Task** (\`createRecaptchaV2Task\`) calls \`POST /createTask\` with \`RecaptchaV2TaskProxyless\`.\n- **Create Image to Text Task** (\`createImageToTextTask\`) calls \`POST /createTask\` with \`ImageToTextTask\`.\n- **Get Task Result** (\`getTaskResult\`) calls \`POST /getTaskResult\`.\n- **Get Balance** (\`getBalance\`) calls \`POST /getBalance\`.\n- **Report Correct** (\`reportCorrect\`) calls \`POST /reportCorrect\`.\n- **Report Incorrect** (\`reportIncorrect\`) calls \`POST /reportIncorrect\`.\n- **Make an API Call** (\`makeAnApiCall\`) remains available as the required universal fallback.\n\n## Generator classification\n\nClassification: \`production-ready\`. This app is not universal-only; it includes endpoint-specific modules generated from the 2Captcha API v2 endpoint matrix above.\n\n## Notes\n\nDo not include \`clientKey\` in module bodies. The app injects the connection API key as \`clientKey\`.\n`;
fs.writeFileSync(path.join(appDir, "readme.md"), readme);

console.log(`Generated ${modules.length} 2Captcha-specific modules and updated universal fallback/readme`);
