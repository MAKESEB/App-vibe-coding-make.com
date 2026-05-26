#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const appDir = path.join(root, "apps/activitysmith");
const modulesDir = path.join(appDir, "modules");

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}
function text(name, label, help, required = false) { return { name, type: "text", label, ...(required ? { required: true } : {}), ...(help ? { help } : {}) }; }
function collection(name, label, help, required = false) { return { name, type: "collection", label, ...(required ? { required: true } : {}), ...(help ? { help } : {}) }; }
function bool(name, label, help) { return { name, type: "boolean", label, ...(help ? { help } : {}) }; }

const resultInterface = [
  { name: "id", type: "text", label: "ID" },
  { name: "success", type: "boolean", label: "Success" },
  { name: "message", type: "text", label: "Message" },
  { name: "data", type: "collection", label: "Data" },
  { name: "streamKey", type: "text", label: "Stream Key" },
  { name: "activityId", type: "text", label: "Activity ID" }
];

const modules = [
  {
    dir: "send-push-notification",
    metadata: { name: "sendPushNotification", label: "Send Push Notification", description: "Send an ActivitySmith push notification.", connection: "api-key", type: "action", typeId: 4 },
    expect: [text("title", "Title", "Notification title.", true), text("message", "Message", "Notification body/message.", true), collection("data", "Data", "Optional custom JSON payload."), text("url", "URL", "Optional URL to open from the notification."), bool("sound", "Sound", "Play notification sound when supported.")],
    api: { url: "/push-notification", method: "POST", body: { title: "{{parameters.title}}", message: "{{parameters.message}}", data: "{{if(parameters.data != null, parameters.data, undefined)}}", url: "{{ifempty(parameters.url, undefined)}}", sound: "{{if(parameters.sound != null, parameters.sound, undefined)}}" }, response: { output: "{{body}}" } },
    interface: resultInterface,
    samples: { title: "Order shipped", message: "Your order is on the way" }
  },
  {
    dir: "start-live-activity",
    metadata: { name: "startLiveActivity", label: "Start Live Activity", description: "Start an iOS Live Activity through ActivitySmith.", connection: "api-key", type: "action", typeId: 4 },
    expect: [text("activityType", "Activity Type", "Activity type/template identifier.", true), collection("attributes", "Attributes", "Live Activity attributes object."), collection("contentState", "Content State", "Initial Live Activity content state.", true), text("pushToken", "Push Token", "Optional push token/device identifier."), collection("data", "Data", "Optional custom JSON payload.")],
    api: { url: "/live-activity/start", method: "POST", body: { activityType: "{{parameters.activityType}}", attributes: "{{if(parameters.attributes != null, parameters.attributes, undefined)}}", contentState: "{{parameters.contentState}}", pushToken: "{{ifempty(parameters.pushToken, undefined)}}", data: "{{if(parameters.data != null, parameters.data, undefined)}}" }, response: { output: "{{body}}" } },
    interface: resultInterface,
    samples: { activityType: "delivery", contentState: { status: "preparing" } }
  },
  {
    dir: "update-live-activity",
    metadata: { name: "updateLiveActivity", label: "Update Live Activity", description: "Update an existing iOS Live Activity through ActivitySmith.", connection: "api-key", type: "action", typeId: 4 },
    expect: [text("activityId", "Activity ID", "Live Activity ID returned by the start endpoint.", true), collection("contentState", "Content State", "Updated Live Activity content state.", true), text("alertTitle", "Alert Title"), text("alertBody", "Alert Body")],
    api: { url: "/live-activity/update", method: "POST", body: { activityId: "{{parameters.activityId}}", contentState: "{{parameters.contentState}}", alertTitle: "{{ifempty(parameters.alertTitle, undefined)}}", alertBody: "{{ifempty(parameters.alertBody, undefined)}}" }, response: { output: "{{body}}" } },
    interface: resultInterface,
    samples: { activityId: "activity_123", contentState: { status: "on_the_way" } }
  },
  {
    dir: "end-live-activity",
    metadata: { name: "endLiveActivity", label: "End Live Activity", description: "End an iOS Live Activity through ActivitySmith.", connection: "api-key", type: "action", typeId: 4 },
    expect: [text("activityId", "Activity ID", "Live Activity ID to end.", true), collection("finalContentState", "Final Content State", "Optional final content state."), bool("dismissImmediately", "Dismiss Immediately", "Request immediate dismissal when supported.")],
    api: { url: "/live-activity/end", method: "POST", body: { activityId: "{{parameters.activityId}}", finalContentState: "{{if(parameters.finalContentState != null, parameters.finalContentState, undefined)}}", dismissImmediately: "{{if(parameters.dismissImmediately != null, parameters.dismissImmediately, undefined)}}" }, response: { output: "{{body}}" } },
    interface: resultInterface,
    samples: { activityId: "activity_123" }
  },
  {
    dir: "update-live-activity-stream",
    metadata: { name: "updateLiveActivityStream", label: "Update Live Activity Stream", description: "Update a live activity stream by stream key.", connection: "api-key", type: "action", typeId: 4 },
    expect: [text("streamKey", "Stream Key", "ActivitySmith stream key.", true), collection("contentState", "Content State", "Updated stream content state.", true), collection("data", "Data", "Optional custom JSON payload.")],
    api: { url: "/live-activity/stream/{{parameters.streamKey}}", method: "PUT", body: { contentState: "{{parameters.contentState}}", data: "{{if(parameters.data != null, parameters.data, undefined)}}" }, response: { output: "{{body}}" } },
    interface: resultInterface,
    samples: { streamKey: "stream_123", contentState: { progress: 50 } }
  },
  {
    dir: "delete-live-activity-stream",
    metadata: { name: "deleteLiveActivityStream", label: "Delete Live Activity Stream", description: "Delete/end a live activity stream by stream key.", connection: "api-key", type: "action", typeId: 4 },
    expect: [text("streamKey", "Stream Key", "ActivitySmith stream key.", true)],
    api: { url: "/live-activity/stream/{{parameters.streamKey}}", method: "DELETE", response: { output: "{{body}}" } },
    interface: resultInterface,
    samples: { streamKey: "stream_123" }
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
  url: "https://activitysmith.com/api{{parameters.url}}",
  method: "{{parameters.method}}",
  headers: { "{{...}}": "{{toCollection(parameters.headers, 'key', 'value')}}" },
  qs: { "{{...}}": "{{toCollection(parameters.qs, 'key', 'value')}}" },
  body: "{{parameters.body}}",
  response: { output: { statusCode: "{{statusCode}}", headers: "{{headers}}", body: "{{body}}" } }
});

