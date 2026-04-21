import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

export const isDbConfigured = Boolean(process.env.DATABASE_URL);

// Graceful no-op wrapper: if DATABASE_URL is unset we must NOT throw at
// module load time, because unrelated imports (e.g. Next.js route handler
// module graph) would crash the build. Route handlers gate on
// `isDbConfigured` and return 503 BEFORE touching `sql`. The Proxy below
// defers the failure to call-site so importing this module is always safe.
export const sql: NeonQueryFunction<false, false> = isDbConfigured
  ? neon(process.env.DATABASE_URL!)
  : (new Proxy((() => {}) as unknown as NeonQueryFunction<false, false>, {
      apply() {
        throw new Error('DATABASE_URL not configured');
      },
    }));
