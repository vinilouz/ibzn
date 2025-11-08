import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "$lib/server/db/index";
import * as schema from "$lib/server/db/schemas";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { admin } from "better-auth/plugins/admin";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: import.meta.env.BETTER_AUTH_SECRET,
  baseURL: import.meta.env.BETTER_AUTH_BASE_URL,

  //sessao do user
  session: {
    expiresIn: (60 * 60 * 24 * 7) //7 Days
  },

  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin(),sveltekitCookies(getRequestEvent)],
});

export type User = typeof schema.user.$inferSelect;
export type Session = typeof schema.session.$inferSelect;


