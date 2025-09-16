import type { Coding, Observation } from "fhir/r4";

// Helper function to determine status color
function getStatusColor(code: string) {
	const responseMap: Record<string, string> = {
		// Overall assessment codes
		K: "bg-gray-500", // Complete response
		P: "bg-gray-500", // Progression
		R: "bg-gray-500", // Partial remission
		S: "bg-gray-500", // Stable disease
		B: "bg-gray-500", // Clinical improvement
		V: "bg-gray-500", // Deterioration
		U: "bg-gray-500", // Unknown

		// Primary tumor codes
		N: "bg-gray-500", // No evidence of primary tumor
		T: "bg-gray-500", // Residual tumor
		Y: "bg-gray-500", // Primary tumor disappeared
		X: "bg-gray-500", // Primary tumor cannot be assessed

		// Lymph node codes
		L: "bg-gray-500", // No evidence of regional lymph node involvement
		F: "bg-gray-500", // First manifestation of lymph node involvement
		Z: "bg-gray-500", // Regression of known lymph node involvement

		// Distant metastasis codes
		M: "bg-gray-500", // First manifestation of distant metastasis
		A: "bg-gray-500", // Progression of known distant metastasis
		D: "bg-gray-500", // Regression of known distant metastasis
	};

	return responseMap[code] || "bg-gray-500";
}

const responseMap: Record<string, string> = {
	V: "Vollremission",
	T: "Teilremission",
	K: "Keine Veränderung",
	P: "Progression",
	D: "divergentes Geschehen",
	B: "klinische Besserung des Zustandes, Teilremissionkriterien jedoch nicht erfüllt",
	R: "Vollremission mit residualen Auffälligkeiten",
	Y: "Rezidiv",
	U: "Beurteilung unmöglich",
	X: "fehlende Angabe",
};

function parseGesamtbeurteilung(coding: Coding): string {
	if (!coding.code) return "Unbekannt";
	return responseMap[coding.code] || coding.display || "Unbekannt";
}

function getGesamtbeurteilungCoding(progression: Observation): Coding | undefined {
	return progression.valueCodeableConcept?.coding?.find(
		(coding) =>
			coding.system ===
			"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-verlauf-gesamtbeurteilung"
	);
}

function formatDate(dateString?: string) {
	if (!dateString) return "Unbekannt";
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("de-DE", {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(date);
}

export { formatDate, getGesamtbeurteilungCoding, getStatusColor, parseGesamtbeurteilung };
