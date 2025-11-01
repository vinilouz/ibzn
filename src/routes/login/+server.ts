import { auth } from "$lib/auth";
import { json } from "@sveltejs/kit";

export async function POST({ request }) {
  const { email, password } = await request.json();

  try {
    const result = await auth.api.signInEmail({
      body: {
        email,
        password
      },
      asResponse: true,
      headers: request.headers
    });

    return result;
  } catch (error) {
    return json({ error: (error as Error).message || "Login failed" }, { status: 401 });
  }
}