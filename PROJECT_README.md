# Carbon Contribution Tracking & Reward System (CCTRS)

Generated on: 2026-03-21

This document is an analysis-based, read-only generated README for the current repository state. It does not change application logic.

## 1. Project Summary
CCTRS is a full-stack platform for tracking eco-friendly user activities, collecting proof (image + GPS), reviewing submissions in an admin workflow, and presenting progress/leaderboard analytics.

## 2. Tech Stack
- Frontend: React 18, Vite 5, React Router, Axios, Chart.js/Recharts
- Backend: Java 17, Spring Boot 3.4, Spring Security, OAuth2 Client, JWT, Spring JDBC/JPA
- Database: PostgreSQL (production), SQL schema bootstrapped from backend resources
- API docs: springdoc-openapi (Swagger UI)
- Deployment: Vercel (frontend), Clever Cloud (backend)

## 3. Runtime Topology
- Frontend app runs on Vite local dev server (default 5173) and calls backend through Axios base URL config.
- Backend exposes REST APIs, authenticates using JWT Bearer tokens, supports OAuth2 login callback flow, and persists to PostgreSQL.
- Scheduled backend task runs daily for archival workflow (implementation currently no-op at repository layer).

## 4. Core Functional Flows
### Authentication
1. User signup starts with OTP request.
2. OTP verification creates user account with `emailVerified=true`.
3. Login issues JWT with role claim.
4. OAuth2 (Google) can auto-provision user and redirect with JWT token.

### Activity Lifecycle
1. User declares activity (`DECLARED`).
2. User submits proof (`PROOF_SUBMITTED`) with image + GPS/time.
3. Auto-flagging may mark suspicious submissions (`FLAGGED`).
4. Admin approves (`APPROVED`) or rejects (`REJECTED`) activities.
5. Approved activities contribute points and leaderboard/progress calculations.

### Reports & Rankings
- Monthly summary and graph endpoints aggregate approved points.
- Leaderboard endpoint returns top users by points with badge metadata.

## 5. Security Model
- Publicly permitted paths: `/auth/**`, `/public/**`, OAuth2 routes, and H2 console path.
- `/admin/**` requires ADMIN role.
- Most `/api/**` routes require authenticated JWT.
- JWT filter validates signature/expiry and sets Spring Security context.

## 6. Data Model (high level)
- `users`: identity, role, points, email verification
- `activities`: user activity declaration/proof/verification metadata
- `proof_sessions`: short-lived proof-start sessions
- `questions`: public Q&A submission and admin answers
- `user_daily_limits`: anti-abuse counters (daily activity/tree limits)

## 7. Build and Run
## Frontend
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`

## Backend
- Build: `./mvnw -DskipTests package` (or `mvnw.cmd` on Windows)
- Run: `./mvnw spring-boot:run`

## 8. Observed API Conventions
- Most responses are wrapped in `ApiResponse<T>` payloads.
- Main API prefixes: `/auth`, `/api`, `/admin`, `/public`.
- Some controllers expose dual prefixes (example: `/report` and `/api/report`).

## 9. Existing Documentation Set
- `docs/api-design.md` (placeholder)
- `docs/architecture.md` (placeholder)
- `docs/development-plan.md`
- `docs/er-diagram.md`

Use the generated files in `docs/` below for complete architecture/API/folder documentation.