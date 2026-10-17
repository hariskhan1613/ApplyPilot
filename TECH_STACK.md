# Technology Stack --- ApplyPilot

## Frontend

-   **React + Vite:** component-based SPA and fast development/build.
    React renders from state; Vite serves during development and bundles
    production assets.
-   **React Router:** explicit route mapping. Client route guards
    improve UX but do not secure API endpoints.
-   **CSS:** design tokens, responsive layout, Light/Dark/System themes.
    Prefer CSS variables over hard-coded colors.
-   **HTTP client:** use native `fetch` or one consistent client;
    centralize base URL, credentials, JSON parsing, and error
    normalization.

## Backend

-   **Node.js:** JavaScript runtime.
-   **Express:** routes, middleware, HTTP handling, central errors.
-   **dotenv:** local environment config; never commit `.env`.
-   **cors:** allow the configured frontend origin; use explicit
    production origin.
-   **MongoDB + Mongoose:** document storage, schemas, validation and
    indexes. Schema validation does not replace request validation or
    authorization.

## Security

-   Use a maintained password-hashing library (bcrypt or Argon2); never
    store plaintext passwords.
-   Choose one documented auth strategy. Prefer secure HttpOnly cookies
    when correctly configured; configure SameSite/Secure and CSRF
    protection as required. If using bearer tokens, document storage and
    XSS risks.
-   Validate body, params, query, uploads, and AI output. Rate-limit
    auth and AI endpoints before public deployment.

## AI

Call the LLM only from Express. Keep keys in server environment
variables. Use structured output, validate it, handle
timeout/quota/malformed output, and treat resume/JD content as untrusted
user text. Never promise ATS score or job outcomes.

## PDF

Use a maintained server-side text extraction library. Enforce file
size/type limits, avoid permanent file storage unless needed, and clean
temporary files. Scanned PDF OCR is out of scope unless explicitly
added.

## Testing/deployment

Test auth, ownership isolation, CRUD, validation, and AI failure paths.
Deploy frontend to Vercel or equivalent, backend to a Node host, and
database to MongoDB Atlas or equivalent. Configure production
URLs/CORS/environment variables and verify one complete live workflow.

## Avoid overengineering

No Redis, Kafka, RabbitMQ, Elasticsearch, microservices, or Docker
unless a demonstrated approved requirement appears.
