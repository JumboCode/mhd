import "dotenv/config";

export default {
    out: "./drizzle",
    schema: "./src/lib/schema.ts",
    dbCredentials: {
        connectionString: process.env.DATABASE_URL!,
    },
};
