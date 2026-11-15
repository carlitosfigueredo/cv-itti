# Design --- Talent Platform

## 1. Architecture overview

Build a client-side single-page application using React, Vite, and
TypeScript. Use Firebase managed services for authentication, database,
file storage, hosting, and trusted backend operations.

### Technology stack

-   React + Vite + TypeScript
-   React Router
-   Material UI v6 and Emotion
-   Firebase Authentication (Google provider)
-   Cloud Firestore
-   Cloud Storage for Firebase
-   Cloud Functions for privileged operations and trusted validation
-   Firebase Hosting
-   React Hook Form + Zod
-   Day.js where date handling is needed
-   Vitest + React Testing Library
-   Playwright for end-to-end tests
-   Firebase Emulator Suite for local integration and security-rule
    tests

Do not introduce Next.js, Express, SQL, EC2, Docker, or Kubernetes for
the MVP. Keep the architecture simple and Firebase-native.

## 2. High-level component diagram

``` plantuml
@startuml
actor "Visitor / Professional / Admin" as U
rectangle "React + Vite SPA\n(Firebase Hosting)" as Web
rectangle "Firebase Authentication" as Auth
database "Cloud Firestore" as FS
database "Cloud Storage" as ST
rectangle "Cloud Functions\n(trusted code, Admin SDK)" as CF
rectangle "App Check" as AC

U --> Web
Web --> Auth : Google sign-in
Web --> FS : rules enforced
Web --> ST : rules enforced
Web --> CF : callable (admin, deletion)
Web ..> AC : attestation
CF --> FS
CF --> ST
CF --> Auth : custom claims, delete user
@enduml
```

## 3. Frontend structure

Recommended repository structure:

``` text
talent-platform/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── auth/
│   │   ├── profile/
│   │   ├── cv/
│   │   ├── search/
│   │   └── layout/
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── EditProfilePage.tsx
│   │   ├── TalentSearchPage.tsx
│   │   ├── PublicProfilePage.tsx
│   │   └── AdminPage.tsx
│   ├── firebase/
│   │   ├── config.ts
│   │   ├── auth.ts
│   │   ├── firestore.ts
│   │   └── storage.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── profile.service.ts
│   │   ├── storage.service.ts
│   │   └── search.service.ts
│   ├── hooks/
│   ├── context/
│   ├── routes/
│   ├── schemas/
│   ├── types/
│   ├── utils/
│   ├── theme/
│   ├── App.tsx
│   └── main.tsx
├── functions/
├── tests/
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

Keep components presentational where possible. Put Firebase access
behind service modules. Avoid placing database queries directly
throughout UI components.

## 4. Application routes

  Route              Access          Purpose
  ------------------ --------------- ---------------------------------------
  `/`                Public          Landing page
  `/login`           Public          Google sign-in
  `/talentos`        Public          Search and browse published profiles
  `/talentos/:uid`   Public          Public professional profile
  `/dashboard`       Authenticated   User dashboard and publication status
  `/perfil/editar`   Authenticated   Create/update own profile
  `/admin`           Administrator   Moderation and administration

Use route guards for authenticated and administrator routes. Do not
treat a hidden navigation link as access control; Firebase rules and
trusted backend checks remain authoritative.

## 5. Firestore data model

### 5.1 `users/{uid}` --- private account document

Example:

``` ts
interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  affectedGrupoVazquez: boolean | null; // null = not answered yet
  accountStatus: "active" | "suspended"; // written only by trusted code
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

This document is private to its owner and authorized backend/admin
operations. Do not expose it through public directory queries.

### 5.2 `publicProfiles/{uid}` --- public professional profile

Example:

``` ts
interface PublicProfile {
  uid: string;
  displayName: string;
  headline: string;
  profession: string;
  country: string;
  city: string;
  summary: string;
  experienceYears: number;
  skills: string[];
  linkedin?: string;
  github?: string;
  portfolio?: string;
  workMode: "remote" | "hybrid" | "onsite";
  availability: "available" | "not_available";
  isPublic: boolean;
  contactEmailPublic: boolean;
  publicEmail?: string;
  contactPhonePublic: boolean;
  publicPhone?: string;
  affectedGrupoVazquezPublic: boolean; // consent, default false
  affectedGrupoVazquez?: boolean; // present only if consent is true
  cvPath: string | null;
  cvUpdatedAt: Timestamp | null;
  updatedAt: Timestamp;
}
```

