import { parseFHIRBundle } from "$components/oncology/IDG/parseBundle";
import { env } from "$env/dynamic/private";
import { parseJWT } from "@oslojs/jwt";
import { error } from "@sveltejs/kit";
import type { Bundle } from "fhir/r4";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, url }) => {
	const accessToken = await locals.validAccessToken();
	const [, payload] = parseJWT(accessToken);
	if ("scope" in payload) {
		const scope = payload.scope as string;
		if (scope.includes("module_onco")) {
			let fileParam = url.searchParams.get("file");
			console.log("Fetching oncology data, file param:", fileParam);
			let fetchURL = new URL(env.FHIR_ONCOLOGY_URL ?? `${env.FHIR_BASE_URL!}/Patient/$oncology`);
			if (fileParam) {
				fetchURL.searchParams.set("file", fileParam);
			}
			console.log("Fetch URL:", fetchURL.toString());
			const accessToken = await locals.validAccessToken();
			const headers = {
				Authorization: "Bearer " + accessToken,
				"Content-Type": "application/json; charset=utf-8",
			};
			const bundle = await fetch(fetchURL, { headers }).then(async (response) => {
				if (!response.ok) {
					throw error(response.status, response.statusText);
				}
				return (await response.json()) as Bundle;
			});
			const events = parseFHIRBundle(bundle);

			return {
				events,
				bundle,
			};
		} else {
			return error(403, "You do not have access to this module");
		}
	}
	return error(403, "You do not have access to this module");
}) satisfies PageServerLoad;
