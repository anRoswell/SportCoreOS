# Google TypeScript Style Guide Summary

This document summarizes key rules and best practices from the Google TypeScript Style Guide.

## 1. Language Features
- **Variable Declarations:** Always use `const` or `let`. `var` is forbidden. Use `const` by default.
- **Modules:** Use ES6 modules (`import`/`export`).
- **Angular Signals:** Use `signal()`, `computed()`, `input()`, `output()` for Angular component state.
- **Functions:** Prefer function declarations for named functions. Use arrow functions for callbacks.
- **Equality Checks:** Always use triple equals (`===`) and not equals (`!==`).
- **Type Assertions:** Avoid `any`. Prefer strict interfaces and DTO definitions.

## 2. Naming Conventions
- `UpperCamelCase`: Classes, Interfaces, Types, Enums, Components.
- `lowerCamelCase`: Variables, parameters, functions, methods, properties.
- `CONSTANT_CASE`: Global constants and enum values.

## 3. Comments & Clean Code
- Document public APIs with JSDoc.
- Maintain documentation integrity and descriptive commit messages.
