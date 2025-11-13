// src/__tests__/loadEnv.ts
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });
console.log("✅ Loaded test environment:", process.env.MONGODB_URI);
