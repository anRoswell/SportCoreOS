# Technology Stack: SportCoreOS

## Frontend Web (`SportCoreOS-web`)
- **Framework:** Angular 18/19 Standalone Components
- **State Management:** Angular Signals (`signal`, `computed`, `effect`)
- **Styling:** Custom CSS Design System with CSS Variables, Flexbox, CSS Grid & FontAwesome 6 Pro
- **Routing:** Angular Router with Standalone Routes & Route Guards
- **Testing:** Playwright E2E Test Suite with Strict Error Sniffing & Database Assertions

## Frontend Mobile (`SportCoreOS-mobile`)
- **Framework:** Angular & Ionic Framework (Capacitor Ready)
- **State Management:** Angular Signals & RxJS
- **Styling:** Ionic Components + Custom SportCore Dark Theme

## Backend API (`SportCoreOS-api`)
- **Framework:** NestJS (Node.js & TypeScript)
- **Architecture:** Modular Domain-Driven Architecture (Controllers, Services, Repositories, DTOs)
- **Validation:** `class-validator` & `class-transformer`
- **Security & Auth:** Passport JWT, RBAC Roles, Helmet, CORS
- **Database Driver:** `pg` (PostgreSQL Client with Connection Pooling)

## Database (`SportCoreOS-db`)
- **RDBMS:** PostgreSQL (Relational tables with JSONB fields for flexibility)
- **Multi-Tenancy:** Tenant isolation by `club_id` across all transactional tables
