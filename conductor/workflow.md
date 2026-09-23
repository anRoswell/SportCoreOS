# Project Workflow: SportCoreOS

## Guiding Principles
1. **The Plan is the Source of Truth:** All development is tracked via `plan.md` in Conductor tracks.
2. **Exhaustive E2E & Anti-Regression Testing:** Every module must strictly adhere to `ESTANDAR_PRUEBAS_EXHAUSTIVAS.md` (Strict Error Sniffer, zero uncovered interactive elements, database persistence checks).
3. **Signals-First State Architecture:** Angular state management must leverage Angular Signals (`signal`, `computed`, `effect`).
4. **Clean Multi-Tenant Backend:** All transactional queries in NestJS must enforce `club_id` tenant isolation.

## Quality Gates
- [ ] All Playwright E2E tests pass (0 JS/network sniffer errors).
- [ ] TypeScript compiles cleanly (`npm run build` in API and Web).
- [ ] PostgreSQL queries verify state persistence and foreign key integrity.
- [ ] Mobile view rendering and responsive touch targets tested.
