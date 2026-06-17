#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const appDir = path.join(root, "apps/abuselpdb");
const modulesDir = path.join(appDir, "modules");

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}
function text(name, label, help, required = false) { return { name, type: "text", label, ...(required ? { required: true } : {}), ...(help ? { help } : {}) }; }
function number(name, label, help, required = false, def) { return { name, type: "uinteger", label, ...(required ? { required: true } : {}), ...(def !== undefined ? { default: def } : {}), ...(help ? { help } : {}) }; }
function bool(name, label, help) { return { name, type: "boolean", label, ...(help ? { help } : {}) }; }

const checkInterface = [
  { name: "ipAddress", type: "text", label: "IP Address" },
  { name: "isPublic", type: "boolean", label: "Is Public" },
  { name: "ipVersion", type: "number", label: "IP Version" },
  { name: "isWhitelisted", type: "boolean", label: "Is Whitelisted" },
  { name: "abuseConfidenceScore", type: "number", label: "Abuse Confidence Score" },
  { name: "countryCode", type: "text", label: "Country Code" },
  { name: "usageType", type: "text", label: "Usage Type" },
  { name: "isp", type: "text", label: "ISP" },
  { name: "domain", type: "text", label: "Domain" },
  { name: "hostnames", type: "array", label: "Hostnames", spec: { type: "text" } },
  { name: "totalReports", type: "number", label: "Total Reports" },
  { name: "numDistinctUsers", type: "number", label: "Distinct Users" },
  { name: "lastReportedAt", type: "date", label: "Last Reported At" }
];
const simpleResult = [
  { name: "data", type: "collection", label: "Data" },
  { name: "errors", type: "array", label: "Errors" }
];

