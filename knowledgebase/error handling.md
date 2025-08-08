## Error Handling-01

**Description**
Establishes a global error handling strategy in the `base` object and allows for overriding it at the module level for specific endpoints. The `response.error.message` field constructs a user-friendly error from the API response body, which is shown to the user when a scenario fails.

**⚠️ Critical Warnings**
- If an API returns different error structures for different endpoints, module-level overrides are necessary to prevent parsing errors.
- An unhandled or misconfigured error will cause the scenario to stop with a generic message, making it difficult for the user to debug.

**Example**
```json
{
  "base": {
    "baseUrl": "https://api.example.com",
    "response": {
      "error": {
        "message": "[{{statusCode}}] {{body.description}} (error code: {{body.code}}) {{body}}"
      }
    }
  },
  "_modules": {
    "someAction": {
      "api": {
        "url": "/action/specific",
        "response": {
          "error": {
            "message": "Failed to perform action. API responded with [{{statusCode}}] - {{body.message}}"
          }
        }
      }
    }
  }
}
```

**Implementation Steps**
1. In the `base` object, add a `response.error` block to define a default error message format for all modules.
2. Use placeholders like `{{statusCode}}` and `{{body.someKey}}` to build a descriptive message.
3. For any module that handles an endpoint with a unique error structure, add a `response.error` block inside that module's `api` definition to override the base configuration.

**Real-World Examples**
- `Global Error: `"message": "[{{statusCode}}] {{body.description}} (error code: {{body.code}}) {{body}}"``
- `Module-Specific Error: `"message": "[{{statusCode}}] {{body.message}} (error code: {{body.code}}) {{body.description}}"``

**Platform Notes**
- Make.com automatically triggers this error handling logic for any non-2xx HTTP status code response.
- The `{{body}}` placeholder is a useful debugging tool during development, as it prints the entire raw response body in the error message.

**Source files**
base.response.error, _modules.sendSms.api.response.error

---

## Error Handling-02

**Description**
Implements advanced error handling for an action that invokes a function. Even with a 200 OK status, the function might have failed. This pattern uses the `valid` property to check a response header (`x-amz-function-error`). If the header is present, the response is marked as invalid, and a custom error message for the 200 status code is used to extract the real error from the response body.

**⚠️ Critical Warnings**
- Without this pattern, a failed function invocation could be misinterpreted as a success, leading to silent failures in a scenario.
- The key in the `error` object must be a string (e.g., `"200"`) to correctly override the message for that specific status code.

**Example**
```json
{
  "api": {
    "url": "/2015-03-31/functions/{{parameters.function}}/invocations",
    "method": "POST",
    "response": {
      "output": {
        "body": "{{body}}"
      },
      "valid": "{{if(headers['x-amz-function-error'], false, true)}}",
      "error": {
        "message": "[{{statusCode}}] {{body.message}}",
        "200": {
          "message": "{{body.errorMessage}}"
        }
      }
    }
  }
}
```

**Implementation Steps**
1. In the module's `api.response` block, add a `valid` property.
2. Use an `if` or `ifempty` function to check for a condition (e.g., a header or body property) that indicates an error, returning `false` if the error condition is met.
3. Add an `error` object to the `response`.
4. Inside `error`, add a key for the success status code you need to handle (e.g., `"200"`).
5. Provide a custom `message` for that status code, mapping it to the actual error message field in the response body (e.g., `{{body.errorMessage}}`).

**Real-World Examples**
- `Validity check: `"valid": "{{if(headers['x-amz-function-error'], false, true)}}"``
- `Custom 200 error: `"200": { "message": "{{body.errorMessage}}" }``

**Platform Notes**
- The `valid` property in a `response` object allows for conditional validation beyond just the HTTP status code.
- Defining specific status codes as keys within the `response.error` object enables tailored error messages for different outcomes.

**Source files**
amazon-lambda/_modules/invokeAFunction

---

## Error Handling-03

**Description**
Implement a custom error parsing function referenced in the `base.response.error` handler. This pattern intercepts API errors and transforms them into user-friendly messages, providing context-specific guidance to help users resolve configuration issues.

**⚠️ Critical Warnings**
- If the `parseError` function has a bug or fails to return a string, error handling may break, resulting in generic or unhelpful error messages being shown to the user.
- The structure of the API error response (`body.error`) must be consistent for the parsing logic to work reliably.

**Example**
```json
{
  "base": {
    "response": {
      "error": "[{{statusCode}}] {{parseError(body.error, metadata.expect)}}"
    }
  },
  "_functions": {
    "parseError": {
      "name": "parseError",
      "arguments": "(error, expect)",
      "code": "const regex = /^Unknown field name: \"([^\"]+)\"$/m; if (typeof error.message === 'string' && regex.exec(error.message) && Array.isArray(expect)) { const fieldId = regex.exec(error.message)[1]; const record = expect.find(p => p.name === 'record'); if (!record) return error.message; const field = record.spec.find(f => f.name === fieldId); if (!field) return error.message; return `${error.message}\\n\\nAirtable cannot find this column: \"${field.label}\".`; } return error.message || error.type || error;"
    }
  }
}
```

**Implementation Steps**
1. Create a custom IML function (e.g., `parseApiError`) in the `_functions` object.
2. In this function, write JavaScript logic to inspect the `error` object from the API response.
3. Use conditional logic (if/else, switch) to identify specific error types or messages.
4. Return a formatted, user-friendly string for each recognized error, and a default message for unrecognized errors.
5. In the `base.response.error` property, set the value to call your function: `"{{parseApiError(body.error, metadata)}}"`.

**Real-World Examples**
- `Parsing 'Unknown field name' errors from Airtable to identify the specific field by its label from the module's configuration (`metadata.expect`) and instructing the user on how to fix it.`

**Platform Notes**
- The `metadata.expect` object, which contains the full specification of the module's user-facing parameters, is available within the error handling context, allowing for rich, context-aware error messages.
- Error parsing logic is defined as a custom IML function in `_functions` and invoked from the global `base.response` handler.

**Source files**
base.response.error, _functions.parseError

---

