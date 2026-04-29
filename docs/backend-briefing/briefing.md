# Backend Briefing: FHIR Integration with the InKaPP Platform

Briefing document about how this platform handles FHIR resources coming from the InKaPP backend.

## 0. What's in this bundle

```text
backend-briefing/
├── briefing.md                  ← this document
├── questionnaires/              ← FHIR Questionnaire definitions (form templates)
│   ├── IDGDiagnosisFeedback.json
│   ├── IDGProgressionFeedback.json
│   ├── IDGRadiationFeedback.json
│   ├── IDGSurgeryFeedback.json
│   ├── IDGSystemicTherapyFeedback.json
│   └── IDGTNMFeedback.json
├── questionnaireResponses/      ← example QRs the platform will POST/PUT to your server
│   ├── diagnoseFeedback.json
│   ├── diagnoseFeedback.short.json   ← same form, sparse (branching skipped)
│   ├── operationFeedback.json
│   ├── strahlentherapieFeedback.json
│   ├── systemischeTherapieFeedback.json
│   ├── tnmFeedback.json
│   └── verlaufFeedback.json
└── test-bundles/                ← example oncology Bundles the platform will READ from your server
    ├── InKaPP_Brust_C50.json    ← breast
    ├── InKaPP_Darm_C18.json     ← colon
    ├── InKaPP_Lunge_C34.json    ← lung (referenced by the §3.3 example and all sample QRs)
    └── InKaPP_Prostata_C61.json ← prostate
```

The `questionnaires/` and `test-bundles/` directories are reference material — neither is consumed
by your server at runtime. The `questionnaireResponses/` examples mirror what will actually arrive
on the wire.

## 1. What this platform does (in one paragraph)

This platform is a patient-facing web app. A user logs in via your Keycloak instance (OAuth2 /
OIDC), the app receives an `access_token`, and the app uses that token to talk to your FHIR server.
It reads oncological data the user already has on the FHIR server (delivered as a FHIR Bundle),
renders it in a UI tailored for laypeople, and lets the user submit feedback on individual data
points (e.g. "is this diagnosis date correct?"). That feedback is written back to your FHIR server
as `QuestionnaireResponse` resources.

## 2. What you need to provide

### 2.1 Keycloak

Standard OIDC. The platform performs an OAuth flow and obtains an `access_token`. Every subsequent
request to the FHIR server carries that token in `Authorization: Bearer ...`. The platform does not
inspect the token's contents — it treats it as opaque.

### 2.2 FHIR server

Must accept the `access_token` and resolve it to a single patient context. How you do that — token
introspection, SMART-on-FHIR launch context, a gateway in front, a mapping table from `sub` claim to
`Patient.id`, identifiers on `Patient` keyed by the IdP issuer — is **entirely on your side**. The
platform sends the token; your server decides which `Patient` it represents and scopes responses
accordingly.

