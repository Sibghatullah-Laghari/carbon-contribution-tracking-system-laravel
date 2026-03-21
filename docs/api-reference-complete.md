# CCTRS API Reference (Complete)

Generated from controller and frontend call-site analysis on 2026-03-21.

Base backend URL is environment-dependent (local/prod). Most authenticated endpoints require `Authorization: Bearer <jwt>`.

## 1. Auth APIs (`/auth`)
### POST `/auth/send-otp`
- Purpose: Start signup by sending OTP.
- Body: signup payload (name, email, username, password).

### POST `/auth/resend-otp`
- Purpose: Resend OTP for a pending signup.
- Body: `{ email }`.

### POST `/auth/verify-otp`
- Purpose: Verify OTP and create account.
- Body: `{ email, otp }`.

### POST `/auth/login`
- Purpose: Authenticate and issue JWT.
- Body: `{ email, password }`.

### POST `/auth/forgot-password`
- Purpose: Request password reset link.
- Body: `{ email }`.

### POST `/auth/reset-password`
- Purpose: Reset password using token.
- Body: `{ token, password }`.

### POST `/auth/signup` (legacy)
- Behavior: intentionally rejected with guidance to use OTP flow.

## 2. User APIs (`/api/users`)
### POST `/api/users` (ADMIN)
- Create user.

### GET `/api/users` (ADMIN)
- List all users.

### GET `/api/users/{id}`
- Get user by id.

### GET `/api/users/me`
- Get current authenticated user profile.

### POST `/api/users/send-otp`
### POST `/api/users/verify-otp`
- Additional user OTP endpoints exist in controller.

## 3. Activity APIs (`/api/activities`)
### POST `/api/activities`
- Declare a new activity (stage 1).

### POST `/api/activities/{id}/proof` (multipart/form-data)
- Submit proof image + coordinates (+ optional proof time).
- Required fields effectively enforced: proof image, latitude, longitude.

### GET `/api/activities`
- Get current user activities.

### GET `/api/activities/user`
- Alias for current user activities.

### GET `/api/activities/status/{status}`
- List activities filtered by status.

### DELETE `/api/activities/{id}`
- Delete one user-owned activity.

### DELETE `/api/activities/bulk`
- Bulk delete user-owned activities.
- Body: `{ "ids": [1,2,3] }`.

## 4. Admin Activity APIs (`/admin/activities`) (ADMIN)
### GET `/admin/activities`
- List all activities with user metadata.

### GET `/admin/activities/search`
- Filter by query/category/status/date range.
- Query params include: `query`, `category`, `status`, `dateFrom`, `dateTo`, `includeArchived`, `includeDeleted`.

### PUT `/admin/activities/approve/{id}`
- Approve and award points.

### PUT `/admin/activities/reject/{id}`
- Reject with optional reason payload.

### PUT `/admin/activities/ignore-flag/{id}`
- Clear activity flag metadata.

### DELETE `/admin/activities/{id}`
- Delete one activity.

### DELETE `/admin/activities/bulk`
- Bulk delete activities.
- Body: `{ "ids": [1,2,3] }`.

## 5. Proof Session APIs (`/proof` and `/api/proof`)
### POST `/proof/start`
### POST `/api/proof/start`
- Create short-lived proof session (`PRF-...`) for an activity.
- Accepts `activityId` query param and also body fallback.

## 6. Report APIs (`/report` and `/api/report`)
### GET `/report/summary`
### GET `/api/report/summary`
- Params: `month`, `year`.
- Returns monthly summary DTO.

### GET `/report/graph`
### GET `/api/report/graph`
- Param: `year`.
- Returns month-wise points for 12 months.

### GET `/report/progress`
### GET `/api/report/progress`
- Flexible filters: `fromDate`, `toDate`, `granularity`, `activityType`, `status`.

## 7. Leaderboard APIs (`/api/leaderboard`)
### GET `/api/leaderboard`
- Returns ranked top users with badge and point information.

## 8. Questions APIs
### POST `/public/questions`
- Submit public question.

### GET `/public/questions?email=...`
- Fetch submitted questions by email.

### GET `/admin/questions` (ADMIN)
- List all questions.

### POST `/admin/questions/{id}/answer` (ADMIN)
- Save answer and trigger answer email.

## 9. OAuth2 endpoints
- `/oauth2/**` and `/login/oauth2/**` are enabled for OAuth login flow.
- On success, backend redirects to frontend callback URL with token and role.

## 10. Frontend-consumed endpoints (observed)
Actively called by frontend pages:
- `/auth/login`, `/auth/send-otp`, `/auth/verify-otp`, `/auth/resend-otp`, `/auth/forgot-password`, `/auth/reset-password`
- `/api/users/me`
- `/api/activities`, `/api/activities/{id}/proof`, `/api/activities/bulk`
- `/api/proof/start`
- `/api/leaderboard`
- `/admin/activities`, `/admin/activities/search`, `/admin/activities/approve/{id}`, `/admin/activities/reject/{id}`, `/admin/activities/ignore-flag/{id}`, `/admin/activities/bulk`
- `/public/questions`, `/admin/questions`, `/admin/questions/{id}/answer`

## 11. Notes from analysis
- A frontend call to `/auth/verify?token=...` exists in `Verify.jsx`, but this endpoint is not present in current backend controllers.
- Some APIs are available via multiple prefixes (`/report` and `/api/report`, `/proof` and `/api/proof`).
- API response structure is generally wrapped in `ApiResponse<T>` with message/status semantics.