Only include public-safe fields in this collection. Do not copy all
private account fields into this document. Validate that optional
contact values are absent unless their corresponding consent flag is
true.

Grupo Vazquez flag: the source of truth is `users/{uid}.affectedGrupoVazquez`
(private). The public copy exists only when the user consents, and rules
must reject the field when `affectedGrupoVazquezPublic` is false. Admin
statistics read the private value. Public directory filtering uses only
the public copy. `accountStatus` is not editable by the owner; the
directory excludes suspended accounts because the suspension function also
sets `isPublic=false` on the public profile.

### 5.2.1 `reports/{reportId}` and `adminAudit/{eventId}`

``` ts
interface Report {
  profileUid: string;
  reason: "inappropriate" | "false_information" | "spam" | "other";
  comment?: string; // max length enforced in rules
  reporterUid: string; // login required; document id is {profileUid}_{reporterUid}
  status: "open" | "resolved" | "dismissed";
  createdAt: Timestamp;
}
interface AdminAuditEvent {
  adminUid: string;
  action: "unpublish" | "suspend" | "unsuspend" | "resolve_report" | "delete_account";
  targetUid: string;
  createdAt: Timestamp;
}
```

Reports: create allowed to signed-in users, one per profile (composite
document id), read admin only; resolution done by trusted code. Audit events are
written only by Cloud Functions and are read-only for admins.

Admin statistics: use Firestore aggregation queries (`count()`) from an
admin-only function or admin-claim rules, not a full collection read.

### 5.3 CV storage

Use one stable path per user:

``` text
cvs/{uid}/cv.pdf
```

Store file metadata in `publicProfiles/{uid}` or a separate private
metadata document if required. Never store the PDF bytes in Firestore.

## 6. Firebase security design

Security rules are part of the product design, not a final deployment
detail. Kiro must implement and test them before any production
deployment.

### Firestore

-   A user may read/write only their own private `users/{uid}` document,
    subject to field validation.
-   Public visitors may read only eligible public profile documents.
-   Owners may create/update only their own profile document.
-   Prevent clients from setting admin roles, account suspension flags,
    or other privileged fields.
-   Prefer Cloud Functions for sensitive moderation and account-status
    transitions.
-   Validate field types, allowed keys, string lengths, array sizes, URL
    formats, and enum values.
-   Deny access by default.

### Cloud Storage

-   Store CVs under `cvs/{uid}/cv.pdf`.
-   Enforce authentication and UID ownership for upload, replacement,
    and deletion.
-   Enforce a 5 MB maximum and PDF content type.
-   Public read access must be conditional on the matching profile's
    `isPublic` flag (no separate CV toggle) and the account not suspended.
-   Confirm exact Cloud Storage Rules syntax and Firestore lookup
    permissions before implementing cross-service rule checks.
-   Test upload, read, replacement, and deletion rules using the
    Emulator Suite.
-   MIME metadata alone is not sufficient to prove the file's binary
    content is a valid PDF. Consider a trusted Cloud Function validation
    step.

### Administrator privileges

-   Grant custom claims only from trusted server-side code using
    Firebase Admin SDK.
-   Never allow a client to write its own role or admin claim.
-   Validate administrator claims in both route UX and trusted
    backend/security rules.

### Account deletion

A callable Cloud Function (authenticated, owner only) deletes
`cvs/{uid}/cv.pdf`, `publicProfiles/{uid}`, `users/{uid}`, and the
Authentication user, in that order, and is idempotent so it can be retried.
Admin-initiated deletion uses the same function and writes an audit event.

### Download privacy

Do not create permanent download-token URLs that remain accessible after
unpublishing. Prefer Firebase SDK-mediated download or a short-lived
backend-issued URL. Explain in the UI that a file already downloaded by
someone cannot be remotely recalled.

## 7. Search design

For the MVP, use Firestore queries with filters, indexes, and cursor
pagination.

Example query:

