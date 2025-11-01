// src/routes/api/auth/login/+server.ts
import { auth } from "$lib/auth";
import { json } from "@sveltejs/kit";

export async function POST({ request, cookies }) {
  const { username, password } = await request.json();
  
  const result = await auth.signIn.username({
    username,
    password
  }, {
    headers: request.headers
  }
);

  if (result.error) {
    return json({ error: result.error }, { status: 401 });
  }

  // Se precisar setar cookies manualmente (dependendo da configuração do Better Auth)
  if (result.cookies) {
    result.cookies.forEach(cookie => {
      cookies.set(cookie.name, cookie.value, cookie.attributes);
    });
  }

  return json({ user: result.data?.user });
}