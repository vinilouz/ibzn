import { auth } from "$lib/auth";
import { json } from "@sveltejs/kit";

export async function POST({ request }) {
	const { error } = await auth.signOut({
		headers: request.headers,
	}
);

	if (error) {
		return json({ error }, { status: 400 });
	}

	return json({ success: true });
}