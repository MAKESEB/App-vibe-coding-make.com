# Actaport n8n Source Build Report

## Package inspected

- npm package: `@actaport/n8n-nodes-actaport@0.3.0`
- Local extracted source: `/Users/s.mertens/Documents/GitHub/App-vibe-coding-make.com/tmp/n8n-source/actaport`
- Classification: `production-ready`

## Source files used as evidence

- `package.json`
- `README.md`
- `dist/credentials/ActaportOAuth2Api.credentials.js`
- `dist/nodes/Actaport/GenericFunctions.js`
- `dist/nodes/Actaport/Actaport.node.js`
- `dist/nodes/Actaport/ActaportTrigger.node.js`
- `dist/nodes/Actaport/ActaportTypes.js`
- `dist/nodes/Actaport/descriptions/*.js`
- `dist/nodes/Actaport/helpers/DocumentUploadHelper.js`
- `dist/nodes/Actaport/helpers/DocumentDownloadHelper.js`

## Base URL

`https://app.actaport.de/v1`

## Auth pattern

OAuth2 authorization code with PKCE. Realm-specific endpoints are `https://app.actaport.de/auth/realms/{realm}/protocol/openid-connect/auth` and `https://app.actaport.de/auth/realms/{realm}/protocol/openid-connect/token`. Requests use `Authorization: Bearer {{connection.accessToken}}`. The package defines client ID `automation`, empty client secret, scope `openid offline_access`, and token refresh.

## Validation endpoint

`GET https://app.actaport.de/v1/info/me`

## Endpoint matrix

