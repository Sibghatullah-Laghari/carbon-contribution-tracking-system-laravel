# CCTRS Folder Structure (Complete)

Generated on: 2026-03-21

## 1. Root Overview

```text
carbon-contribution-tracking-system/
├── .github/workflows/               # CI/CD workflow definitions
├── backend/                          # Backend container for Spring project
│   └── cctrs-backend/               # Main Spring Boot service
├── frontend/                         # React + Vite SPA
├── database/                         # SQL schema and migration scripts
├── docs/                             # Documentation files
├── clevercloud/                      # Clever Cloud metadata
├── data/                             # Data/support files
├── README.md                         # Existing project readme (original)
├── PROJECT_README.md                 # Generated read-only documentation
├── test-api.sh                       # API test helper script
└── vercel.json                       # Root deployment config
```

## 2. Backend Layout (`backend/cctrs-backend`)

```text
backend/cctrs-backend/
├── src/main/java/com/cctrs/backend/
│   ├── controller/                   # REST endpoints (activities, reports, admin, etc.)
│   ├── security/                     # JWT, OAuth2, auth controller, security config
│   ├── service/                      # Business logic layer
│   ├── repository/                   # JDBC repositories + SQL queries
│   │   └── mapper/                   # RowMapper classes
│   ├── model/                        # Domain entities/models
│   ├── dto/                          # API DTO payloads
│   ├── config/                       # Swagger, exception handling, misc config
│   ├── startup/                      # Startup loaders and schema migration runner
│   ├── scheduler/                    # Scheduled tasks
│   └── BackendApplication.java       # Spring Boot main class
├── src/main/resources/
│   ├── application.properties        # Runtime config (profile/env-based)
│   ├── application-prod.properties   # Production-focused properties
│   ├── application-prod.yml          # Production yml overrides
│   ├── schema.sql                    # Idempotent schema init
│   └── schema-postgres.sql           # PostgreSQL schema variant
├── src/test/java/                    # Backend tests
├── pom.xml                           # Maven build/dependency config
├── Dockerfile                        # Backend container build
├── mvnw / mvnw.cmd                   # Maven wrappers
└── clevercloud/maven.json            # Clever Cloud app metadata
```

## 3. Frontend Layout (`frontend`)

```text
frontend/
├── src/
│   ├── pages/
│   │   ├── public/                   # Public pages (auth, legal, FAQ, help)
│   │   └── dashboard/                # User/admin dashboard pages
│   ├── layout/                       # Layout wrappers and sidebars
│   ├── context/                      # AuthContext and global auth state
│   ├── api/                          # Axios client + auth utilities
│   ├── config/                       # API base URL resolution
│   ├── components/                   # Reusable UI components
│   │   └── analytics/                # Chart helpers/components
│   ├── App.jsx                       # Route declarations
│   ├── main.jsx                      # React bootstrap
│   └── styles.css                    # Global styles
├── package.json                      # Frontend scripts/dependencies
├── vite.config.js                    # Vite configuration
└── vercel.json                       # Vercel deployment config
```

## 4. Database and Migrations

```text
database/
├── schema.sql
├── migration_add_questions_table.sql
├── migration_add_rejection_reason.sql
├── migration_add_soft_delete_archive.sql
├── migration_add_tree_abuse_flags.sql
└── migration_fix_proof_image_size.sql
```

## 5. Documentation Area

```text
docs/
├── README.md
├── api-design.md
├── architecture.md
├── development-plan.md
├── er-diagram.md
├── architecture-complete.md          # Generated in this run
├── api-reference-complete.md         # Generated in this run
└── folder-structure-complete.md      # Generated in this run
```

## 6. Responsibility Mapping (quick reference)
- `controller/`: HTTP contracts and endpoint orchestration
- `service/`: core business rules and workflows
- `repository/`: SQL persistence and query logic
- `security/`: authn/authz and JWT/OAuth integrations
- `pages/`: feature-specific frontend screens
- `layout/`: shared shell/navigation structures
- `database/`: schema baseline and DB evolution scripts