const readme = `# ActivitySmith Make Custom App\n\nThis generated app provides a production-oriented Make custom app for ActivitySmith. It keeps the mandatory universal **Make an API Call** fallback and adds first-class modules from the endpoint matrix found in the extracted n8n package source.\n\n## Source details\n\n- n8n source package: \`n8n-nodes-activitysmith@1.0.5\`\n- Base URL: \`https://activitysmith.com/api\`\n- Authentication: \`Authorization: Bearer <api key>\` header populated from the connection API key.\n\n## Included modules\n\n- **Send Push Notification** (\`sendPushNotification\`) calls \`POST /push-notification\`.\n- **Start Live Activity** (\`startLiveActivity\`) calls \`POST /live-activity/start\`.\n- **Update Live Activity** (\`updateLiveActivity\`) calls \`POST /live-activity/update\`.\n- **End Live Activity** (\`endLiveActivity\`) calls \`POST /live-activity/end\`.\n- **Update Live Activity Stream** (\`updateLiveActivityStream\`) calls \`PUT /live-activity/stream/{streamKey}\`.\n- **Delete Live Activity Stream** (\`deleteLiveActivityStream\`) calls \`DELETE /live-activity/stream/{streamKey}\`.\n- **Make an API Call** (\`makeAnApiCall\`) remains available as the required universal fallback.\n\n## Generator classification\n\nClassification: \`production-ready\`. This app is not universal-only; it includes endpoint-specific modules generated from the ActivitySmith endpoint matrix above.\n\n## Notes\n\nDo not add an \`Authorization\` header in module inputs; the app sends the Bearer token from the connection. Complex ActivitySmith payloads are exposed as collections so provider-specific JSON can be passed without reverting to a universal-only app.\n`;
fs.writeFileSync(path.join(appDir, "readme.md"), readme);
console.log(`Generated ${modules.length} ActivitySmith-specific modules and updated universal fallback/readme`);
