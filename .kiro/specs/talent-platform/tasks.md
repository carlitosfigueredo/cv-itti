# Tasks --- Talent Platform

## Working agreement for Kiro

Work in small, reviewable phases. Do not implement the entire platform
in one pass.

Before coding: 1. Read `requirements.md` and `design.md`. 2. Identify
contradictions, missing decisions, and security-sensitive assumptions.
3. Present a concise implementation plan. 4. Create or update the Kiro
Spec files and keep them aligned with the implementation. 5. Do not
invent Firebase credentials, secrets, project IDs, or production
settings.

For each phase: - Implement only the scope of that phase. - Run lint,
TypeScript checks, and relevant tests. - Fix failures before moving
on. - Summarize changed files, commands run, test results, and remaining
risks. - Keep commits small and logically grouped if Git is available.

Never deploy permissive rules. Never put Firebase Admin SDK credentials
in the frontend.

## Phase 0 --- Validate requirements and decisions

-   [ ] Review requirements and design documents.
-   [ ] Confirm product name and basic branding direction.
-   [ ] Confirm public fields and contact-consent behavior.
-   [x] CV visibility: always public while the profile is public.
-   [ ] Confirm deletion/account-retention expectations.
-   [ ] Confirm admin moderation actions and audit requirements.
-   [ ] Confirm Firebase region and bucket location after
    pricing/latency review.
-   [ ] Confirm Grupo Vazquez flag model (private + optional public
    consent), and whether a company-of-origin field is needed.
-   [x] Registration open to any Google account.
-   [x] Blaze plan approved (needed for Cloud Functions).
-   [ ] Connect Firebase project (see docs/firebase-setup.md).
-   [ ] Record unresolved decisions; do not silently assume them.

**Exit criteria:** approved MVP scope and documented decisions.

## Phase 1 --- Repository and frontend foundation

-   [x] Create React + Vite + TypeScript application.
-   [x] Configure TypeScript strict mode.
-   [x] Install and configure Material UI v6.
-   [x] Create centralized MUI theme.
-   [x] Configure React Router.
-   [x] Create base layout, navigation, footer, and responsive shell.
-   [x] Create reusable loading, error, empty-state, and page-container
    components.
-   [x] Add ESLint/formatting configuration.
-   [x] Add `.env.example` and `.gitignore`.
-   [x] Add README with local setup instructions.

**Validation:** - \[x\] `npm run build` - \[x\] `npm run lint` - \[x\]
TypeScript check passes.

**Exit criteria:** clean, responsive frontend shell builds successfully.

## Phase 2 --- Firebase project integration

-   [x] Create Firebase client initialization module.
-   [x] Read configuration from `VITE_FIREBASE_*` variables.
-   [x] Add development environment validation and helpful
    missing-variable errors.
-   [x] Configure Firebase Authentication, Firestore, Storage, Hosting,
    and Emulators.
-   [x] Add Firebase Emulator Suite scripts.
-   [x] Document how to connect a local Firebase project.
-   [x] Do not add Admin SDK credentials to the frontend.

**Validation:** - \[x\] App initializes with valid local
configuration. - \[x\] App fails clearly and safely when required
configuration is missing. - \[x\] No secrets are committed.

**Exit criteria:** frontend connects to the intended Firebase
development project or emulators.

## Phase 3 --- Google authentication and route protection

-   [x] Implement Google sign-in.
-   [x] Implement sign-out.
-   [x] Create authentication context/provider and loading state.
-   [x] Restore session on page refresh.
-   [x] Implement authenticated route guard.
-   [x] Implement administrator route guard based on trusted claims.
-   [x] Handle popup cancellation, blocked popups, and provider errors.
-   [x] Add authentication tests.

**Exit criteria:** user can sign in/out, refresh safely, and access
protected routes only when authenticated.

## Phase 4 --- Private user document and profile model

-   [x] Define TypeScript types for private user and public profile
    documents.
-   [x] Define Zod validation schemas.
-   [x] Implement profile service functions.
-   [x] Create private `users/{uid}` document on first successful
    sign-in using safe fields.
-   [x] Create/edit own `publicProfiles/{uid}` document.
-   [x] Keep private and public data separated.
-   [x] Enforce publication defaults as private.
-   [x] Add "Afectado Grupo Vazquez?" (Yes/No) to the private user model,
    Zod schema, and profile form, with the separate public-consent
    checkbox. Required before publishing.
-   [x] Add profile form sections and validation feedback.
-   [x] Add profile service and schema tests.

**Exit criteria:** authenticated user can create and edit their own
profile without exposing private account fields.

## Phase 5 --- CV upload and lifecycle

-   [x] Implement PDF selection and client-side size/type checks.
-   [x] Enforce 5 MB maximum.
-   [x] Upload to `cvs/{uid}/cv.pdf`.
-   [x] Display upload progress and errors.
-   [x] Support replacement and deletion.
-   [x] Update CV metadata consistently.
-   [x] Prevent users from accessing another user's upload operations.
-   [x] Decide and implement trusted binary validation before
    production.
-   [x] Avoid permanent public download-token URLs.
-   [x] Add Storage Emulator tests for owner/non-owner access and
    size/type constraints.

**Exit criteria:** owner can upload, replace, and delete their current
CV; unauthorized access is denied.

## Phase 6 --- Publication, consent, and public profile