The oncology data itself (the Bundle the platform reads) is provisioned through a separate pipeline
that already exists. The sample bundles provided in the past live at `test-bundles/` for reference;
they follow the
[MII Onko profiles](https://www.medizininformatik-initiative.de/Kerndatensatz/KDS_Onkologie/MIIIGModulOnkologie.html).

## 3. What this platform sends you: `QuestionnaireResponse`

This is the only resource the platform writes. One `QuestionnaireResponse` (QR) per piece of
feedback the user submits.

### 3.1 FHIR primer (30 seconds)

A `Questionnaire` is a form definition (questions, choices, branching logic). A
`QuestionnaireResponse` is a filled-out form: question link IDs paired with the user's answers. Both
are standard FHIR R4 resources.

A `QuestionnaireResponse` is **not guaranteed to contain every `linkId` from the source
`Questionnaire`**. Feedback forms use `enableWhen` branching: a question only appears (and is only
answered) if the user's prior answers triggered it. Skipped branches are simply absent from
`QR.item`. Sample QRs are under `questionnaireResponses/` in this folder. Treat any `linkId` as
optional when consuming the response, and consult the corresponding `Questionnaire` definition (see
§4) if you need to understand why a field is missing.

### 3.2 The conventions used here

Two fields on the QR carry the linkage you need to query on later:

| Field     | What it points to                            | Why                                                                        |
| --------- | -------------------------------------------- | -------------------------------------------------------------------------- |
| `subject` | The **topic resource** the feedback is about | Lets you find all feedback for a given Condition / Observation / Procedure |
| `source`  | The **Patient** who submitted the feedback   | Lets you find all feedback for a given patient                             |

#### ⚠️ Deviation from FHIR convention

Per the FHIR spec, `QuestionnaireResponse.subject` is typically a `Patient`, and `source` is whoever
filled the form out. We intentionally **invert this**:

- `subject` → the resource the feedback is about (e.g. a `Condition`)
- `source` → the `Patient`

Why: this makes both queries trivially expressible on any vanilla FHIR server, without requiring
custom search parameters or extensions:

- "All feedback on this Condition" → `GET /QuestionnaireResponse?subject=Condition/<id>`
- "All feedback by this Patient" → `GET /QuestionnaireResponse?source=Patient/<id>`

Both `subject` and `source` are standard, indexed search params. The trade-off is that any tool that
_assumes_ `subject=Patient` (some dashboards, some FHIR clients) will be confused. Document this
clearly in your own system.

### 3.3 Subject varies by questionnaire

Each feedback form targets a specific resource type from the oncology Bundle:

| Questionnaire (file)         | `questionnaire` id | `subject` resource type |
| ---------------------------- | ------------------ | ----------------------- |
| `IDGDiagnosisFeedback`       | `1_Fd`             | `Condition`             |
| `IDGTNMFeedback`             | `7_Fd`             | `Observation`           |
| `IDGProgressionFeedback`     | `6_Fd`             | `Observation`           |
| `IDGSurgeryFeedback`         | `3_Fd`             | `Procedure`             |
| `IDGRadiationFeedback`       | `4_Fd`             | `Procedure`             |
| `IDGSystemicTherapyFeedback` | `5_Fd`             | `Procedure`             |

The id in `subject.reference` is always the id of an entry from the oncology Bundle the platform
read earlier. Concretely, given `test-bundles/InKaPP_Lunge_C34.json`, a diagnosis-feedback QR for
the lung-cancer condition would carry:

```json
{
	"resourceType": "QuestionnaireResponse",
	"questionnaire": "Questionnaire/1_Fd",
	"status": "completed",
	"subject": {
		"reference": "Condition/e5fab94a17c480d911d43b23bf87d290f868c84400edf8e224ffa4db68c90ef6"
	},
	"source": {
		"reference": "Patient/1fbe90622a7eb3955f73cf83279640361b5490b280d6386e91ef2fffc33b2652"
	},
	"authored": "2026-04-29T10:15:00+02:00",
	"item": [
		/* answers, keyed by linkId */
	]
}
```

The `Patient` reference comes from the `subject` field of the Bundle entries (every oncology
resource references the same patient). The platform reuses that id verbatim — your server is the
source of truth for patient identity.

### 3.4 Subsequent submissions overwrite, not append

When the user opens a feedback form a second time, the platform first queries:

```text
GET /QuestionnaireResponse?subject=<ResourceType>/<id>
```

— i.e. by `subject` reference alone.

- **First submission**: no prior QR is found, the platform issues `POST /QuestionnaireResponse` and
  your server assigns the id.
- **Subsequent submissions**: the prior QR is loaded, its answers pre-fill the form, and on submit
  the platform issues `PUT /QuestionnaireResponse/<id>` against the same id — overwriting the prior
  resource rather than creating a new one.

Implications for your server:

- One `QuestionnaireResponse` per (Patient, topic-resource) pair is the steady state. No history is
  kept on our side.
- If you need an audit trail of edits, rely on FHIR resource versioning (`_history`) — the platform
  does not maintain prior versions itself.
- The query above is scoped on your end to the authenticated Patient (per §5), so one user cannot
  see or overwrite another user's QR even though the search uses `subject` only.

## 4. The `Questionnaire` resources themselves (optional)

Each feedback form has a stable id (e.g. `1_Fd` for `IDGDiagnosisFeedback`). The canonical
definitions live under `questionnaires/`. See `questionnaires/IDGDiagnosisFeedback.json` for an
example: it defines link IDs, question text (German), answer codings, and `enableWhen` branching
logic.

You do **not** need to host these `Questionnaire` resources for the platform to function — the
platform owns them. But if you want incoming `QuestionnaireResponse`s to be dereferenceable (i.e. so
`QR.questionnaire` resolves), you can upload them to your FHIR server as `Questionnaire` resources.
We'll happily ship them to you on request. Otherwise, treat `QR.questionnaire` as an opaque logical
id.

## 5. What you should do with incoming QRs

This is your call. Minimum viable handling:

1. Validate the bearer token, scope to a Patient on your side.
2. Verify `QR.source.reference` matches that Patient (reject otherwise).
3. Verify `QR.subject.reference` resolves to a resource owned by that Patient — i.e. the referenced
   resource's own `subject` (or equivalent) field points at the authenticated Patient.
4. Persist the QR. The platform does not read its own QRs back, so your storage model is
   unconstrained by us.

## 6. Out of scope for this briefing

- How you map `access_token` → `Patient`.
- How the oncology Bundle gets onto your FHIR server (separate pipeline).
- Aggregation, analytics, dashboards over collected feedback.
