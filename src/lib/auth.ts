import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "$lib/server/db/index";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: "user",
      session: "session",
      account: "account",
      verification: "verification",
    },
  }),
  secret: import.meta.env.BETTER_AUTH_SECRET,

  //sessao do user
  session: {
    expiresIn: (60 * 60 * 24 * 7) //7 Days
  },

  emailAndPassword: {
    enabled: true,
  },
  plugins:
    [admin()]
});