import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "$lib/server/db/index";
import { username, admin } from "better-auth/plugins";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users: "users",
      sessions: "sessions",
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