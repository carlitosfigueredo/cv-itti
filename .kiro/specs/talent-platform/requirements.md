# Requirements --- Talent Platform

## 1. Product overview

Build a public talent directory and CV platform for professionals. A
professional signs in with Google, creates and maintains a professional
profile, uploads a PDF CV, and explicitly chooses whether the profile
and CV are public. Recruiters and visitors can search published
profiles, view professional information, and download the current CV.

The platform is aimed at people from ITTI and Grupo Vazquez who lost their
jobs. Because of that, each professional declares whether they were
affected by the Grupo Vazquez situation (see FR-037 to FR-040), so the
community can be identified, supported, and measured by administrators.

The initial target is approximately 3,000 registered users. The MVP must
be secure, maintainable, responsive, and designed so it can grow without
introducing unnecessary infrastructure.

## 2. Goals

-   Allow professionals to authenticate using Google.
-   Allow each authenticated professional to create and update their own
    profile.
-   Allow upload, replacement, and deletion of one current PDF CV per
    user.
-   Allow users to explicitly publish or unpublish their professional
    profile.
-   Provide a public directory with useful filters and pagination.
-   Allow visitors to view published profiles and download their
    published CV.
-   Provide basic administration and moderation capabilities.
-   Protect private account information and prevent users from modifying
    other users' data.

## 3. Out of scope for the MVP

-   Paid subscriptions, payments, and billing.
-   Direct messaging between recruiters and candidates.
-   Automated CV parsing or AI-based candidate scoring.
-   Full-text search, fuzzy matching, and relevance ranking through an
    external search engine.
-   Native mobile applications.
-   Multi-tenant organizations or recruiter accounts with advanced
    permissions.
-   SSR/prerendering for SEO in the first implementation, unless later
    required by product validation.

## 4. User roles

### 4.1 Visitor

-   Can access the landing page and public talent directory.
-   Can search and filter published profiles.
-   Can view a published profile.
-   Can download a CV only when the profile owner has made it public.
-   Cannot access private account data or edit profiles.

### 4.2 Professional

-   Can sign in with Google.
-   Can create and edit only their own profile.
-   Can upload, replace, and delete their own CV.
-   Can choose whether their profile is public.
-   Can choose whether selected contact details are publicly displayed.
-   Can unpublish their profile at any time.
-   Can view their own dashboard and publication status.

### 4.3 Administrator

-   Has administrative permissions granted only through a trusted
    backend using Firebase custom claims.
-   Can review and moderate published profiles.
-   Can unpublish or suspend accounts when necessary.
-   Cannot obtain administrator privileges through client-side form
    fields or user-editable Firestore documents.

## 5. Functional requirements

### Authentication

-   **FR-001:** The application shall support Google sign-in through
    Firebase Authentication.
-   **FR-002:** The application shall provide sign-out.
-   **FR-003:** The application shall persist and restore the
    authentication session using Firebase Authentication.
-   **FR-004:** Protected routes shall require an authenticated session.
-   **FR-005:** The application shall handle loading, cancellation, and
    authentication errors clearly.

### Professional profile

-   **FR-006:** An authenticated professional shall be able to create
    and edit their own profile.
-   **FR-007:** The profile shall support: display name, professional
    headline, profession, country, city, summary, years of experience,
    skills, work mode, availability, LinkedIn URL, GitHub URL, portfolio
    URL, and optional public contact details.
-   **FR-008:** Profile fields shall be validated on the client and
    enforced by security rules and/or trusted backend validation.
-   **FR-009:** A professional shall only be able to modify their own
    profile.
-   **FR-010:** A professional shall explicitly enable publication;
    profiles shall be private by default.
-   **FR-011:** A professional shall be able to unpublish their profile.
-   **FR-012:** Unpublishing shall remove the profile from public search
    and prevent future public profile/CV access through
    application-controlled access paths.
-   **FR-013:** Private account data shall be stored separately from
    public professional profile data.

### CV management

-   **FR-014:** A professional shall be able to upload a PDF CV up to 5
    MB.
-   **FR-015:** Only one current CV shall be associated with each
    professional profile.
-   **FR-016:** A professional shall be able to replace or delete their
    own CV.
-   **FR-017:** CV files shall be stored in Cloud Storage, not as binary
    data in Firestore.
