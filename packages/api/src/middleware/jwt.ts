import { jwk } from "hono/jwk";
import type { Context } from "hono";

/**
 * JWT validation middleware using Hono's built-in JWK support
 * Validates Auth0 access tokens via JWKS endpoint
 *
 * The JWK middleware automatically:
 * - Fetches JWKS from Auth0's /.well-known/jwks.json endpoint
 * - Caches keys for performance
 * - Validates JWT signatures
 * - Extracts payload to c.get("jwtPayload")
 *
 * Auth0 signs JWTs with RS256 by default (RSA with SHA-256)
 */
export const jwtAuth = jwk({
  jwks_uri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  alg: ["RS256"], // Auth0 default signing algorithm
});

/**
 * Helper to get user ID from JWT payload
 * Auth0 stores the user ID in the 'sub' (subject) claim
 *
 * @param c - Hono context with jwtPayload set by jwtAuth middleware
 * @returns User ID (Auth0 sub claim) or null if not found
 */
export function getUserIdFromJwt(c: Context): string | null {
  const payload = c.get("jwtPayload") as { sub?: string } | undefined;
  return payload?.sub || null;
}
