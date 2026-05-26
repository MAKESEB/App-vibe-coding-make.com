#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const appDir = path.join(root, "apps/ably");
const modulesDir = path.join(appDir, "modules");

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function textParam(name, label, help, required = false) {
  return { name, type: "text", label, ...(required ? { required: true } : {}), ...(help ? { help } : {}) };
}

function numberParam(name, label, help, defaultValue) {
  return { name, type: "uinteger", label, ...(defaultValue !== undefined ? { default: defaultValue } : {}), ...(help ? { help } : {}) };
}

function selectParam(name, label, options, defaultValue, help) {
  return { name, type: "select", label, options, ...(defaultValue ? { default: defaultValue } : {}), ...(help ? { help } : {}) };
}

const messageInterface = [
  { name: "id", type: "text", label: "ID" },
  { name: "name", type: "text", label: "Event Name" },
  { name: "data", type: "any", label: "Data" },
  { name: "clientId", type: "text", label: "Client ID" },
  { name: "connectionId", type: "text", label: "Connection ID" },
  { name: "encoding", type: "text", label: "Encoding" },
  { name: "extras", type: "collection", label: "Extras" },
  { name: "timestamp", type: "date", label: "Timestamp" }
];

const presenceInterface = [
  { name: "id", type: "text", label: "ID" },
  { name: "clientId", type: "text", label: "Client ID" },
  { name: "connectionId", type: "text", label: "Connection ID" },
  { name: "action", type: "text", label: "Action" },
  { name: "data", type: "any", label: "Data" },
  { name: "encoding", type: "text", label: "Encoding" },
  { name: "timestamp", type: "date", label: "Timestamp" }
];

const statsInterface = [
  { name: "intervalId", type: "text", label: "Interval ID" },
  { name: "unit", type: "text", label: "Unit" },
  { name: "count", type: "number", label: "Count" },
  { name: "inbound", type: "collection", label: "Inbound" },
  { name: "outbound", type: "collection", label: "Outbound" },
  { name: "persisted", type: "collection", label: "Persisted" },
  { name: "connections", type: "collection", label: "Connections" },
  { name: "channels", type: "collection", label: "Channels" },
  { name: "apiRequests", type: "collection", label: "API Requests" },
  { name: "tokenRequests", type: "collection", label: "Token Requests" }
];