const modules = [
  {
    dir: "check-ip-address",
    metadata: { name: "checkIpAddress", label: "Check IP Address", description: "Check an IP address against AbuseIPDB reports.", connection: "api-key", type: "action", typeId: 4 },
    expect: [text("ipAddress", "IP Address", "IPv4 or IPv6 address to check.", true), number("maxAgeInDays", "Max Age in Days", "Only include reports within this age. AbuseIPDB supports 1-365.", true, 90), bool("verbose", "Verbose", "Include reports in the response when supported by the API.")],
    api: { url: "/check", method: "GET", qs: { ipAddress: "{{parameters.ipAddress}}", maxAgeInDays: "{{parameters.maxAgeInDays}}", verbose: "{{if(parameters.verbose, '', undefined)}}" }, response: { output: "{{body.data || body}}" } },
    interface: checkInterface,
    samples: { ipAddress: "118.25.6.39", maxAgeInDays: 90 }
  },
  {
    dir: "check-network-block",
    metadata: { name: "checkNetworkBlock", label: "Check Network Block", description: "Check a CIDR network block against AbuseIPDB reports.", connection: "api-key", type: "search", typeId: 9 },
    expect: [text("network", "Network", "CIDR network block, for example 127.0.0.1/24.", true), number("maxAgeInDays", "Max Age in Days", "Only include reports within this age.", true, 15)],
    api: { url: "/check-block", method: "GET", qs: { network: "{{parameters.network}}", maxAgeInDays: "{{parameters.maxAgeInDays}}" }, response: { iterate: "{{body.data.reportedAddress || body.data || body}}", output: "{{item}}" } },
    interface: checkInterface,
    samples: { network: "127.0.0.1/24", maxAgeInDays: 15 }
  },
  {
    dir: "search-blacklist",
    metadata: { name: "searchBlacklist", label: "Search Blacklist", description: "Retrieve the AbuseIPDB blacklist with a minimum confidence score.", connection: "api-key", type: "search", typeId: 9 },
    expect: [number("confidenceMinimum", "Confidence Minimum", "Minimum abuse confidence score.", true, 90), number("limit", "Limit", "Maximum records to return locally from the blacklist response.", true, 10000)],
    api: { url: "/blacklist", method: "GET", qs: { confidenceMinimum: "{{parameters.confidenceMinimum}}" }, response: { iterate: "{{body.data || body}}", output: "{{item}}", limit: "{{parameters.limit}}" } },
    interface: checkInterface,
    samples: { confidenceMinimum: 90, limit: 1000 }
  },
  {
    dir: "report-ip-address",
    metadata: { name: "reportIpAddress", label: "Report IP Address", description: "Report abusive activity for an IP address.", connection: "api-key", type: "action", typeId: 4 },
    expect: [text("ip", "IP Address", "IPv4 or IPv6 address to report.", true), text("categories", "Categories", "Comma-separated AbuseIPDB category IDs.", true), text("comment", "Comment", "Report comment/evidence.")],
    api: { url: "/report", method: "POST", type: "urlencoded", body: { ip: "{{parameters.ip}}", categories: "{{parameters.categories}}", comment: "{{ifempty(parameters.comment, undefined)}}" }, response: { output: "{{body.data || body}}" } },
    interface: simpleResult,
    samples: { ip: "118.25.6.39", categories: "18,22", comment: "SSH login attempts" }
  },
  {
    dir: "bulk-report-ip-addresses",
    metadata: { name: "bulkReportIpAddresses", label: "Bulk Report IP Addresses", description: "Submit AbuseIPDB bulk report CSV data.", connection: "api-key", type: "action", typeId: 4 },
    expect: [{ name: "csv", type: "buffer", label: "CSV File Data", required: true }, text("filename", "Filename", "CSV filename sent to AbuseIPDB.", false)],
    api: { url: "/bulk-report", method: "POST", type: "multipart/form-data", body: { csv: { value: "{{parameters.csv}}", options: { filename: "{{ifempty(parameters.filename, 'report.csv')}}" } } }, response: { output: "{{body}}" } },
    interface: simpleResult,
    samples: { filename: "report.csv" }
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
  url: "https://api.abuseipdb.com/api/v2{{parameters.url}}",
  method: "{{parameters.method}}",
  headers: { "{{...}}": "{{toCollection(parameters.headers, 'key', 'value')}}" },
  qs: { "{{...}}": "{{toCollection(parameters.qs, 'key', 'value')}}" },
  body: "{{parameters.body}}",
  response: { output: { statusCode: "{{statusCode}}", headers: "{{headers}}", body: "{{body}}" } }
});

const readme = `# AbuseIPDB Make Custom App\n\nThis generated app provides a production-oriented Make custom app for AbuseIPDB API v2. It keeps the mandatory universal **Make an API Call** fallback and adds first-class modules from documented AbuseIPDB endpoints.\n\n## API documentation\n\n- Docs: https://docs.abuseipdb.com/\n- Base URL: \`https://api.abuseipdb.com/api/v2\`\n- Authentication: \`Key\` header populated from the connection API key.\n\n## Included modules\n\n- **Check IP Address** (\`checkIpAddress\`) calls \`GET /check\`.\n- **Check Network Block** (\`checkNetworkBlock\`) calls \`GET /check-block\`.\n- **Search Blacklist** (\`searchBlacklist\`) calls \`GET /blacklist\`.\n- **Report IP Address** (\`reportIpAddress\`) calls \`POST /report\`.\n- **Bulk Report IP Addresses** (\`bulkReportIpAddresses\`) calls \`POST /bulk-report\`.\n- **Make an API Call** (\`makeAnApiCall\`) remains available as the required universal fallback.\n\n## Generator classification\n\nClassification: \`production-ready\`. This app is not universal-only; it includes endpoint-specific modules generated from the AbuseIPDB endpoint matrix above.\n\n## Notes\n\nDo not add \`Key\` in module headers; the app sends it from the connection. The repository folder is currently named \`abuselpdb\` to preserve the existing uploaded app slug.\n`;
fs.writeFileSync(path.join(appDir, "readme.md"), readme);
console.log(`Generated ${modules.length} AbuseIPDB-specific modules and updated universal fallback/readme`);
