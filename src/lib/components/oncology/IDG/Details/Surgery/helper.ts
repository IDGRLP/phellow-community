import type { Coding } from "fhir/r4";

export function parseResidualstatus(coding: Coding): string | undefined {
	if (!coding.code) return undefined;
	if (
		coding.system !=
		"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-residualstatus-lokal"
	)
		return coding.display || undefined;

	// If the system is correct, return the code
	switch (coding.code) {
		case "R0":
			return "Kein Residualtumor";
		case "R1":
			return "Mikroskopischer Residualtumor";
		case "R2":
			return "Makroskopischer Residualtumor";
		case "RX":
			return "Vorhandensein von Residualtumor kann nicht beurteilt werden";
		default:
			return undefined;
	}
}
