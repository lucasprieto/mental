# Mental API

Hono-based REST API for the Mental thought capture system.

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your DATABASE_URL and AUTH0_DOMAIN

# Build
pnpm build

# Run
pnpm start
```

## Authentication

The API supports two authentication methods:

### 1. JWT (for Webapp)

Used by the Next.js webapp. Tokens are issued by Auth0 and validated via JWKS.

**Header:** `Authorization: Bearer {jwt_token}`

The JWT is validated against Auth0's JWKS endpoint:
- `https://{AUTH0_DOMAIN}/.well-known/jwks.json`
- Uses RS256 algorithm (Auth0 default)
- User ID extracted from `sub` claim

### 2. API Key (for MCP Server)

Used by the MCP server and other programmatic clients. Keys are stored as SHA-256 hashes.

**Header:** `X-API-Key: mental_{random_key}`

API keys are:
- Generated via POST `/api-keys`
- Shown only once at creation (store securely!)
- Validated by hashing and comparing to stored hash

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# Required for JWT auth (webapp)
AUTH0_DOMAIN=your-tenant.auth0.com
```

## Protecting Routes

Auth middleware is ready but not yet enforced. To protect routes:

```typescript
import { auth } from "./middleware/auth.js";

// Protect all /items routes
app.use("/items/*", auth);

// Access user info in handlers
app.get("/items", (c) => {
  const userId = c.get("userId");           // Auth0 sub or user ID
  const authMethod = c.get("authMethod");   // "jwt" | "api_key"
  const apiKeyId = c.get("apiKeyId");       // Only for api_key auth
  // ...
});
```

## Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| GET /health | Health check | No |
| /items/* | Thought CRUD | No (Phase 19/20) |
| /sessions/* | Session management | No (Phase 19/20) |
| /followups/* | Followup management | No (Phase 19/20) |
| /api-keys/* | API key CRUD | No (Phase 19/20) |

## Middleware Files

| File | Purpose |
|------|---------|
| `middleware/jwt.ts` | JWT validation via Hono JWK (Auth0 JWKS) |
| `middleware/api-key.ts` | API key validation (SHA-256 hash lookup) |
| `middleware/auth.ts` | Combined middleware (accepts JWT or API key) |

## Auth Flow

```
                    +-----------------+
                    |   API Request   |
                    +--------+--------+
                             |
              +--------------+--------------+
              |                             |
     Authorization: Bearer          X-API-Key: mental_xxx
              |                             |
              v                             v
    +-------------------+         +-------------------+
    | JWKS Validation   |         | Hash + DB Lookup  |
    | (Auth0 RS256)     |         | (SHA-256)         |
    +-------------------+         +-------------------+
              |                             |
              v                             v
    +-----------------------------------------+
    |  c.set("userId", ...)                   |
    |  c.set("authMethod", "jwt" | "api_key") |
    +-----------------------------------------+
              |
              v
        Route Handler
```

## Development

```bash
# Run in development
pnpm dev

# Build for production
pnpm build

# Type check
pnpm typecheck
```