``` ts
query(
  collection(db, "publicProfiles"),
  where("isPublic", "==", true),
  where("country", "==", selectedCountry),
  where("skills", "array-contains", selectedSkill),
  orderBy("updatedAt", "desc"),
  limit(20)
);
```

Implementation notes:

-   The Grupo Vazquez filter (`affectedGrupoVazquez == true`) is optional
    and only matches profiles that consented to publish it.
-   Apply only filters selected by the visitor.
-   Use `limit(20)` and `startAfter(lastDocument)` for pagination.
-   Add composite indexes as required by actual query combinations.
-   Avoid loading all profiles into browser memory.
-   Show a clear empty state when no results match.
-   Firestore is not a full-text search engine. Consider Algolia or
    Typesense later if users need typo tolerance, relevance ranking, or
    broad text search.

## 8. UI and design system

Use a modern, professional, minimal visual style inspired by talent
marketplaces, without copying another product's branding.

-   Mobile-first responsive layout.
-   Centralized MUI theme with typography, spacing, palette, shape, and
    component overrides.
-   Clear visual hierarchy and readable profile cards.
-   Reusable buttons, form fields, chips, cards, dialogs, alerts, and
    loading skeletons.
-   Accessible labels, keyboard navigation, focus states, and contrast.
-   Consistent empty, loading, success, and error states.

### Main screens

1.  Landing page: product value proposition, call to action,
    featured/search entry point.
2.  Login: Google sign-in and privacy explanation.
3.  Dashboard: profile completion, publication status, CV status, edit
    actions.
4.  Edit profile: validated sections for professional information,
    skills, links, contact consent, and publication settings.
5.  CV manager: upload progress, current CV status, replace and delete
    actions.
6.  Talent directory: search filters, paginated results, profile cards.
7.  Public profile: professional details and CV download only when
    enabled.
8.  Admin: profile review, moderation actions, and account status.

## 9. Firebase configuration and environments

Use `.env.example`:

``` env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Firebase client configuration values are not equivalent to Admin SDK
secrets. Apply Firebase security rules and App Check. Never put
service-account JSON, private keys, or Admin SDK credentials in frontend
environment variables.

Use separate Firebase projects for development/staging and production
where practical. Use Emulator Suite for local development.

## 10. Hosting

Firebase Hosting serves the Vite `dist` directory. Configure SPA
rewrites to `/index.html`.

Example `firebase.json` outline:

``` json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

Validate the current Firebase CLI configuration and deployment behavior
before production release.

A client-side SPA may not provide ideal SEO for dynamic public profiles.
If search-engine indexing is a launch requirement, plan prerendering or
server-rendered metadata as a separate architecture decision.

## 11. Initial setup commands

``` bash
npm create vite@latest talent-platform -- --template react-ts
cd talent-platform
npm install
npm install firebase react-router-dom
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install react-hook-form zod @hookform/resolvers dayjs
npm install -D firebase-tools
firebase login
firebase init
```

Initialize Firestore, Storage, Hosting, and Emulators. Confirm Firebase
project and bucket region before creating production resources.

## 12. Cost and capacity considerations

-   Cloud Functions require the Blaze plan. Functions are kept to a small
    set (admin claims, moderation, account deletion, PDF validation) and
    run on demand, so cost scales with usage.
-   Initial target: approximately 3,000 users.
-   At the maximum 5 MB per user, 3,000 CVs represent approximately 15
    GB decimal of stored files before overhead and replacements.
-   Actual cost depends on region, storage class, downloads/egress,
    operations, functions, and current Firebase/Google Cloud pricing.
-   Do not promise a fixed monthly cost. Review current regional pricing
    and usage quotas before launch.
-   Set Google Cloud budget alerts, understanding that alerts do not
    automatically stop spending.
-   Use pagination and avoid unnecessary reads/downloads.
-   Monitor storage, bandwidth, Firestore reads/writes, and function
    invocations.

## 13. Testing strategy

-   Unit tests for validation schemas and utility functions.
-   Component tests for forms, authentication states, and directory UI.
-   Emulator tests for Firestore and Storage security rules.
-   Integration tests for profile creation, publication, and CV
    lifecycle.
-   Playwright end-to-end tests for the main user journeys.
-   Build, lint, type-check, and test before each phase is considered
    complete.
