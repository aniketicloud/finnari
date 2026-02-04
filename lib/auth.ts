import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { db } from "@/drizzle/db"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 3 * 60 * 60, // 3 hours
    },
  },
  rateLimit: {
    storage: "database",
  },
  plugins: [nextCookies()], // make sure this is the last plugin in the array
})