| Operation | Method | Path | Auth | Parameters/body | Response/iterate path |
| --- | --- | --- | --- | --- | --- |
| Get Additional Information Category | GET | /zusatzinformation/kategorien/{{parameters.id}} | OAuth2 bearer | path/query params | body |
| List Additional Information Categories | GET | /zusatzinformation/kategorien | OAuth2 bearer | query: page, size, filter/sort/search | body.content |
| List Case Files | GET | /akten | OAuth2 bearer | query: page, size, filter/sort/search | body.content |
| Get Case File | GET | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}} | OAuth2 bearer | path/query params | body |
| Create Case File | POST | /akten | OAuth2 bearer | path params and JSON body | body |
| Update Case File | PUT | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}} | OAuth2 bearer | path params and JSON body | body |
| Get Collision Check | GET | /kollisionspruefung | OAuth2 bearer | path/query params | body |
| Create Contact | POST | /kontakte | OAuth2 bearer | path params and JSON body | body |
| Get Contact | GET | /kontakte/{{parameters.id}} | OAuth2 bearer | path/query params | body |
| List Contacts | GET | /kontakte | OAuth2 bearer | query: page, size, filter/sort/search | body.content |
| Search Contacts | GET | /kontakte/suche | OAuth2 bearer | query: page, size, filter/sort/search | body.content |
| Update Contact | PUT | /kontakte/{{parameters.id}} | OAuth2 bearer | path params and JSON body | body |
| Create Deadline | POST | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/fristen | OAuth2 bearer | path params and JSON body | body |
| Get Deadline | GET | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/fristen/{{parameters.id}} | OAuth2 bearer | path/query params | body |
| List Deadlines | GET | /fristen | OAuth2 bearer | query: page, size, filter/sort/search | body.content |
| Update Deadline | PUT | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/fristen/{{parameters.id}} | OAuth2 bearer | path params and JSON body | body |
| Update Status Deadline | PUT | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/fristen/{{parameters.id}}/status/{{parameters.status}} | OAuth2 bearer | path params and JSON body | body |
| Get Department | GET | /info/kanzlei/dezernate/{{parameters.id}} | OAuth2 bearer | path/query params | body |
| List Departments | GET | /info/kanzlei/dezernate | OAuth2 bearer | query: page, size, filter/sort/search | body.content |
| Create Document | POST | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/dokumente/neu | OAuth2 bearer | path params and JSON body | body |
| Download Document | GET | /documents/{{parameters.id}} | OAuth2 bearer | path/query params | body |
| Get Document | GET | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/dokumente/{{parameters.id}} | OAuth2 bearer | path/query params | body |
| List Documents | GET | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/dokumente/uebersicht | OAuth2 bearer | query: page, size, filter/sort/search | body.content |
| Search Documents | GET | /documents/search | OAuth2 bearer | query: page, size, filter/sort/search | body.content |
| Update Document | PUT | /documents/{{parameters.id}}/metadata | OAuth2 bearer | path params and JSON body | body |
| Get Document Template | GET | /vorlagen/{{parameters.id}} | OAuth2 bearer | path/query params | body |
| List Document Templates | GET | /vorlagen | OAuth2 bearer | query: page, size, filter/sort/search | body.content |
| Create Expense | POST | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/eigene-auslagen | OAuth2 bearer | path params and JSON body | body |
| Delete Expense | DELETE | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/eigene-auslagen/{{parameters.id}} | OAuth2 bearer | path/query params | body |
| Get Expense | GET | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/eigene-auslagen/{{parameters.id}} | OAuth2 bearer | path/query params | body |
| List Expenses | GET | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/eigene-auslagen | OAuth2 bearer | query: page, size, filter/sort/search | body.content |
| Update Expense | PUT | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/eigene-auslagen/{{parameters.id}} | OAuth2 bearer | path params and JSON body | body |
| Create Folder | POST | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/ordner | OAuth2 bearer | path params and JSON body | body |
| Get Folder | GET | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/ordner/{{parameters.id}} | OAuth2 bearer | path/query params | body |
| List Folders | GET | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/ordner | OAuth2 bearer | query: page, size, filter/sort/search | body.content |
| List Invoices | GET | /rechnungen | OAuth2 bearer | query: page, size, filter/sort/search | body.content |
| Get Invoice | GET | /rechnungen/{{parameters.id}} | OAuth2 bearer | path/query params | body |
| Create Note | POST | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/notizen | OAuth2 bearer | path params and JSON body | body |
| Get Note | GET | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/notizen/{{parameters.id}} | OAuth2 bearer | path/query params | body |
| List Notes | GET | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/notizen | OAuth2 bearer | query: page, size, filter/sort/search | body.content |
| Update Note | PUT | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/notizen/{{parameters.id}} | OAuth2 bearer | path params and JSON body | body |
| Create Resubmission | POST | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/wiedervorlagen | OAuth2 bearer | path params and JSON body | body |
| Get Resubmission | GET | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/wiedervorlagen/{{parameters.id}} | OAuth2 bearer | path/query params | body |
| List Resubmissions | GET | /wiedervorlagen | OAuth2 bearer | query: page, size, filter/sort/search | body.content |
| Update Resubmission | PUT | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/wiedervorlagen/{{parameters.id}} | OAuth2 bearer | path params and JSON body | body |
| Update Status Resubmission | PUT | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/wiedervorlagen/{{parameters.id}}/status/{{parameters.status}} | OAuth2 bearer | path params and JSON body | body |
| Create RVG Fee | POST | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/rvg | OAuth2 bearer | path params and JSON body | body |
| Delete RVG Fee | DELETE | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/rvg/{{parameters.id}} | OAuth2 bearer | path/query params | body |
| Get RVG Fee | GET | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/rvg/{{parameters.id}} | OAuth2 bearer | path/query params | body |
| List RVG Fees | GET | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/rvg | OAuth2 bearer | query: page, size, filter/sort/search | body.content |
| Update RVG Fee | PUT | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/rvg/{{parameters.id}} | OAuth2 bearer | path params and JSON body | body |
| Create Task | POST | /aufgaben | OAuth2 bearer | path params and JSON body | body |
| Get Task | GET | /aufgaben/{{parameters.id}} | OAuth2 bearer | path/query params | body |
| List Tasks | GET | /aufgaben | OAuth2 bearer | query: page, size, filter/sort/search | body.content |
| Update Task | PUT | /aufgaben/{{parameters.id}} | OAuth2 bearer | path params and JSON body | body |
| Update Status Task | PUT | /aufgaben/{{parameters.id}}/status/{{parameters.status}} | OAuth2 bearer | path params and JSON body | body |
| Create Third Party Cost | POST | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/fremde-auslagen | OAuth2 bearer | path params and JSON body | body |
| Delete Third Party Cost | DELETE | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/fremde-auslagen/{{parameters.id}} | OAuth2 bearer | path/query params | body |
| Get Third Party Cost | GET | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/fremde-auslagen/{{parameters.id}} | OAuth2 bearer | path/query params | body |
| List Third Party Costs | GET | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/fremde-auslagen | OAuth2 bearer | query: page, size, filter/sort/search | body.content |
| Update Third Party Cost | PUT | /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/fremde-auslagen/{{parameters.id}} | OAuth2 bearer | path params and JSON body | body |
| Get User | GET | /benutzer/{{parameters.userId}} | OAuth2 bearer | path/query params | body |
| Get Current User | GET | /info/me | OAuth2 bearer | path/query params | body |
| List Users | GET | /benutzer | OAuth2 bearer | query: page, size, filter/sort/search | body.content |
| Upload Document (unsupported first-class module) | POST | /akten/{laufendeNummer}/{bezugsJahr}/dokumente | OAuth2 bearer | multipart file, ordner | body |
| Webhook subscription create | POST | /webhooks | OAuth2 bearer | events, hookUrl, description | body |
| Webhook subscription delete | DELETE | /webhooks/{id} | OAuth2 bearer | id | body |

