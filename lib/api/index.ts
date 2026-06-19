// Public surface of the admin API module. Consumers import from `@/lib/api`.
// Internal helpers (adminFetch, assertApiBaseUrl, getTokenGetter) stay private
// to the module and are intentionally not re-exported here.
export * from "./types";
export { setTokenGetter } from "./client";
export { api } from "./endpoints";
