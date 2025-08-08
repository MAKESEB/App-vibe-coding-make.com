# 🤖 LLM Development Rules for Make.com Apps

## ⚠️ CRITICAL: Never Use Example Data

**THE #1 RULE FOR LLM DEVELOPERS**: Always replace ALL example data with real API-specific data.

## 🔧 Connection Upload & Deployment Issues

**BEFORE STARTING**: Review [22-CONNECTION-UPLOAD-LEARNINGS.md](22-CONNECTION-UPLOAD-LEARNINGS.md) which documents critical SDK limitations including:
- Connection creation 404 errors (requires manual setup)
- Parameter upload failures
- Module-connection linking issues
- Required `moduleInitMode` parameter for modules
- Security issues with API key exposure

These issues affect ALL Make.com app development and have established workarounds.

## 🔄 Required Replacements

### 1. Domain and URL Replacements
```
❌ DON'T USE: example.com, api.example.com, www.example.com
✅ DO USE: api.openai.com, api.stripe.com, api.github.com, etc.

❌ DON'T USE: https://www.example.com/api/v2
✅ DO USE: https://api.openai.com/v1, https://api.stripe.com/v1, etc.

❌ DON'T USE: https://we.make.com or https://eu1.make.com 
✅ DO USE: we or eu1 as Zone
```

### 2. Service Name Replacements
```
❌ DON'T USE: YOUR_SERVICE, YOUR_SERVICE_NAME, Example Service
✅ DO USE: OpenAI, Stripe, GitHub, Slack, etc.

❌ DON'T USE: "Make.com YOUR_SERVICE Integration/1.0"
✅ DO USE: "Make.com OpenAI Integration/1.0"
```

### 3. API Endpoint Replacements
```
❌ DON'T USE: /example-endpoint, /test, /whoami
✅ DO USE: /chat/completions, /customers, /user, etc.

❌ DON'T USE: /api/whoami
✅ DO USE: /v1/user (for GitHub), /v1/account (for Stripe), etc.
```

### 4. Response Path Replacements
```
❌ DON'T USE: {{body.email}}, {{body.example}}, {{body.user.email}}
✅ DO USE: {{body.email}} (if API returns email directly)
           {{body.account.email}} (if nested under account)
           {{body.user.login}} (for GitHub username)
           {{body.name}} (for display name)
```

### 5. Error Format Replacements
```
❌ DON'T USE: {{body.error}}, {{body.error.message}}
✅ DO USE: {{body.error.message}} (for OpenAI)
           {{body.error.description}} (for some APIs)
           {{body.message}} (for simple error APIs)
           {{body.error_description}} (for OAuth APIs)
```

### 6. Parameter Name Replacements
```
❌ DON'T USE: testParam, exampleField, sampleInput
✅ DO USE: model, messages, temperature (for OpenAI)
           amount, currency, customer (for Stripe)
           owner, repo, path (for GitHub)
```


### 7. Audience and Language
```
❌ DON'T USE: unset, public or organization
✅ DO USE:       "language": "en", "audience": "global"
```
## 🔧 Connection Configuration Rules

### Connection Types (CRITICAL)
```javascript
// ✅ CORRECT connection types (use exactly these):
"apikey"           // NOT "api-key"
"oauth"            // NOT "oauth2"  
"oauth-refresh"    // For OAuth with refresh tokens
"basic"            // For basic auth
"other"            // For custom auth
```

### Connection Validation URLs
```json
{
    // ❌ DON'T USE:
    "url": "https://www.example.com/api/whoami",
    
    // ✅ DO USE (examples):
    "url": "https://api.openai.com/v1/models",           // OpenAI
    "url": "https://api.stripe.com/v1/account",          // Stripe  
    "url": "https://api.github.com/user",                // GitHub
    "url": "https://slack.com/api/auth.test"             // Slack
}
```

## 📦 Module Configuration Rules

### API Endpoints
```json
{
    // ❌ DON'T USE:
    "url": "/items",
    "url": "/test-endpoint",
    
    // ✅ DO USE (examples):
    "url": "/chat/completions",                          // OpenAI
    "url": "/customers",                                 // Stripe
    "url": "/repos/{{parameters.owner}}/{{parameters.repo}}/issues"  // GitHub
}
```

### Response Mapping
```json
{
    // ❌ DON'T USE:
    "output": "{{body.data}}",
    "iterate": "{{body.items}}",
    
    // ✅ DO USE (examples):
    "output": "{{body}}",                                // OpenAI (direct response)
    "iterate": "{{body.data}}",                          // Stripe (data array)
    "output": "{{body.choices[0].message.content}}"     // OpenAI (extract message content)
}
```

## 🎯 Service-Specific Examples

### OpenAI API
```json
// Base URL
"baseUrl": "https://api.openai.com/v1"

// Auth header  
"Authorization": "Bearer {{connection.apiKey}}"

// Validation endpoint
"url": "https://api.openai.com/v1/models"

// Main endpoint
"url": "/chat/completions"

// Error format
"message": "[{{statusCode}}] {{body.error.message}}"
```

### Stripe API
```json
// Base URL
"baseUrl": "https://api.stripe.com/v1"

// Auth header
"Authorization": "Bearer {{connection.apiKey}}"

// Validation endpoint  
"url": "https://api.stripe.com/v1/account"

// Error format
"message": "[{{statusCode}}] {{body.error.message}}"
```

### GitHub API
```json
// Base URL
"baseUrl": "https://api.github.com"

// Auth header
"Authorization": "Bearer {{connection.token}}"

// Validation endpoint
"url": "https://api.github.com/user"

// Error format
"message": "[{{statusCode}}] {{body.message}}"
```

## 🚫 Common Mistakes to Avoid

1. **Using "api-key" instead of "apikey"** for connection type
2. **Leaving example.com in any configuration**
3. **Using generic parameter names like "testParam"**
4. **Not customizing error message formats**
5. **Using "/whoami" for all API validation endpoints**
6. **Not adjusting response paths to match actual API structure**
7. **Forgetting to update User-Agent strings**
8. **Using generic connection labels like "API Key" instead of "OpenAI API Key"**

## ✅ Validation Checklist

Before finalizing any Make.com app configuration:

- [ ] No "example.com" anywhere in the code
- [ ] All service names are real (not "YOUR_SERVICE")
- [ ] All API endpoints are real and documented
- [ ] All response paths match actual API documentation
- [ ] All error formats match actual API error responses
- [ ] Connection type is exactly one of the valid types
- [ ] User-Agent includes actual service name
- [ ] Parameter names match actual API documentation
- [ ] Help text refers to actual service documentation URLs

## 📚 Research Before Building

For every API integration:

1. **Read the API documentation thoroughly**
2. **Test API endpoints manually first**
3. **Check actual error response formats**
4. **Verify authentication requirements**
5. **Confirm response data structure**
6. **Check rate limiting and error codes**

Remember: Make.com apps that use example data will not work in production!