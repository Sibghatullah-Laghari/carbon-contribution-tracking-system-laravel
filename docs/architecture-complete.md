# CCTRS Architecture (Complete)

Generated on: 2026-03-21

## 1. High-Level Architecture
CCTRS is a client-server application with role-based workflows.

- React frontend (Vite) handles routing, auth state, forms, admin and user dashboards.
- Spring Boot backend exposes REST APIs for auth, activities, reports, leaderboard, and Q&A.
- PostgreSQL stores users, activities, proof sessions, questions, and daily usage limits.
- Email service sends OTP, password reset, and activity decision notifications.

## 2. Layered Backend Structure
### Entry/API Layer
- Controllers under `controller/` and `security/AuthController.java`.
- Responsibilities: validate request parameters, resolve authenticated user, call services, wrap responses.

### Service Layer
- `ActivityService`: declaration/proof flow, anti-abuse checks, admin decisions, deletion helpers.
- `ReportService`: summary and graph aggregations.
- `UserService`: user CRUD and points/badge operations.
- `ProofSessionService`: short-lived proof session generation.
- `EmailService`: outbound transactional messages.

### Data Access Layer
- Repositories use `JdbcTemplate` and custom row mappers.
- `ActivityRepository` performs most analytics and admin search SQL.

## 3. Request/Identity Flow
1. Client authenticates via `/auth/login` or OAuth2 success redirect.
2. JWT is stored by frontend and attached in Axios interceptor.
3. `JwtFilter` validates token and loads user details for each protected request.
4. `SecurityConfig` enforces role and route authorization.

## 4. Frontend Architecture
### Composition
- `App.jsx` declares public, user, and admin route trees.
- `AuthContext` centralizes session decoding, role checks, and logout cleanup.
- `api/axios.js` applies base URL + Bearer token + 401 auto-logout behavior.

### Route Zones
- Public pages: home, login/signup/OTP, FAQ/help/legal, password reset, questions.
- User area: dashboard, submit activity, my activities, progress, badges, leaderboard, proof.
- Admin area: review queue, search/filtering, question answering.

## 5. Data and Status Model
### Key entities
- User: profile, role, points, verification state
- Activity: declaration/proof fields, moderation status, anti-abuse flags
- ProofSession: short TTL token/session metadata for proof capture
- Question: public question with optional admin answer
- UserDailyLimit: daily anti-abuse counters

### Main activity statuses observed
- `DECLARED`
- `PROOF_SUBMITTED`
- `PENDING` (legacy/default schema value)
- `APPROVED`
- `REJECTED`
- `FLAGGED`
- Additional repository mentions: `JOURNEY_STARTED`, `GPS_VALID`

## 6. Anti-Abuse Logic (Implemented)
- Daily activity count threshold checks.
- Tree plantation daily quantity threshold checks.
- Duplicate tree GPS proximity check (<= 10 meters).
- Public transport declared-vs-measured distance mismatch check.

These checks can set `is_flagged`, `flag_reason`, and verification flag metadata.

## 7. Startup and Scheduling
- `SchemaMigrationRunner` applies idempotent startup DDL safety updates.
- `AdminDataLoader` ensures default admin account exists.
- `@EnableScheduling` with `ActivityScheduler` daily archival trigger.

## 8. Error and Response Strategy
- Global exception handling maps common failures to API responses.
- Business rule violations mostly raise `IllegalArgumentException`.
- Success/error shape is generally wrapped by `ApiResponse` DTO.

## 9. Deployment Model
- Frontend deploy target: Vercel.
- Backend deploy target: Clever Cloud.
- GitHub Actions workflow triggers backend redeploy on pushes to `main`.

## 10. Architecture Observations
- Strong domain coupling around `ActivityRepository` SQL layer.
- Route security is role-aware and mostly centralized.
- Some comments describe soft-delete/archive behavior while repository SQL currently uses hard delete / archive no-op; document consumers should rely on actual SQL behavior in current code state.