-   [x] Add explicit profile publication toggle, default off.
-   [x] Add separate email and phone publication consent.
-   [x] Show clear notice that the CV is public while the profile is published (no separate toggle).
-   [x] Ensure public profile contains only consented public fields
    (including the Grupo Vazquez flag).
-   [x] Add "report profile" action on the public profile.
-   [x] Implement public profile route.
-   [x] Implement public CV download behavior only when allowed.
-   [x] Implement unpublish behavior and verify future access is denied.
-   [x] Explain that already-downloaded files cannot be recalled.
-   [x] Test private, published, unpublished, and suspended states.

**Exit criteria:** only explicitly published data is accessible through
public application routes and Firebase rules.

## Phase 7 --- Public talent directory and search

-   [x] Build directory page and profile cards.
-   [x] Implement filters for country, city, profession, skills,
    experience, work mode, and availability as supported by Firestore.
-   [x] Add optional Grupo Vazquez filter (public copy only).
-   [x] Ensure every query filters for eligible public profiles.
-   [x] Add page size limit (default 20).
-   [x] Implement cursor pagination with `startAfter`.
-   [x] Add required Firestore composite indexes.
-   [x] Add loading, empty, and error states.
-   [x] Add query tests and verify read patterns.
-   [x] Document limitations of Firestore search and future
    Algolia/Typesense option.

**Exit criteria:** visitors can search and browse public profiles
without unbounded reads or access to private profiles.

## Phase 8 --- Administration and moderation

-   [x] Implement trusted backend function(s) for administrative
    operations.
-   [x] Implement secure custom-claim provisioning outside the client.
-   [x] Build protected admin page.
-   [x] List and review public profiles.
-   [x] Support unpublishing and account suspension through trusted
    operations.
-   [x] Record moderation events in `adminAudit` (written by functions).
-   [x] Admin statistics: totals, published, with CV, Grupo Vazquez
    counts, open reports (aggregation queries).
-   [x] Admin user list with Grupo Vazquez filter; reports queue.
-   [x] Account deletion callable function (user request and admin),
    idempotent, removing Storage file, Firestore docs, and Auth user.
-   [x] "Delete my account" request UI in the dashboard.
-   [x] Test that ordinary users cannot access or invoke admin
    operations.
-   [x] Document the safe process for granting/revoking administrators.

**Exit criteria:** only authorized administrators can perform moderation
actions.

## Phase 9 --- Security hardening and testing

-   [x] Review Firestore rules field by field.
-   [x] Review Storage rules and any Firestore cross-service rule
    lookups.
-   [x] Add deny-by-default behavior.
-   [x] Add Firebase App Check (reCAPTCHA Enterprise/v3 provider) and
    enforce it on Firestore, Storage, and Functions after staging
    verification. (Activo en modo monitoreo; exigirlo queda como paso
    operativo documentado en docs/seguridad.md.) Use debug tokens only in local development.
-   [x] Rules tests: owner cannot set `accountStatus`; public profile
    rejects the Grupo Vazquez field without consent; non-admins cannot
    read `reports` or another user's private flag.
-   [x] Add Emulator Suite tests for all access-control cases.
-   [x] Add unit, component, integration, and end-to-end tests.
-   [x] Check file upload validation and error handling.
-   [x] Check logs for accidental exposure of personal information.
-   [x] Review dependency vulnerabilities.
-   [x] Run full build, lint, type-check, and test suite.

**Exit criteria:** no known critical access-control gaps; automated
security tests pass.

## Phase 10 --- Hosting and release preparation

-   [ ] Configure Firebase Hosting for Vite `dist`.
-   [ ] Configure SPA rewrite to `/index.html`.
-   [ ] Configure production environment variables.
-   [ ] Confirm production Firestore and Storage rules.
-   [ ] Confirm Firebase project and bucket region.
-   [ ] Configure budget alerts and usage monitoring.
-   [ ] Configure custom domain and HTTPS if available.
-   [ ] Prepare privacy notice and terms of use.
-   [ ] Document backup, incident response, and account deletion
    procedures.
-   [ ] Perform staging smoke tests before production deployment.
-   [ ] Deploy only after explicit approval.

**Exit criteria:** documented, tested staging release and production
deployment checklist.

## Phase 11 --- Post-MVP improvements

-   [ ] Evaluate SEO/prerendering for public profiles.
-   [ ] Evaluate Algolia or Typesense for full-text search.
-   [ ] Add profile completion indicators.
-   [ ] Add analytics with privacy-conscious event design.
-   [ ] Add optional email notifications.
-   [ ] Review costs and performance using actual usage.
-   [ ] Prioritize improvements from recruiter and professional
    feedback.

## Suggested initial package scripts

Adapt these to the generated project and installed tooling:

``` json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "typecheck": "tsc -b --pretty"
  }
}
```

Add test and emulator scripts when the corresponding tools are
installed.

## Final delivery checklist

-   [ ] Source code is organized and documented.
-   [ ] `.env.example` is present; real credentials are not committed.
-   [ ] Firestore and Storage rules are restrictive and tested.
-   [ ] Admin privileges are granted only through trusted backend code.
-   [ ] CVs are stored in Cloud Storage, not Firestore.
-   [ ] Profiles are private by default and publication is explicit.
-   [ ] Public search is paginated and index-backed.
-   [ ] Build, lint, type-check, and automated tests pass.
-   [ ] Firebase setup and deployment steps are documented.
-   [ ] Remaining risks and production decisions are clearly listed.
