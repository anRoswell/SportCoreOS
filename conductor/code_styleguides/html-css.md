# HTML & CSS Style Guide for SportCoreOS

## 1. HTML Standards
- **Semantic Tags:** Use `<main>`, `<header>`, `<nav>`, `<section>`, `<article>`, `<aside>`, `<footer>`.
- **Accessibility:** All interactive elements (`<button>`, `<a>`, `<input>`) must have descriptive labels, `title` or `aria-label`.
- **Buttons:** Every button must be wired to a real TypeScript handler with zero stubs.

## 2. CSS Standards
- **Variables & Theming:** Use root CSS custom properties (`--bg-primary`, `--text-primary`, `--emerald`, `--amber`).
- **Glassmorphism & FUT UI:** Keep high-contrast text over dark glass surfaces.
- **Responsiveness:** Fluid Flexbox and CSS Grid layout with mobile breakpoints (`@media (max-width: 768px)`).