## Generated modules and typeIds

| Module name | Label | typeId | Endpoint |
| --- | --- | ---: | --- |
| getAdditionalInformationCategory | Get Additional Information Category | 4 | GET /zusatzinformation/kategorien/{{parameters.id}} |
| listAdditionalInformationCategories | List Additional Information Categories | 9 | GET /zusatzinformation/kategorien |
| listCaseFiles | List Case Files | 9 | GET /akten |
| getCaseFile | Get Case File | 4 | GET /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}} |
| createCaseFile | Create Case File | 4 | POST /akten |
| updateCaseFile | Update Case File | 4 | PUT /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}} |
| getCollisionCheck | Get Collision Check | 4 | GET /kollisionspruefung |
| createContact | Create Contact | 4 | POST /kontakte |
| getContact | Get Contact | 4 | GET /kontakte/{{parameters.id}} |
| listContacts | List Contacts | 9 | GET /kontakte |
| searchContacts | Search Contacts | 9 | GET /kontakte/suche |
| updateContact | Update Contact | 4 | PUT /kontakte/{{parameters.id}} |
| createDeadline | Create Deadline | 4 | POST /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/fristen |
| getDeadline | Get Deadline | 4 | GET /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/fristen/{{parameters.id}} |
| listDeadlines | List Deadlines | 9 | GET /fristen |
| updateDeadline | Update Deadline | 4 | PUT /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/fristen/{{parameters.id}} |
| updateStatusDeadline | Update Status Deadline | 4 | PUT /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/fristen/{{parameters.id}}/status/{{parameters.status}} |
| getDepartment | Get Department | 4 | GET /info/kanzlei/dezernate/{{parameters.id}} |
| listDepartments | List Departments | 9 | GET /info/kanzlei/dezernate |
| createDocument | Create Document | 4 | POST /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/dokumente/neu |
| downloadDocument | Download Document | 4 | GET /documents/{{parameters.id}} |
| getDocument | Get Document | 4 | GET /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/dokumente/{{parameters.id}} |
| listDocuments | List Documents | 9 | GET /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/dokumente/uebersicht |
| searchDocuments | Search Documents | 9 | GET /documents/search |
| updateDocument | Update Document | 4 | PUT /documents/{{parameters.id}}/metadata |
| getDocumentTemplate | Get Document Template | 4 | GET /vorlagen/{{parameters.id}} |
| listDocumentTemplates | List Document Templates | 9 | GET /vorlagen |
| createExpense | Create Expense | 4 | POST /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/eigene-auslagen |
| deleteExpense | Delete Expense | 4 | DELETE /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/eigene-auslagen/{{parameters.id}} |
| getExpense | Get Expense | 4 | GET /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/eigene-auslagen/{{parameters.id}} |
| listExpenses | List Expenses | 9 | GET /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/eigene-auslagen |
| updateExpense | Update Expense | 4 | PUT /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/eigene-auslagen/{{parameters.id}} |
| createFolder | Create Folder | 4 | POST /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/ordner |
| getFolder | Get Folder | 4 | GET /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/ordner/{{parameters.id}} |
| listFolders | List Folders | 9 | GET /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/ordner |
| listInvoices | List Invoices | 9 | GET /rechnungen |
| getInvoice | Get Invoice | 4 | GET /rechnungen/{{parameters.id}} |
| createNote | Create Note | 4 | POST /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/notizen |
| getNote | Get Note | 4 | GET /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/notizen/{{parameters.id}} |
| listNotes | List Notes | 9 | GET /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/notizen |
| updateNote | Update Note | 4 | PUT /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/notizen/{{parameters.id}} |
| createResubmission | Create Resubmission | 4 | POST /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/wiedervorlagen |
| getResubmission | Get Resubmission | 4 | GET /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/wiedervorlagen/{{parameters.id}} |
| listResubmissions | List Resubmissions | 9 | GET /wiedervorlagen |
| updateResubmission | Update Resubmission | 4 | PUT /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/wiedervorlagen/{{parameters.id}} |
| updateStatusResubmission | Update Status Resubmission | 4 | PUT /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/wiedervorlagen/{{parameters.id}}/status/{{parameters.status}} |
| createRvgFee | Create RVG Fee | 4 | POST /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/rvg |
| deleteRvgFee | Delete RVG Fee | 4 | DELETE /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/rvg/{{parameters.id}} |
| getRvgFee | Get RVG Fee | 4 | GET /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/rvg/{{parameters.id}} |
| listRvgFees | List RVG Fees | 9 | GET /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/rvg |
| updateRvgFee | Update RVG Fee | 4 | PUT /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/rvg/{{parameters.id}} |
| createTask | Create Task | 4 | POST /aufgaben |
| getTask | Get Task | 4 | GET /aufgaben/{{parameters.id}} |
| listTasks | List Tasks | 9 | GET /aufgaben |
| updateTask | Update Task | 4 | PUT /aufgaben/{{parameters.id}} |
| updateStatusTask | Update Status Task | 4 | PUT /aufgaben/{{parameters.id}}/status/{{parameters.status}} |
| createThirdPartyCost | Create Third Party Cost | 4 | POST /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/fremde-auslagen |
| deleteThirdPartyCost | Delete Third Party Cost | 4 | DELETE /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/fremde-auslagen/{{parameters.id}} |
| getThirdPartyCost | Get Third Party Cost | 4 | GET /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/fremde-auslagen/{{parameters.id}} |
| listThirdPartyCosts | List Third Party Costs | 9 | GET /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/fremde-auslagen |
| updateThirdPartyCost | Update Third Party Cost | 4 | PUT /akten/{{parameters.laufendeNummer}}/{{parameters.bezugsJahr}}/verguetungspositionen/fremde-auslagen/{{parameters.id}} |
| getUser | Get User | 4 | GET /benutzer/{{parameters.userId}} |
| getCurrentUser | Get Current User | 4 | GET /info/me |
| listUsers | List Users | 9 | GET /benutzer |
| watchEvents | Watch Events | 10 | Actaport webhook payload |
| makeAnApiCall | Make an API Call | 12 | Custom relative Actaport path |

