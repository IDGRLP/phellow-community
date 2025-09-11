import type { Coding } from "fhir/r4";

export function parseSeitenlokalisation(coding: Coding): string | undefined {
	if (!coding.code) return undefined;
	if (
		coding.system !=
		"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-seitenlokalisation"
	)
		return coding.display || undefined;

	// If the system is correct, return the code
	switch (coding.code) {
		case "L":
			return "links";
		case "R":
			return "rechts";
		case "B":
			return "beidseitig";
		case "M":
			return "mittig";
		case "U":
			return "unbekannt";
		case "T":
			return "trifft nicht zu";
		default:
			return undefined;
	}
}