-   **FR-018:** CV storage paths shall be scoped to the authenticated
    user's UID.
-   **FR-019:** A visitor shall only be able to download a CV when the
    associated profile is public (`isPublic`). There is no separate
    CV toggle: every uploaded CV is public while its profile is public
    (product decision). The upload screen and consent text must say so.
-   **FR-020:** The interface shall show upload progress and useful
    validation/error messages.
-   **FR-021:** The system shall not rely solely on a filename or
    client-provided MIME type as proof that a file is a valid PDF. Add
    trusted backend validation where feasible before production.

### Public directory and search

-   **FR-022:** Visitors shall be able to browse published profiles
    without signing in.
-   **FR-023:** The directory shall support filters for country, city,
    profession, skills, experience, work mode, and availability where
    practical.
-   **FR-024:** Search results shall be paginated, with a default page
    size of 20.
-   **FR-025:** The directory shall exclude unpublished, suspended, or
    otherwise ineligible profiles.
-   **FR-026:** Visitors shall be able to open a public profile page.
-   **FR-027:** Search shall use Firestore queries and required
    composite indexes for the MVP.
-   **FR-028:** The architecture shall allow a later integration with
    Algolia or Typesense if full-text search becomes necessary.

### Administration

-   **FR-029:** The application shall include a protected administration
    area.
-   **FR-030:** Only users with a trusted administrator custom claim
    shall access administrative operations.
-   **FR-031:** Administrators shall be able to review profiles and
    unpublish or suspend profiles/accounts.
-   **FR-032:** Administrative actions shall be validated by trusted
    backend code and recorded for audit where appropriate.

### User experience

-   **FR-033:** The application shall be responsive and usable on
    mobile, tablet, and desktop.
-   **FR-034:** The interface shall provide loading, empty, success, and
    error states.
-   **FR-035:** Forms shall provide accessible labels and understandable
    validation feedback.
-   **FR-036:** The application shall use a consistent design system and
    reusable components.

### Grupo Vazquez affected flag

-   **FR-037:** The profile form shall ask "Afectado Grupo Vazquez?" with
    the answers Yes / No. The question shall be required before the
    profile can be published.
-   **FR-038:** The answer shall be stored in the private `users/{uid}`
    document (boolean; unanswered until the user responds).
-   **FR-039:** The answer shall be shown on the public profile and be
    usable as a directory filter only if the user separately consents to
    make it public. Default is not public. Consent wording must explain
    that it reveals employment-related information.
-   **FR-040:** Administrators shall see aggregate counts by flag value
    in the statistics view, and the flag as a filter in user management.
    Ordinary users and visitors shall not read other users' private
    answer.

### Account lifecycle and moderation (from product brief)

-   **FR-041:** A professional shall be able to request deletion of their
    account. The request shall be processed by trusted backend code that
    removes `users/{uid}`, `publicProfiles/{uid}`, `cvs/{uid}/cv.pdf`,
    and the Authentication user.
-   **FR-042:** Signed-in users (any Google account) shall be able to
    report a public profile as inappropriate, once per profile. Anonymous
    reporting is not allowed to limit spam. Reports are stored in a
    collection that only administrators can read.
-   **FR-043:** Administrators shall be able to view statistics (total
    users, published profiles, profiles with CV, flag counts, pending
    reports), suspend accounts, unpublish profiles, and resolve reports.

## 6. Non-functional requirements

-   **NFR-001 Security:** Apply least-privilege Firestore and Storage
    rules. Never deploy permissive test rules to production.
-   **NFR-002 Privacy:** Keep private account data separate from public
    profile data. Publication must be explicit and revocable for future
    application-controlled access.
-   **NFR-003 Scalability:** Support an initial population of
    approximately 3,000 users using Firebase managed services,
    pagination, and indexed queries.
-   **NFR-004 Performance:** Avoid unbounded reads. Use query limits and
    cursor-based pagination.
-   **NFR-005 Reliability:** Handle Firebase errors and network
    interruptions without losing unsaved form data where practical.
-   **NFR-006 Maintainability:** Use TypeScript, clear service
    boundaries, reusable components, and documented data contracts.
-   **NFR-007 Testability:** Use Firebase Emulator Suite for
    security-rule and integration testing.
-   **NFR-008 Accessibility:** Use semantic controls, keyboard
    navigation, visible focus states, and sufficient contrast.
