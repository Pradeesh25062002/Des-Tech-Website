# Repository Guidelines

## Project Structure & Module Organization

This repository is an Angular application. Keep application bootstrap and global files in `src/` (`main.ts`, `index.html`, and `styles.css`). Place components, routes, configuration, templates, styles, and focused unit tests in `src/app/`; static files served as-is belong in `public/`. Angular CLI build output goes to `dist/` and should not be committed.

## Build, Test, and Development Commands

Use npm scripts from the repository root:

- `npm install` installs the locked dependencies from `package-lock.json`.
- `npm start` runs the Angular development server at `http://localhost:4200/` with live reload.
- `npm run build` creates the production build in `dist/`.
- `npm run watch` rebuilds continuously with development settings.
- `npm test` runs unit tests through Angular CLI and Vitest.

## Coding Style & Naming Conventions

Follow `.editorconfig` and `.prettierrc`: UTF-8, two-space indentation, final newlines, single quotes, and a 100-character print width. Use Angular CLI conventions: PascalCase class names (for example, `App`), kebab-case file names (for example, `app.routes.ts`), and the configured `app` selector prefix. Keep templates and component styles alongside their component where practical. Format changed files consistently with Prettier.

## Testing Guidelines

Unit tests use Vitest with Angular's testing utilities. Name tests `*.spec.ts` and colocate them with the code they cover; `src/app/app.spec.ts` is the current example. Add or update tests for changed behavior, then run `npm test`. There is no configured end-to-end test framework or stated coverage threshold.

## Commit & Pull Request Guidelines

The available history contains only `initial commit`, so no established commit convention is visible. Write concise imperative commit subjects that describe one change, such as `Add navigation route`. Pull requests should explain the user-visible change, note relevant tests or build checks, link related issues when applicable, and include screenshots for visual changes.

## Security & Configuration

Do not commit secrets, local environment files, dependency directories, or generated build output. Keep dependency changes reflected in both `package.json` and `package-lock.json`.

## DES-TECH Academy Homepage

- The app is a static informational site for DES-TECH ACADEMY — Centre for Advanced Professional Studies. Keep it frontend-only; do not add a backend, database, authentication, API integration, or unnecessary dependencies.
- Preserve the supplied DES-TECH logo as-is and use the original file from `public/` (or its existing asset location). Do not redraw it or apply filters.
- Follow the approved editorial direction: warm cream, deep navy, restrained red accents, serif display headings, clean sans-serif body text, fine borders, and generous whitespace.
- Keep homepage sections in this order: navigation, hero, training benefits, Why Destech, courses, career CTA, and simplified footer. The footer contains only the official logo, configured address, and configured phone number.
- Keep repeated course, benefit, and feature copy in static TypeScript data. Keep images local when available, use descriptive alt text for meaningful images, and use stable, clearly replaceable asset paths.
- Maintain responsive layouts from 320px mobile through desktop. Navigation must work with keyboard and touch; provide visible focus states and respect reduced-motion preferences.
- Link navigation and calls to action to same-page anchors. Do not invent additional pages or implement form submission.
- Do not push changes to GitHub unless the user explicitly asks.
