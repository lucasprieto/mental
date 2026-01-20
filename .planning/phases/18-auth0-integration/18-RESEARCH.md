# Phase 18: Auth0 Integration - Research

**Researched:** 2026-01-20
**Domain:** Auth0 authentication + per-user API keys for MCP server access
**Confidence:** HIGH

<research_summary>
## Summary

Researched Auth0 integration patterns for a Next.js webapp + Hono API architecture. The standard approach uses `@auth0/nextjs-auth0` v4 for the webapp (with App Router middleware) and either `@auth0/auth0-hono` or Hono's built-in JWK middleware for API authentication.

**Critical finding:** Auth0 does NOT natively support per-user API keys. The recommended approach is to use Auth0 for user authentication, then manage our own API keys table in the database. Store only hashed keys (SHA-256), show the key only once at creation, validate by hashing incoming keys and comparing.

**Primary recommendation:** Use nextjs-auth0 v4 for webapp, JWK middleware for API JWT validation, and a custom `api_keys` table with hashed keys for MCP server authentication.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @auth0/nextjs-auth0 | ^4.0.0 | Next.js auth | Official Auth0 SDK, App Router native |
| hono/jwk | built-in | API JWT validation | Validates Auth0 tokens via JWKS endpoint |
| @paralleldrive/cuid2 | ^2.x | API key generation | Collision-resistant unique IDs |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @auth0/auth0-hono | ^0.x | Full Auth0 for Hono | If Hono needs session auth (not our case) |
| jose | ^5.x | JWT utilities | If custom JWT handling needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| nextjs-auth0 | next-auth | next-auth more flexible but Auth0 SDK simpler for pure Auth0 |
| JWK middleware | auth0-hono | auth0-hono is session-based, JWK is stateless (better for API) |
| SHA-256 hash | bcrypt | bcrypt slower (overkill for random API keys) |

**Installation:**
```bash
# Webapp
npm install @auth0/nextjs-auth0

# API (already has Hono)
# JWK middleware is built into Hono, no install needed
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
packages/
├── webapp/
│   ├── lib/
│   │   └── auth0.ts          # Auth0 client instance
│   ├── middleware.ts         # Auth0 middleware (REQUIRED)
│   └── app/
│       ├── auth/             # Auto-handled by middleware
│       ├── dashboard/        # Protected pages
│       └── api-keys/         # Key management UI
├── api/
│   ├── middleware/
│   │   ├── auth.ts           # JWK validation for webapp calls
│   │   └── api-key.ts        # API key validation for MCP
│   └── routes/
│       └── api-keys.ts       # CRUD for user's API keys
└── db/
    └── schema-pg.ts          # Add users + api_keys tables
```