-   **NFR-009 Configuration:** Use environment variables for Firebase
    client configuration. Do not commit secrets.
-   **NFR-010 Admin security:** Firebase Admin SDK credentials and
    privileged operations must never be exposed in frontend code.
-   **NFR-011 File constraints:** Enforce a 5 MB maximum CV size and
    PDF-only policy at multiple layers.
-   **NFR-012 Observability:** Log useful operational errors without
    logging sensitive personal data or file contents.

## 7. Data privacy and publication rules

-   Private account information belongs in `users/{uid}`.
-   Public professional information belongs in `publicProfiles/{uid}`.
-   A public profile document must contain only fields intentionally
    approved for public display.
-   Email and phone must not be public by default. Their publication
    must be separately consented to.
-   A profile must be private by default.
-   A CV must not be publicly accessible by default.
-   Unpublishing a profile must prevent future application-controlled
    access. It cannot revoke copies already downloaded by visitors.
-   Avoid permanent, broadly shareable download-token URLs for CVs.
    Prefer authenticated SDK-mediated access or a short-lived,
    controlled download mechanism.
-   Define a retention/deletion policy before production launch.
-   The Grupo Vazquez answer is employment-related personal data. It is
    private by default, public only with separate consent, and must never
    be used to rank or exclude candidates in the directory unless the
    visitor chooses the filter explicitly.

## 8. Acceptance criteria

The MVP is acceptable when:

1.  A user can sign in and sign out with Google.
2.  A signed-in user can create and update their own professional
    profile.
3.  A user can upload, replace, and delete a PDF CV up to 5 MB.
4.  A profile is private until the owner explicitly publishes it.
5.  Public visitors can search and view only eligible published
    profiles.
6.  Public CV downloads work only while the owner's profile is
    published.
7.  A user cannot read or modify another user's private data or CV.
8.  An ordinary user cannot grant themselves administrator privileges.
9.  Search uses pagination and does not load the entire collection.
10. Firestore and Storage rules have automated tests in the Firebase
    Emulator Suite.
11. The app builds, passes lint/type checks, and has documented
    setup/deployment instructions.

## 9. Decisions taken

-   Registration is open to any Google account (no allow-list).
-   CVs are always public while the profile is published; no CV toggle.
-   Interface language is Spanish (Paraguay) for now; structure strings so
    English can be added later (i18n-ready).
-   Cloud Functions / Blaze plan approved by the product owner. Budget
    alerts are still required.
-   Data retention: at least 1 year (see FR-044).
-   Firebase region: lowest cost. Buckets in us-central1, us-east1 and
    us-west1 can use the Cloud Storage Always Free tier (per Firebase
    docs); proposed: `us-central1` for Firestore and Storage. Trade-off:
    higher latency from Paraguay than southamerica-east1.
-   FR-044: Retention. Deleted accounts keep only the minimum audit data
    (`adminAudit`, no CV or profile content) for at least 1 year. Inactive
    accounts are not auto-deleted. Exact legal basis to be confirmed with
    legal counsel (Paraguayan data protection).

## 10. Open decisions to confirm before production

-   Final product name, domain, logo, and brand system.
-   Exact public/private fields and consent wording.
-   Whether a public CV is always downloadable or can be hidden while
    the profile remains public.
-   Whether users may delete their account and request full data
    deletion from the MVP.
-   Admin moderation policy and audit retention.
-   Firebase project region and Storage bucket location after reviewing
    availability, pricing, and latency.
-   Privacy notice, terms of use, and applicable Paraguayan
    data-protection/legal requirements.
-   Whether SEO/prerendering is required at launch.
-   Grupo Vazquez flag: confirm the proposed model (private by default,
    optional public consent). Alternative: always public, or private only.
    Also confirm whether "ITTI" people need a separate origin field
    (e.g. company of origin) besides the Yes/No flag.
-   Whether registration is open to anyone with a Google account or
    restricted (e.g. company domains or an allow-list). Not specified.
-   Firebase billing plan: Cloud Functions (admin claims, account
    deletion, PDF validation) require the pay-as-you-go (Blaze) plan, and
    Cloud Storage for new default buckets may also require it. Confirm
    budget approval. Check current Firebase pricing before launch.
-   UI language: assumed Spanish (Paraguay) for the interface. Confirm.
