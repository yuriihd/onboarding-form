# Onboarding Form

The first step of an onboarding flow, where a user enters their personal and business details. Built with React, TypeScript and Vite.

## Getting started

Requires Node.js 20.19 or later.

```bash
npm install
npm run dev
```

The app runs at http://localhost:5173. The API base URL is set in `.env`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build |
| `npm test` | Run the tests in watch mode |
| `npm run lint` | Lint the project with ESLint |

## Tech stack

- React 19, TypeScript, Vite
- React Hook Form with Zod for form state and validation
- CSS Modules
- Vitest and React Testing Library

## Project structure

```
src/
  api/                      API requests and response types
  components/               Reusable UI components (TextField, Button)
  features/onboarding/      Onboarding form, its hook, validation schema and tests
  test/                     Test setup
```

## Validation

All fields are required and are validated on blur and on submit.

| Field | Rules |
| --- | --- |
| First name, last name | Up to 50 characters |
| Phone number | `+1` followed by 10 digits with a Canadian area code |
| Corporation number | 9 digits, then verified with `GET /corporation-number/:number` |

- The corporation number is sent to the API only after it passes the format check. Each result is cached for the lifetime of the form, so validating other fields does not repeat the request. Failed requests are not cached and are retried on the next validation.
- On submit, the values are sent with `POST /profile-details`. A server error message is shown above the submit button. On success, the form is reset and a confirmation is shown.

## Assumptions

- The confirmation after a successful submit only shows that the details were saved. In the full flow, a successful submit would go to step 2.
