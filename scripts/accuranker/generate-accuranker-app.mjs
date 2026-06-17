#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const appDir = path.join(root, "apps/accuranker");
const modulesDir = path.join(appDir, "modules");

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}
function text(name, label, help, required = false) { return { name, type: "text", label, ...(required ? { required: true } : {}), ...(help ? { help } : {}) }; }
function number(name, label, help, required = false) { return { name, type: "uinteger", label, ...(required ? { required: true } : {}), ...(help ? { help } : {}) }; }
function bool(name, label, help) { return { name, type: "boolean", label, ...(help ? { help } : {}) }; }
function arrayText(name, label, help, required = false) { return { name, type: "array", label, ...(required ? { required: true } : {}), spec: { type: "text", label: "Value" }, ...(help ? { help } : {}) }; }
function collection(name, label, help, required = false) { return { name, type: "collection", label, ...(required ? { required: true } : {}), ...(help ? { help } : {}) }; }

const messageInterface = [{ name: "message", type: "text", label: "Message" }];
const jobInterface = [{ name: "id", type: "text", label: "Job ID" }, { name: "status", type: "text", label: "Status" }, { name: "message", type: "text", label: "Message" }];
const groupInterface = [{ name: "id", type: "number", label: "ID" }, { name: "name", type: "text", label: "Name" }, { name: "account_id", type: "number", label: "Account ID" }, { name: "domains", type: "array", label: "Domains" }];
const domainInterface = [{ name: "id", type: "number", label: "ID" }, { name: "domain", type: "text", label: "Domain" }, { name: "display_name", type: "text", label: "Display Name" }, { name: "group_id", type: "number", label: "Group ID" }, { name: "include_subdomains", type: "boolean", label: "Include Subdomains" }, { name: "exact_match", type: "boolean", label: "Exact Match" }];
const keywordInterface = [{ name: "id", type: "number", label: "ID" }, { name: "keyword", type: "text", label: "Keyword" }, { name: "country", type: "text", label: "Country" }, { name: "language", type: "text", label: "Language" }, { name: "location", type: "text", label: "Location" }, { name: "search_engine", type: "text", label: "Search Engine" }, { name: "search_type", type: "text", label: "Search Type" }];
const brandInterface = [{ name: "id", type: "number", label: "ID" }, { name: "domain", type: "text", label: "Domain" }, { name: "display_name", type: "text", label: "Display Name" }, { name: "group_id", type: "number", label: "Group ID" }, { name: "brand_list", type: "array", label: "Brands" }];

