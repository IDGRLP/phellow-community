import type { TNMPrefix, TNMStaging } from "$lib/types/oncology_types";
import type { Bundle, Observation } from "fhir/r4";

type TNMCategory = "t" | "n" | "m";

interface TNMCategoryData {
	value?: string;
	prefix?: TNMPrefix;
}

/**
 * Extracts TNM prefix from observation extension
 */
function extractTNMPrefix(observation: Observation): TNMPrefix | undefined {
	const tnmPrefixExtension = observation.extension?.find(
		(ext) =>
			ext.url ===
			"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/tnm-prefix"
	);

	const prefixCoding = tnmPrefixExtension?.extension?.find(
		(subExt) => subExt.url === "praefix"
	)?.valueCoding;

	if (
		prefixCoding?.system ===
			"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-tnm-praefix" &&
		prefixCoding.code
	) {
		return prefixCoding.code as TNMPrefix;
	}

	return undefined;
}

/**
 * Finds TNM category observation by profile URL
 */
function findTNMCategoryObservation(
	members: Observation[],
	category: TNMCategory
): Observation | undefined {
	const profileUrl = `https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-tnm-kategorie-${category}`;

	return members.find((m) => m.meta?.profile?.some((profile) => profile === profileUrl));
}

/**
 * Extracts TNM category value from observation
 */
function extractTNMCategoryValue(observation: Observation): string | undefined {
	return observation.valueCodeableConcept?.coding?.find(
		(c) =>
			c.system ===
			"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-tnm-kategorie"
	)?.code;
}

/**
 * Normalizes TNM category value using category-specific regex patterns
 */
function normalizeTNMValue(value: string, category: TNMCategory): string {
	switch (category) {
		case "t":
			return value.replace(/^[Tt]([01234xX]*(is|[abc])*).*/, "$1");
		case "n":
			return value.replace(/^[Nn]([01234xX]*[abc]*).*/, "$1");
		case "m":
			return value.replace(/^[Mm](\d).*/, "$1");
		default:
			return value;
	}
}

/**
 * Extracts complete TNM category data (value and prefix)
 */
function extractTNMCategoryData(members: Observation[], category: TNMCategory): TNMCategoryData {
	const observation = findTNMCategoryObservation(members, category);
	if (!observation) {
		return {};
	}

	const rawValue = extractTNMCategoryValue(observation);
	const value = rawValue ? normalizeTNMValue(rawValue, category) : undefined;
	const prefix = extractTNMPrefix(observation);

	return { value, prefix };
}

/**
 * Parses a stage group observation from a FHIR bundle to extract TNM data
 */
export function parseStageGroupObservation(
	observationId: string,
	bundle: Bundle
): TNMStaging | null {
	// Find the stage group observation
	const stageGroupObservation = bundle.entry?.find((entry) => entry.resource?.id === observationId)
		?.resource as Observation | undefined;

	if (!stageGroupObservation) {
		return null;
	}

	const prefix = extractTNMPrefix(stageGroupObservation);

	// Extract effective date
	const date = stageGroupObservation.effectiveDateTime
		? new Date(stageGroupObservation.effectiveDateTime)
		: undefined;

	if (!date) {
		return null;
	}

	// Extract TNM version from method coding
	const versionCoding = stageGroupObservation.method?.coding?.find(
		(coding) =>
			coding.system ===
			"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-tnm-version"
	);

	const version = versionCoding?.code as "6" | "7" | "8" | undefined;

	// Extract member IDs
	const memberIds: string[] = stageGroupObservation.hasMember
		? stageGroupObservation.hasMember
				.map((member) => member.reference?.replace("Observation/", ""))
				.filter((id): id is string => id !== undefined)
		: [];

	// Get member observations
	const members = memberIds
		.map((id) => {
			return bundle.entry?.find((e) => e.resource?.id === id)?.resource as Observation | undefined;
		})
		.filter((member): member is Observation => member !== undefined);

	// Extract TNM category data
	const tData = extractTNMCategoryData(members, "t");
	const nData = extractTNMCategoryData(members, "n");
	const mData = extractTNMCategoryData(members, "m");

	// Build prefix object with individual category prefixes taking precedence over global prefix
	const prefixObject: { t?: TNMPrefix; n?: TNMPrefix; m?: TNMPrefix } = {};

	if (tData.prefix || nData.prefix || mData.prefix) {
		// Use individual prefixes when available
		if (tData.prefix) prefixObject.t = tData.prefix;
		if (nData.prefix) prefixObject.n = nData.prefix;
		if (mData.prefix) prefixObject.m = mData.prefix;
	} else if (prefix) {
		// Fall back to global prefix for all categories
		prefixObject.t = prefix;
		prefixObject.n = prefix;
		prefixObject.m = prefix;
	}

	return {
		date,
		t: tData.value,
		n: nData.value,
		m: mData.value,
		prefix: prefixObject,
		...(version && { version }),
	};
}
