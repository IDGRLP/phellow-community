import { env } from "$env/dynamic/private";
import { json, text } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals }) => {
	const subject = url.searchParams.get("subject");
	if (!subject) {
		return text("Bad Request: missing 'subject' query param", { status: 400 });
	}

	const accessToken = await locals.validAccessToken();
	const headers = {
		Authorization: "Bearer " + accessToken,
	};

	const target = new URL(`${env.FHIR_BASE_URL}/QuestionnaireResponse`);
	target.searchParams.set("subject", subject);

	const response = await fetch(target.toString(), { headers });
	if (!response.ok) {
		return text("Upstream FHIR error", { status: response.status });
	}
	const bundle = await response.json();
	return json(bundle, { status: 200, headers: { "content-type": "application/json+fhir" } });
};