const modules = [
  {
    dir: "search-group-domains",
    metadata: { name: "searchGroupDomains", label: "Search Group Domains", description: "List AccuRanker groups and their domains.", connection: "api-key", type: "search", typeId: 9 },
    expect: [bool("includeSubaccounts", "Include Subaccounts", "Include subaccount groups when the API key has access."), number("limit", "Limit", "Maximum groups to return.", true)],
    api: { url: "/overview/group_domains", method: "GET", qs: { include_subaccounts: "{{if(parameters.includeSubaccounts != null, parameters.includeSubaccounts, undefined)}}" }, response: { iterate: "{{body.accounts || body.groups || body}}", output: "{{item}}", limit: "{{parameters.limit}}" } },
    interface: groupInterface,
    samples: { includeSubaccounts: false, limit: 100 }
  },
  {
    dir: "search-keywords-for-domain",
    metadata: { name: "searchKeywordsForDomain", label: "Search Keywords for Domain", description: "List keywords configured for an AccuRanker domain.", connection: "api-key", type: "search", typeId: 9 },
    expect: [number("domainId", "Domain ID", "AccuRanker domain ID.", true), text("keywordContains", "Keyword Contains", "Optional keyword text filter."), number("limit", "Limit", "Maximum keywords to return.", true)],
    api: { url: "/overview/keywords_for_domain/{{parameters.domainId}}", method: "GET", qs: { keyword_contains: "{{ifempty(parameters.keywordContains, undefined)}}" }, response: { iterate: "{{body.keywords || body}}", output: "{{item}}", limit: "{{parameters.limit}}" } },
    interface: keywordInterface,
    samples: { domainId: 12345, keywordContains: "brand", limit: 100 }
  },
  {
    dir: "create-group",
    metadata: { name: "createGroup", label: "Create Group", description: "Create an AccuRanker group.", connection: "api-key", type: "action", typeId: 4 },
    expect: [text("name", "Name", "Group name.", true), number("accountId", "Account ID", "Optional account ID for multi-account setups.")],
    api: { url: "/group/", method: "POST", body: { name: "{{parameters.name}}", account_id: "{{if(parameters.accountId != null, parameters.accountId, undefined)}}" }, response: { output: "{{body}}" } },
    interface: groupInterface,
    samples: { name: "SEO Projects" }
  },
  {
    dir: "update-group",
    metadata: { name: "updateGroup", label: "Update Group", description: "Update an AccuRanker group.", connection: "api-key", type: "action", typeId: 4 },
    expect: [number("groupId", "Group ID", "Group ID to update.", true), text("name", "Name", "Updated group name."), number("accountId", "Account ID", "Updated account ID.")],
    api: { url: "/group/{{parameters.groupId}}", method: "PUT", body: { name: "{{ifempty(parameters.name, undefined)}}", account_id: "{{if(parameters.accountId != null, parameters.accountId, undefined)}}" }, response: { output: "{{body}}" } },
    interface: groupInterface,
    samples: { groupId: 12345, name: "Updated SEO Projects" }
  },
  {
    dir: "delete-group",
    metadata: { name: "deleteGroup", label: "Delete Group", description: "Delete an AccuRanker group.", connection: "api-key", type: "action", typeId: 4 },
    expect: [number("groupId", "Group ID", "Group ID to delete.", true)],
    api: { url: "/group/{{parameters.groupId}}", method: "DELETE", response: { output: "{{body}}" } },
    interface: messageInterface,
    samples: { groupId: 12345 }
  },
  {
    dir: "create-domain",
    metadata: { name: "createDomain", label: "Create Domain", description: "Create an AccuRanker domain.", connection: "api-key", type: "action", typeId: 4 },
    expect: [text("domain", "Domain", "Domain name, for example example.org.", true), number("groupId", "Group ID", "Group ID for the domain.", true), text("displayName", "Display Name", "Optional display name."), bool("includeSubdomains", "Include Subdomains"), bool("exactMatch", "Exact Match"), arrayText("defaultSearchsettingsNames", "Default Search Settings Names", "Default search setting names to apply."), collection("extraFields", "Extra Fields", "Optional advanced fields from the AccuRanker DomainSchemaValidated schema.")],
    api: { url: "/domain/", method: "POST", body: { domain: "{{parameters.domain}}", group_id: "{{parameters.groupId}}", display_name: "{{ifempty(parameters.displayName, undefined)}}", include_subdomains: "{{if(parameters.includeSubdomains != null, parameters.includeSubdomains, undefined)}}", exact_match: "{{if(parameters.exactMatch != null, parameters.exactMatch, undefined)}}", default_searchsettings_names: "{{if(parameters.defaultSearchsettingsNames != null, parameters.defaultSearchsettingsNames, undefined)}}", "{{...}}": "{{parameters.extraFields}}" }, response: { output: "{{body}}" } },
    interface: domainInterface,
    samples: { domain: "example.org", groupId: 12345 }
  },
  {
    dir: "update-domain",
    metadata: { name: "updateDomain", label: "Update Domain", description: "Update an AccuRanker domain.", connection: "api-key", type: "action", typeId: 4 },
    expect: [number("domainId", "Domain ID", "Domain ID to update.", true), text("domain", "Domain", "Updated domain name."), number("groupId", "Group ID", "Updated group ID."), text("displayName", "Display Name"), bool("includeSubdomains", "Include Subdomains"), bool("exactMatch", "Exact Match"), collection("extraFields", "Extra Fields", "Optional advanced fields from the AccuRanker DomainSchemaUpdateValidated schema.")],
    api: { url: "/domain/{{parameters.domainId}}", method: "PUT", body: { domain: "{{ifempty(parameters.domain, undefined)}}", group_id: "{{if(parameters.groupId != null, parameters.groupId, undefined)}}", display_name: "{{ifempty(parameters.displayName, undefined)}}", include_subdomains: "{{if(parameters.includeSubdomains != null, parameters.includeSubdomains, undefined)}}", exact_match: "{{if(parameters.exactMatch != null, parameters.exactMatch, undefined)}}", "{{...}}": "{{parameters.extraFields}}" }, response: { output: "{{body}}" } },
    interface: domainInterface,
    samples: { domainId: 12345, displayName: "Example" }
  },
  {
    dir: "delete-domain",
    metadata: { name: "deleteDomain", label: "Delete Domain", description: "Delete an AccuRanker domain.", connection: "api-key", type: "action", typeId: 4 },
    expect: [number("domainId", "Domain ID", "Domain ID to delete.", true)],
    api: { url: "/domain/{{parameters.domainId}}", method: "DELETE", response: { output: "{{body}}" } },
    interface: messageInterface,
    samples: { domainId: 12345 }
  },
  {
    dir: "create-keywords",
    metadata: { name: "createKeywords", label: "Create Keywords", description: "Create one or more AccuRanker keywords.", connection: "api-key", type: "action", typeId: 4 },
    expect: [number("domainId", "Domain ID", "Domain ID.", true), arrayText("keywords", "Keywords", "Keywords to create.", true), arrayText("tags", "Tags", "Optional keyword tags."), text("description", "Description"), bool("starred", "Starred"), bool("ignoreLocalResults", "Ignore Local Results"), bool("ignoreFeaturedSnippet", "Ignore Featured Snippet"), bool("ignoreInShareOfVoice", "Ignore in Share of Voice"), bool("enableAutocorrect", "Enable Autocorrect"), collection("searchsettings", "Search Settings", "Optional SearchSettings object from the API schema.")],
    api: { url: "/keyword/", method: "POST", body: { domain_id: "{{parameters.domainId}}", keywords: "{{parameters.keywords}}", tags: "{{if(parameters.tags != null, parameters.tags, undefined)}}", description: "{{ifempty(parameters.description, undefined)}}", starred: "{{if(parameters.starred != null, parameters.starred, undefined)}}", ignore_local_results: "{{if(parameters.ignoreLocalResults != null, parameters.ignoreLocalResults, undefined)}}", ignore_featured_snippet: "{{if(parameters.ignoreFeaturedSnippet != null, parameters.ignoreFeaturedSnippet, undefined)}}", ignore_in_share_of_voice: "{{if(parameters.ignoreInShareOfVoice != null, parameters.ignoreInShareOfVoice, undefined)}}", enable_autocorrect: "{{if(parameters.enableAutocorrect != null, parameters.enableAutocorrect, undefined)}}", searchsettings: "{{if(parameters.searchsettings != null, parameters.searchsettings, undefined)}}" }, response: { output: "{{body}}" } },
    interface: jobInterface,
    samples: { domainId: 12345, keywords: ["rank tracker", "seo reporting"] }
  },
  {
    dir: "update-keywords",
    metadata: { name: "updateKeywords", label: "Update Keywords", description: "Update settings for one or more AccuRanker keywords.", connection: "api-key", type: "action", typeId: 4 },
    expect: [number("domainId", "Domain ID", "Domain ID.", true), arrayText("keywordIds", "Keyword IDs", "Keyword IDs to update.", true), arrayText("tags", "Tags"), text("description", "Description"), bool("starred", "Starred"), bool("ignoreLocalResults", "Ignore Local Results"), bool("ignoreFeaturedSnippet", "Ignore Featured Snippet"), bool("ignoreInShareOfVoice", "Ignore in Share of Voice"), bool("enableAutocorrect", "Enable Autocorrect")],
    api: { url: "/keyword/", method: "PUT", body: { domain_id: "{{parameters.domainId}}", keyword_ids: "{{parameters.keywordIds}}", tags: "{{if(parameters.tags != null, parameters.tags, undefined)}}", description: "{{ifempty(parameters.description, undefined)}}", starred: "{{if(parameters.starred != null, parameters.starred, undefined)}}", ignore_local_results: "{{if(parameters.ignoreLocalResults != null, parameters.ignoreLocalResults, undefined)}}", ignore_featured_snippet: "{{if(parameters.ignoreFeaturedSnippet != null, parameters.ignoreFeaturedSnippet, undefined)}}", ignore_in_share_of_voice: "{{if(parameters.ignoreInShareOfVoice != null, parameters.ignoreInShareOfVoice, undefined)}}", enable_autocorrect: "{{if(parameters.enableAutocorrect != null, parameters.enableAutocorrect, undefined)}}" }, response: { output: "{{body}}" } },
    interface: jobInterface,
    samples: { domainId: 12345, keywordIds: ["123", "456"] }
  },
  {
    dir: "delete-keywords",
    metadata: { name: "deleteKeywords", label: "Delete Keywords", description: "Delete one or more AccuRanker keywords.", connection: "api-key", type: "action", typeId: 4 },
    expect: [arrayText("keywordIds", "Keyword IDs", "Keyword IDs to delete.", true)],
    api: { url: "/keyword/", method: "DELETE", body: { keyword_ids: "{{parameters.keywordIds}}" }, response: { output: "{{body}}" } },
    interface: messageInterface,
    samples: { keywordIds: ["123", "456"] }
  },
  {
    dir: "get-keyword-job-status",
    metadata: { name: "getKeywordJobStatus", label: "Get Keyword Job Status", description: "Get the status of an AccuRanker keyword job.", connection: "api-key", type: "action", typeId: 4 },
    expect: [text("jobId", "Job ID", "Keyword job ID returned by a keyword operation.", true)],
    api: { url: "/status/keyword_job/{{parameters.jobId}}", method: "GET", response: { output: "{{body}}" } },
    interface: jobInterface,
    samples: { jobId: "job_123" }
  },
  {
    dir: "create-brand",
    metadata: { name: "createBrand", label: "Create Brand", description: "Create an AccuRanker AI brand.", connection: "api-key", type: "action", typeId: 4 },
    expect: [text("domain", "Domain", "Brand domain.", true), number("groupId", "Group ID", "Group ID.", true), text("displayName", "Display Name"), arrayText("brandList", "Brand List", "Brand names.", true), bool("exactMatch", "Exact Match"), text("defaultCountrylocale", "Default Country Locale", "AccuRanker country locale ID or name.")],
    api: { url: "/brand/", method: "POST", body: { domain: "{{parameters.domain}}", group_id: "{{parameters.groupId}}", display_name: "{{ifempty(parameters.displayName, undefined)}}", brand_list: "{{parameters.brandList}}", exact_match: "{{if(parameters.exactMatch != null, parameters.exactMatch, undefined)}}", default_countrylocale: "{{ifempty(parameters.defaultCountrylocale, undefined)}}" }, response: { output: "{{body}}" } },
    interface: brandInterface,
    samples: { domain: "example.org", groupId: 12345, brandList: ["Example"] }
  },
  {
    dir: "update-brand",
    metadata: { name: "updateBrand", label: "Update Brand", description: "Update an AccuRanker AI brand.", connection: "api-key", type: "action", typeId: 4 },
    expect: [number("brandId", "Brand ID", "Brand ID to update.", true), text("domain", "Domain"), number("groupId", "Group ID"), text("displayName", "Display Name"), arrayText("brandList", "Brand List"), bool("exactMatch", "Exact Match"), text("defaultCountrylocale", "Default Country Locale")],
    api: { url: "/brand/{{parameters.brandId}}", method: "PUT", body: { domain: "{{ifempty(parameters.domain, undefined)}}", group_id: "{{if(parameters.groupId != null, parameters.groupId, undefined)}}", display_name: "{{ifempty(parameters.displayName, undefined)}}", brand_list: "{{if(parameters.brandList != null, parameters.brandList, undefined)}}", exact_match: "{{if(parameters.exactMatch != null, parameters.exactMatch, undefined)}}", default_countrylocale: "{{ifempty(parameters.defaultCountrylocale, undefined)}}" }, response: { output: "{{body}}" } },
    interface: brandInterface,
    samples: { brandId: 12345, brandList: ["Example"] }
  },
  {
    dir: "delete-brand",
    metadata: { name: "deleteBrand", label: "Delete Brand", description: "Delete an AccuRanker AI brand.", connection: "api-key", type: "action", typeId: 4 },
    expect: [number("brandId", "Brand ID", "Brand ID to delete.", true)],
    api: { url: "/brand/{{parameters.brandId}}", method: "DELETE", response: { output: "{{body}}" } },
    interface: messageInterface,
    samples: { brandId: 12345 }
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
  url: "https://app.accuranker.com/api/v4{{parameters.url}}",
  method: "{{parameters.method}}",
  headers: { "{{...}}": "{{toCollection(parameters.headers, 'key', 'value')}}" },
  qs: { "{{...}}": "{{toCollection(parameters.qs, 'key', 'value')}}" },
  body: "{{parameters.body}}",
  response: { output: { statusCode: "{{statusCode}}", headers: "{{headers}}", body: "{{body}}" } }
});

