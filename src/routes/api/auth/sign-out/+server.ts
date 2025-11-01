import { auth } from "$lib/auth";

export async function POST({ request }) {
	try {
		const result = await auth.api.signOut({
			headers: request.headers,
			asResponse: true
		});

		return result;
	} catch (error) {
		return new Response(JSON.stringify({ error: (error as Error).message || "Sign out failed" }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}