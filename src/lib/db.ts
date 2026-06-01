import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/lib/schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let _db: Db | null = null;

// Lazily initialized so importing this module never touches DATABASE_URL —
// only calling getDb() does. Without this, `next build` crashes during page
// data collection on any deploy where the database hasn't been provisioned
// yet (e.g. before the Neon integration is added).
export function getDb(): Db {
    if (!_db) {
        const sql = neon(process.env.DATABASE_URL!);
        _db = drizzle(sql, { schema });
    }
    return _db;
}