### Pattern 1: Next.js Auth0 v4 Setup
**What:** Middleware-based auth that auto-handles /auth/* routes
**When to use:** All Next.js App Router apps with Auth0
**Example:**
```typescript
// lib/auth0.ts
import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  appBaseUrl: process.env.AUTH0_BASE_URL!,
  secret: process.env.AUTH0_SECRET!,
});

// middleware.ts
import { auth0 } from "./lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const authRes = await auth0.middleware(request);

  // Let /auth routes through
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return authRes;
  }

  // Protect dashboard
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const session = await auth0.getSession(request);
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return authRes;
}
```

### Pattern 2: Hono JWK Middleware for API
**What:** Validate Auth0 access tokens in API routes using JWKS
**When to use:** API endpoints called by authenticated webapp
**Example:**
```typescript
// api/middleware/auth.ts
import { jwk } from "hono/jwk";

export const jwtAuth = jwk({
  jwks_uri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

// Usage in route
app.use("/api/protected/*", jwtAuth);
app.get("/api/protected/keys", (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.sub; // Auth0 user ID
  // ... fetch user's API keys
});
```

### Pattern 3: API Key Authentication for MCP
**What:** Validate hashed API keys for MCP server requests
**When to use:** MCP server calls to API (not browser, no cookies)
**Example:**
```typescript
// api/middleware/api-key.ts
import { createMiddleware } from "hono/factory";
import { createHash } from "crypto";

export const apiKeyAuth = createMiddleware(async (c, next) => {
  const apiKey = c.req.header("X-API-Key");
  if (!apiKey) {
    return c.json({ error: "API key required" }, 401);
  }

  // Hash the incoming key
  const hashedKey = createHash("sha256").update(apiKey).digest("hex");

  // Look up in database
  const db = getDb();
  const keyRecord = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, hashedKey))
    .limit(1);

  if (!keyRecord.length) {
    return c.json({ error: "Invalid API key" }, 401);
  }

  // Attach user to context
  c.set("userId", keyRecord[0].userId);
  await next();
});
```

### Pattern 4: API Key Generation
**What:** Create secure random API keys, show once, store hash
**When to use:** When user creates new API key
**Example:**
```typescript
// api/routes/api-keys.ts
import { createId } from "@paralleldrive/cuid2";
import { createHash, randomBytes } from "crypto";

async function createApiKey(userId: string) {
  // Generate secure random key with prefix
  const rawKey = `mental_${randomBytes(32).toString("hex")}`;

  // Hash for storage
  const keyHash = createHash("sha256").update(rawKey).digest("hex");

  // Store hash only
  await db.insert(apiKeys).values({
    id: createId(),
    userId,
    keyHash,
    name: "Default Key",
    createdAt: new Date(),
  });

  // Return raw key ONLY THIS ONCE
  return { key: rawKey, message: "Save this key - it won't be shown again" };
}
```

### Anti-Patterns to Avoid
- **Storing raw API keys:** Always hash with SHA-256, never store plaintext
- **Using Auth0 M2M per user:** Creates tenant management nightmare
- **Putting session secret in code:** Use environment variables
- **Skipping middleware.ts:** v4 REQUIRES middleware for auth routes
- **Creating /app/auth/[...auth0]/route.ts:** v4 handles routes automatically
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT validation | Custom decode + verify | Hono JWK middleware | JWKS rotation, caching, algorithm support |
| Session management | Cookie handling | @auth0/nextjs-auth0 | Rolling sessions, CSRF, secure cookies |
| API key generation | Math.random() | crypto.randomBytes | Cryptographically secure randomness |
| Password hashing | Custom hash | N/A (Auth0 handles) | Auth0 manages user credentials |
| Token refresh | Manual refresh logic | Auth0 SDK | Automatic silent refresh |

**Key insight:** Auth0 handles the complex auth flows (login, logout, token refresh, session management). We only need to validate tokens and manage our own API keys table. Don't try to replicate Auth0 features.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Missing middleware.ts
**What goes wrong:** Auth routes (/auth/login, /auth/callback) return 404
**Why it happens:** nextjs-auth0 v4 requires middleware to mount auth routes automatically
**How to avoid:** Always create middleware.ts in project root with auth0.middleware()
**Warning signs:** "Page not found" on /auth/login

### Pitfall 2: Storing Raw API Keys
**What goes wrong:** Database breach exposes all user API keys
**Why it happens:** Treating API keys like passwords but storing plaintext
**How to avoid:** Hash with SHA-256 before storage, show key only at creation
**Warning signs:** API keys visible in database queries

### Pitfall 3: Wrong Auth for MCP
**What goes wrong:** MCP server can't authenticate (no browser cookies)
**Why it happens:** Using session-based auth for non-browser client
**How to avoid:** Use API key header auth for MCP, JWT/session only for webapp
**Warning signs:** MCP getting 401 despite correct credentials

### Pitfall 4: CORS Issues
**What goes wrong:** Webapp can't call API due to CORS
**Why it happens:** API doesn't allow webapp origin
**How to avoid:** Configure CORS middleware with webapp URL
**Warning signs:** "CORS policy" errors in browser console

### Pitfall 5: Auth0 User ID Mismatch
**What goes wrong:** Can't link Auth0 users to database records
**Why it happens:** Using email instead of `sub` claim as user ID
**How to avoid:** Always use `sub` (Auth0 user ID) as foreign key
**Warning signs:** Duplicate users, lookup failures
</common_pitfalls>

<code_examples>
## Code Examples

### Database Schema for Users and API Keys
```typescript
// Source: Custom pattern following best practices
// packages/db/src/schema-pg.ts

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Auth0 sub claim
  email: text("email").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => users.id),
  keyHash: text("key_hash").notNull().unique(), // SHA-256 hash
  name: text("name").notNull().default("Default Key"),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Protected Page (Server Component)
```typescript
// Source: Context7 @auth0/nextjs-auth0 EXAMPLES.md
// packages/webapp/app/dashboard/page.tsx

import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/auth/login?returnTo=/dashboard");
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

### API Key Validation Middleware
```typescript
// Source: Custom pattern following Hono middleware conventions
// packages/api/src/middleware/api-key.ts

import { createMiddleware } from "hono/factory";
import { createHash } from "crypto";
import { eq } from "drizzle-orm";
import { getDb } from "../db.js";
import { apiKeys } from "@mental/db";

export const apiKeyAuth = createMiddleware(async (c, next) => {
  const key = c.req.header("X-API-Key");

  if (!key) {
    return c.json({ error: "X-API-Key header required" }, 401);
  }

  const keyHash = createHash("sha256").update(key).digest("hex");
  const db = getDb();

  const [record] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);

  if (!record) {
    return c.json({ error: "Invalid API key" }, 401);
  }

  // Update last used timestamp (fire and forget)
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, record.id))
    .execute();

  c.set("userId", record.userId);
  c.set("apiKeyId", record.id);

  await next();
});
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| nextjs-auth0 v3 (Route Handler) | nextjs-auth0 v4 (Middleware) | 2024 | Simpler setup, auto-mounted routes |
| @auth0/nextjs-auth0/edge export | Single package (edge by default) | v4 | No separate edge import needed |
| withPageAuthRequired HOC | getSession() check | v4 | More explicit, same functionality |

**New tools/patterns to consider:**
- **@auth0/auth0-hono:** Official Auth0 middleware for Hono (new, useful if session auth needed in API)
- **Hono JWK middleware:** Built-in, validates against JWKS endpoint with caching

**Deprecated/outdated:**
- **Route Handler pattern:** Don't create /app/auth/[...auth0]/route.ts in v4
- **withApiAuthRequired:** Removed in v4, use getSession() or JWK middleware
</sota_updates>

<open_questions>
## Open Questions

1. **Multi-key support per user?**
   - What we know: Schema supports multiple keys per user
   - What's unclear: Should we limit number of keys? Add key descriptions?
   - Recommendation: Start with unlimited keys, add limits if abuse occurs

2. **Key rotation UX?**
   - What we know: Old key should be invalidated when new one created
   - What's unclear: Grace period? Notify user of expiring keys?
   - Recommendation: Immediate invalidation on regenerate, no grace period (simpler)
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- /auth0/nextjs-auth0 - Context7 - setup, middleware, protected pages, API routes
- /honojs/website - Context7 - JWK middleware configuration
- /auth0-lab/auth0-hono - Context7 - Hono Auth0 middleware patterns

### Secondary (MEDIUM confidence)
- [Auth0 Community - API keys for users](https://community.auth0.com/t/api-keys-for-users/69505) - Confirmed Auth0 doesn't support native per-user keys
- [Hono JWK middleware docs](https://hono.dev/docs/middleware/builtin/jwk) - Verified JWK setup
- [Zuplo API Key Best Practices](https://zuplo.com/blog/2022/12/01/api-key-authentication) - Hash storage patterns

### Tertiary (LOW confidence - needs validation)
- None - all findings verified
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Auth0 + Next.js + Hono
- Ecosystem: nextjs-auth0 v4, Hono JWK, crypto
- Patterns: JWT validation, API key hashing, middleware auth
- Pitfalls: Missing middleware, raw key storage, wrong auth type

**Confidence breakdown:**
- Standard stack: HIGH - official Auth0 SDKs, verified with Context7
- Architecture: HIGH - patterns from official docs and examples
- Pitfalls: HIGH - documented in migration guides and community
- Code examples: HIGH - from Context7 and official sources

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (30 days - Auth0 SDK stable)
</metadata>

---

*Phase: 18-auth0-integration*
*Research completed: 2026-01-20*
*Ready for planning: yes*
