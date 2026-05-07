import { env } from "$env/dynamic/private";
import { json, text } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
	const accessToken = await locals.validAccessToken();
	const body = await request.text();

	const response = await fetch(`${env.FHIR_BASE_URL}/QuestionnaireResponse`, {
		method: "POST",
		headers: {
			Authorization: "Bearer " + accessToken,
			"Content-Type": "application/fhir+json",
		},
		body,
	});

	if (!response.ok) {
		return text("Upstream FHIR error", { status: response.status });
	}
	const resource = await response.json();
	return json(resource, {
		status: response.status,
		headers: { "content-type": "application/fhir+json" },
	});
};