## Local validation commands/results

- `node scripts/actaport/generate-actaport-app.mjs` — passed
- `node --check scripts/actaport/generate-actaport-app.mjs` — passed
- JSON parse for app `.json` and `.imljson` files — passed
- `file apps/actaport/assets/icon.png` — passed, PNG image data, 512 x 512
- Placeholder scan for blocked patterns — passed, no matches
- Python module guard — passed: exactly one universal module with `typeId: 12` and at least one endpoint-specific module with production type IDs

## Upload/public commands to run next

```bash
./scripts/upload-ready-apps.sh actaport
make-cli sdk-apps set-icon <remote-app> 1 apps/actaport/assets/icon.png
make-cli sdk-apps get-icon <remote-app> 1 /tmp/actaport-icon.png
make-cli sdk-apps set-public <remote-app> 1
make-cli sdk-modules set-public <remote-app> 1 getAdditionalInformationCategory
make-cli sdk-modules set-public <remote-app> 1 listAdditionalInformationCategories
make-cli sdk-modules set-public <remote-app> 1 listCaseFiles
make-cli sdk-modules set-public <remote-app> 1 getCaseFile
make-cli sdk-modules set-public <remote-app> 1 createCaseFile
make-cli sdk-modules set-public <remote-app> 1 updateCaseFile
make-cli sdk-modules set-public <remote-app> 1 getCollisionCheck
make-cli sdk-modules set-public <remote-app> 1 createContact
make-cli sdk-modules set-public <remote-app> 1 getContact
make-cli sdk-modules set-public <remote-app> 1 listContacts
make-cli sdk-modules set-public <remote-app> 1 searchContacts
make-cli sdk-modules set-public <remote-app> 1 updateContact
make-cli sdk-modules set-public <remote-app> 1 createDeadline
make-cli sdk-modules set-public <remote-app> 1 getDeadline
make-cli sdk-modules set-public <remote-app> 1 listDeadlines
make-cli sdk-modules set-public <remote-app> 1 updateDeadline
make-cli sdk-modules set-public <remote-app> 1 updateStatusDeadline
make-cli sdk-modules set-public <remote-app> 1 getDepartment
make-cli sdk-modules set-public <remote-app> 1 listDepartments
make-cli sdk-modules set-public <remote-app> 1 createDocument
make-cli sdk-modules set-public <remote-app> 1 downloadDocument
make-cli sdk-modules set-public <remote-app> 1 getDocument
make-cli sdk-modules set-public <remote-app> 1 listDocuments
make-cli sdk-modules set-public <remote-app> 1 searchDocuments
make-cli sdk-modules set-public <remote-app> 1 updateDocument
make-cli sdk-modules set-public <remote-app> 1 getDocumentTemplate
make-cli sdk-modules set-public <remote-app> 1 listDocumentTemplates
make-cli sdk-modules set-public <remote-app> 1 createExpense
make-cli sdk-modules set-public <remote-app> 1 deleteExpense
make-cli sdk-modules set-public <remote-app> 1 getExpense
make-cli sdk-modules set-public <remote-app> 1 listExpenses
make-cli sdk-modules set-public <remote-app> 1 updateExpense
make-cli sdk-modules set-public <remote-app> 1 createFolder
make-cli sdk-modules set-public <remote-app> 1 getFolder
make-cli sdk-modules set-public <remote-app> 1 listFolders
make-cli sdk-modules set-public <remote-app> 1 listInvoices
make-cli sdk-modules set-public <remote-app> 1 getInvoice
make-cli sdk-modules set-public <remote-app> 1 createNote
make-cli sdk-modules set-public <remote-app> 1 getNote
make-cli sdk-modules set-public <remote-app> 1 listNotes
make-cli sdk-modules set-public <remote-app> 1 updateNote
make-cli sdk-modules set-public <remote-app> 1 createResubmission
make-cli sdk-modules set-public <remote-app> 1 getResubmission
make-cli sdk-modules set-public <remote-app> 1 listResubmissions
make-cli sdk-modules set-public <remote-app> 1 updateResubmission
make-cli sdk-modules set-public <remote-app> 1 updateStatusResubmission
make-cli sdk-modules set-public <remote-app> 1 createRvgFee
make-cli sdk-modules set-public <remote-app> 1 deleteRvgFee
make-cli sdk-modules set-public <remote-app> 1 getRvgFee
make-cli sdk-modules set-public <remote-app> 1 listRvgFees
make-cli sdk-modules set-public <remote-app> 1 updateRvgFee
make-cli sdk-modules set-public <remote-app> 1 createTask
make-cli sdk-modules set-public <remote-app> 1 getTask
make-cli sdk-modules set-public <remote-app> 1 listTasks
make-cli sdk-modules set-public <remote-app> 1 updateTask
make-cli sdk-modules set-public <remote-app> 1 updateStatusTask
make-cli sdk-modules set-public <remote-app> 1 createThirdPartyCost
make-cli sdk-modules set-public <remote-app> 1 deleteThirdPartyCost
make-cli sdk-modules set-public <remote-app> 1 getThirdPartyCost
make-cli sdk-modules set-public <remote-app> 1 listThirdPartyCosts
make-cli sdk-modules set-public <remote-app> 1 updateThirdPartyCost
make-cli sdk-modules set-public <remote-app> 1 getUser
make-cli sdk-modules set-public <remote-app> 1 getCurrentUser
make-cli sdk-modules set-public <remote-app> 1 listUsers
make-cli sdk-modules set-public <remote-app> 1 watchEvents
make-cli sdk-modules set-public <remote-app> 1 makeAnApiCall
make-cli sdk-apps get --name=<remote-app> --version=1 --output=json
make-cli sdk-modules list --app-name=<remote-app> --app-version=1 --output=json
make-cli sdk-apps get-section --name=<remote-app> --version=1 --section=base --output=json
make-cli sdk-connections get-section --connection-name=<remote-connection> --section=api --output=json
make-cli sdk-modules get-section --app-name=<remote-app> --app-version=1 --module-name=listContacts --section=api --output=json
```

## Risks or unsupported endpoints

- A first-class document binary upload module is not generated. The package implements upload with a runtime FormData helper and n8n binary APIs.
- Create/update modules accept a JSON body to preserve Actaport field names without inventing schemas not fully documented in the package.
- The `watchEvents` module mirrors the package webhook event model. Ensure the repository uploader supports hook sections before relying on remote trigger activation.
- Local generation and JSON validation do not prove live Actaport credentials or account permissions.