const modules = [
  {
    dir: "publish-message",
    metadata: {
      name: "publishMessage",
      label: "Publish a Message",
      description: "Publish one message to an Ably channel using the REST publish endpoint.",
      connection: "api-key",
      type: "action",
      typeId: 4
    },
    expect: [
      textParam("channelName", "Channel Name", "Ably channel name to publish to.", true),
      textParam("name", "Event Name", "Optional Ably message name/event type."),
      { name: "data", type: "any", label: "Data", required: true, help: "Message payload. Use text, JSON, number, boolean, or another Make value." },
      textParam("clientId", "Client ID", "Optional client ID associated with this message."),
      { name: "extras", type: "collection", label: "Extras", help: "Optional Ably message extras object." }
    ],
    api: {
      url: "/channels/{{parameters.channelName}}/messages",
      method: "POST",
      body: {
        name: "{{ifempty(parameters.name, undefined)}}",
        data: "{{parameters.data}}",
        clientId: "{{ifempty(parameters.clientId, undefined)}}",
        extras: "{{if(parameters.extras != null, parameters.extras, undefined)}}"
      },
      response: { output: "{{body}}" }
    },
    interface: messageInterface,
    samples: { channelName: "orders", name: "created", data: { orderId: "ord_123" } }
  },
  {
    dir: "search-message-history",
    metadata: {
      name: "searchMessageHistory",
      label: "Search Message History",
      description: "Retrieve persisted message history for an Ably channel.",
      connection: "api-key",
      type: "search",
      typeId: 9
    },
    expect: [
      textParam("channelName", "Channel Name", "Ably channel name to read history from.", true),
      selectParam("direction", "Direction", [{ label: "Backwards", value: "backwards" }, { label: "Forwards", value: "forwards" }], "backwards", "Ably history direction."),
      textParam("start", "Start", "Optional start timestamp in milliseconds since epoch."),
      textParam("end", "End", "Optional end timestamp in milliseconds since epoch."),
      numberParam("limit", "Limit", "Maximum messages to return. Ably supports up to 1000 per request.", 100)
    ],
    api: {
      url: "/channels/{{parameters.channelName}}/messages",
      method: "GET",
      qs: {
        direction: "{{ifempty(parameters.direction, 'backwards')}}",
        start: "{{ifempty(parameters.start, undefined)}}",
        end: "{{ifempty(parameters.end, undefined)}}",
        limit: "{{if(parameters.limit < 1000, parameters.limit, 1000)}}"
      },
      response: { iterate: "{{body}}", output: "{{item}}", limit: "{{parameters.limit}}" }
    },
    interface: messageInterface,
    samples: { channelName: "orders", direction: "backwards", limit: 25 }
  },
  {
    dir: "search-presence-members",
    metadata: {
      name: "searchPresenceMembers",
      label: "Search Presence Members",
      description: "Retrieve current presence members for an Ably channel.",
      connection: "api-key",
      type: "search",
      typeId: 9
    },
    expect: [
      textParam("channelName", "Channel Name", "Ably channel name to read presence from.", true),
      textParam("clientId", "Client ID", "Optional client ID filter."),
      textParam("connectionId", "Connection ID", "Optional connection ID filter."),
      numberParam("limit", "Limit", "Maximum presence members to return.", 100)
    ],
    api: {
      url: "/channels/{{parameters.channelName}}/presence",
      method: "GET",
      qs: {
        clientId: "{{ifempty(parameters.clientId, undefined)}}",
        connectionId: "{{ifempty(parameters.connectionId, undefined)}}",
        limit: "{{parameters.limit}}"
      },
      response: { iterate: "{{body}}", output: "{{item}}", limit: "{{parameters.limit}}" }
    },
    interface: presenceInterface,
    samples: { channelName: "orders", limit: 25 }
  },
  {
    dir: "search-stats",
    metadata: {
      name: "searchStats",
      label: "Search Statistics",
      description: "Retrieve Ably application usage statistics.",
      connection: "api-key",
      type: "search",
      typeId: 9
    },
    expect: [
      selectParam("unit", "Unit", [{ label: "Minute", value: "minute" }, { label: "Hour", value: "hour" }, { label: "Day", value: "day" }, { label: "Month", value: "month" }], "minute", "Stats interval unit."),
      selectParam("direction", "Direction", [{ label: "Backwards", value: "backwards" }, { label: "Forwards", value: "forwards" }], "backwards", "Stats pagination direction."),
      textParam("start", "Start", "Optional start timestamp in milliseconds since epoch."),
      textParam("end", "End", "Optional end timestamp in milliseconds since epoch."),
      numberParam("limit", "Limit", "Maximum statistics intervals to return. Ably supports up to 1000 per request.", 100)
    ],
    api: {
      url: "/stats",
      method: "GET",
      qs: {
        unit: "{{ifempty(parameters.unit, 'minute')}}",
        direction: "{{ifempty(parameters.direction, 'backwards')}}",
        start: "{{ifempty(parameters.start, undefined)}}",
        end: "{{ifempty(parameters.end, undefined)}}",
        limit: "{{if(parameters.limit < 1000, parameters.limit, 1000)}}"
      },
      response: { iterate: "{{body}}", output: "{{item}}", limit: "{{parameters.limit}}" }
    },
    interface: statsInterface,
    samples: { unit: "minute", direction: "backwards", limit: 25 }
  },
  {
    dir: "get-server-time",
    metadata: {
      name: "getServerTime",
      label: "Get Server Time",
      description: "Retrieve the current Ably server time.",
      connection: "api-key",
      type: "action",
      typeId: 4
    },
    expect: [],
    api: { url: "/time", method: "GET", response: { output: { timestamp: "{{body[0] || body}}" } } },
    interface: [{ name: "timestamp", type: "date", label: "Timestamp" }],
    samples: {}
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

const readme = `# Ably Make Custom App\n\nThis generated app provides a production-oriented Make custom app for Ably's REST API. It keeps the mandatory universal **Make an API Call** fallback and adds first-class modules from documented Ably REST endpoints.\n\n## API documentation\n\n- REST API docs: https://ably.com/docs/api/rest-api\n- Base URL: \`https://rest.ably.io\`\n- Authentication: HTTP Basic auth with the Ably API key name as username and key secret as password.\n\n## Included modules\n\n- **Publish a Message** (\`publishMessage\`) calls \`POST /channels/{channelName}/messages\`.\n- **Search Message History** (\`searchMessageHistory\`) calls \`GET /channels/{channelName}/messages\`.\n- **Search Presence Members** (\`searchPresenceMembers\`) calls \`GET /channels/{channelName}/presence\`.\n- **Search Statistics** (\`searchStats\`) calls \`GET /stats\`.\n- **Get Server Time** (\`getServerTime\`) calls \`GET /time\`.\n- **Make an API Call** (\`makeAnApiCall\`) remains available as the required universal fallback.\n\n## Generator classification\n\nClassification: \`production-ready\`. This app is not universal-only; it includes endpoint-specific modules generated from the Ably REST endpoint matrix above.\n\n## Notes\n\nCreate an Ably API key in the Ably dashboard and split it at the first colon. Use the part before the colon as **API Key Name** and the part after the colon as **API Key Secret**.\n`;
fs.writeFileSync(path.join(appDir, "readme.md"), readme);

console.log(`Generated ${modules.length} Ably-specific modules and updated apps/ably/readme.md`);