const readme = `# AccuRanker Make Custom App\n\nThis generated app provides a production-oriented Make custom app for the AccuRanker Write API. It keeps the mandatory universal **Make an API Call** fallback and adds first-class modules from the documented OpenAPI endpoint matrix.\n\n## API documentation\n\n- OpenAPI spec: https://app.accuranker.com/api/v4/openapi.json\n- Base URL: \`https://app.accuranker.com/api/v4\`\n- Authentication: \`Authorization: Token <api key>\` header populated from the connection API key.\n\n## Included modules\n\n- **Search Group Domains** (\`searchGroupDomains\`) calls \`GET /overview/group_domains\`.\n- **Search Keywords for Domain** (\`searchKeywordsForDomain\`) calls \`GET /overview/keywords_for_domain/{domainId}\`.\n- **Create Group**, **Update Group**, **Delete Group**.\n- **Create Domain**, **Update Domain**, **Delete Domain**.\n- **Create Keywords**, **Update Keywords**, **Delete Keywords**, and **Get Keyword Job Status**.\n- **Create Brand**, **Update Brand**, **Delete Brand**.\n- **Make an API Call** (\`makeAnApiCall\`) remains available as the required universal fallback.\n\n## Generator classification\n\nClassification: \`production-ready\`. This app is not universal-only; it includes endpoint-specific modules generated from AccuRanker's OpenAPI endpoint matrix.\n\n## Notes\n\nDo not add \`Authorization\` in module headers; the app sends the Token header from the connection. Some complex create/update modules expose an **Extra Fields** collection so advanced OpenAPI schema fields can be passed without losing the first-class endpoint module.\n`;
fs.writeFileSync(path.join(appDir, "readme.md"), readme);
console.log(`Generated ${modules.length} AccuRanker-specific modules and updated universal fallback/readme`);
