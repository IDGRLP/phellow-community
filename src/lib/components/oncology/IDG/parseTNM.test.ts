import type { Bundle, Observation } from "fhir/r4";
import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { parseStageGroupObservation } from "./parseTNM";

describe("parseStageGroupObservation", () => {
	it("should return null for non-existent observation ID", () => {
		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [],
		};

		const result = parseStageGroupObservation("non-existent-id", bundle);
		expect(result).toBeNull();
	});

	it("should return null for bundle without entries", () => {
		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
		};

		const result = parseStageGroupObservation("any-id", bundle);
		expect(result).toBeNull();
	});

	it("should return null when stage group observation has no date", () => {
		const stageGroupObservation: Observation = {
			resourceType: "Observation",
			id: "stage-group-1",
			status: "final",
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21908-9",
						display: "Stage group",
					},
				],
			},
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: stageGroupObservation }],
		};

		const result = parseStageGroupObservation("stage-group-1", bundle);
		expect(result).toBeNull();
	});

	it("should parse basic stage group observation with date", () => {
		const stageGroupObservation: Observation = {
			resourceType: "Observation",
			id: "stage-group-1",
			status: "final",
			effectiveDateTime: "2023-05-15T10:30:00Z",
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21908-9",
						display: "Stage group",
					},
				],
			},
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: stageGroupObservation }],
		};

		const result = parseStageGroupObservation("stage-group-1", bundle);
		expect(result).toEqual({
			date: new Date("2023-05-15T10:30:00Z"),
			t: undefined,
			n: undefined,
			m: undefined,
			prefix: {},
		});
	});

	it("should extract TNM version from method coding", () => {
		const stageGroupObservation: Observation = {
			resourceType: "Observation",
			id: "stage-group-1",
			status: "final",
			effectiveDateTime: "2023-05-15T10:30:00Z",
			method: {
				coding: [
					{
						system:
							"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-tnm-version",
						code: "8",
					},
				],
			},
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21908-9",
						display: "Stage group",
					},
				],
			},
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: stageGroupObservation }],
		};

		const result = parseStageGroupObservation("stage-group-1", bundle);
		expect(result?.version).toBe("8");
	});

	it("should extract global TNM prefix from stage group observation", () => {
		const stageGroupObservation: Observation = {
			resourceType: "Observation",
			id: "stage-group-1",
			status: "final",
			effectiveDateTime: "2023-05-15T10:30:00Z",
			extension: [
				{
					extension: [
						{ url: "kategorie", valueCode: "T" },
						{
							url: "praefix",
							valueCoding: {
								system:
									"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-tnm-praefix",
								code: "p",
							},
						},
					],
					url: "https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/tnm-prefix",
				},
			],
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21908-9",
						display: "Stage group",
					},
				],
			},
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: stageGroupObservation }],
		};

		const result = parseStageGroupObservation("stage-group-1", bundle);
		expect(result?.prefix).toEqual({ t: "p", n: "p", m: "p" });
	});

	it("should parse complete TNM data with T, N, M categories", () => {
		const tCategory: Observation = {
			resourceType: "Observation",
			id: "t-category-1",
			status: "final",
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21905-5",
						display: "Primary tumor.clinical [Class] Cancer",
					},
				],
			},
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-tnm-kategorie-t",
				],
			},
			valueCodeableConcept: {
				coding: [
					{
						system:
							"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-tnm-kategorie",
						code: "T2",
					},
				],
			},
		};

		const nCategory: Observation = {
			resourceType: "Observation",
			id: "n-category-1",
			status: "final",
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21906-3",
						display: "Regional lymph nodes.clinical [Class] Cancer",
					},
				],
			},
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-tnm-kategorie-n",
				],
			},
			valueCodeableConcept: {
				coding: [
					{
						system:
							"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-tnm-kategorie",
						code: "N1",
					},
				],
			},
		};

		const mCategory: Observation = {
			resourceType: "Observation",
			id: "m-category-1",
			status: "final",
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21907-1",
						display: "Distant metastases.clinical [Class] Cancer",
					},
				],
			},
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-tnm-kategorie-m",
				],
			},
			valueCodeableConcept: {
				coding: [
					{
						system:
							"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-tnm-kategorie",
						code: "M0",
					},
				],
			},
		};

		const stageGroupObservation: Observation = {
			resourceType: "Observation",
			id: "stage-group-1",
			status: "final",
			effectiveDateTime: "2023-05-15T10:30:00Z",
			method: {
				coding: [
					{
						system:
							"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-tnm-version",
						code: "8",
					},
				],
			},
			hasMember: [
				{ reference: "Observation/t-category-1" },
				{ reference: "Observation/n-category-1" },
				{ reference: "Observation/m-category-1" },
			],
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21908-9",
						display: "Stage group",
					},
				],
			},
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [
				{ resource: stageGroupObservation },
				{ resource: tCategory },
				{ resource: nCategory },
				{ resource: mCategory },
			],
		};

		const result = parseStageGroupObservation("stage-group-1", bundle);
		expect(result).toEqual({
			date: new Date("2023-05-15T10:30:00Z"),
			version: "8",
			t: "2",
			n: "1",
			m: "0",
			prefix: {},
		});
	});

	it("should handle complex T category values with suffixes", () => {
		const tCategory: Observation = {
			resourceType: "Observation",
			id: "t-category-1",
			status: "final",
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21905-5",
						display: "Primary tumor.clinical [Class] Cancer",
					},
				],
			},
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-tnm-kategorie-t",
				],
			},
			valueCodeableConcept: {
				coding: [
					{
						system:
							"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-tnm-kategorie",
						code: "T2ais(m)",
					},
				],
			},
		};

		const stageGroupObservation: Observation = {
			resourceType: "Observation",
			id: "stage-group-1",
			status: "final",
			effectiveDateTime: "2023-05-15T10:30:00Z",
			hasMember: [{ reference: "Observation/t-category-1" }],
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21908-9",
						display: "Stage group",
					},
				],
			},
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: stageGroupObservation }, { resource: tCategory }],
		};

		const result = parseStageGroupObservation("stage-group-1", bundle);
		expect(result?.t).toBe("2ais");
	});

	it("should handle T category with 'is' suffix", () => {
		const tCategory: Observation = {
			resourceType: "Observation",
			id: "t-category-1",
			status: "final",
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21905-5",
						display: "Primary tumor.clinical [Class] Cancer",
					},
				],
			},
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-tnm-kategorie-t",
				],
			},
			valueCodeableConcept: {
				coding: [
					{
						system:
							"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-tnm-kategorie",
						code: "Tis",
					},
				],
			},
		};

		const stageGroupObservation: Observation = {
			resourceType: "Observation",
			id: "stage-group-1",
			status: "final",
			effectiveDateTime: "2023-05-15T10:30:00Z",
			hasMember: [{ reference: "Observation/t-category-1" }],
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21908-9",
						display: "Stage group",
					},
				],
			},
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: stageGroupObservation }, { resource: tCategory }],
		};

		const result = parseStageGroupObservation("stage-group-1", bundle);
		expect(result?.t).toBe("is");
	});

	it("should handle N category with letter suffixes", () => {
		const nCategory: Observation = {
			resourceType: "Observation",
			id: "n-category-1",
			status: "final",
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21906-3",
						display: "Regional lymph nodes.clinical [Class] Cancer",
					},
				],
			},
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-tnm-kategorie-n",
				],
			},
			valueCodeableConcept: {
				coding: [
					{
						system:
							"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-tnm-kategorie",
						code: "N2a",
					},
				],
			},
		};

		const stageGroupObservation: Observation = {
			resourceType: "Observation",
			id: "stage-group-1",
			status: "final",
			effectiveDateTime: "2023-05-15T10:30:00Z",
			hasMember: [{ reference: "Observation/n-category-1" }],
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21908-9",
						display: "Stage group",
					},
				],
			},
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: stageGroupObservation }, { resource: nCategory }],
		};

		const result = parseStageGroupObservation("stage-group-1", bundle);
		expect(result?.n).toBe("2a");
	});

	it("should handle M category with numeric values", () => {
		const mCategory: Observation = {
			resourceType: "Observation",
			id: "m-category-1",
			status: "final",
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21907-1",
						display: "Distant metastases.clinical [Class] Cancer",
					},
				],
			},
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-tnm-kategorie-m",
				],
			},
			valueCodeableConcept: {
				coding: [
					{
						system:
							"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-tnm-kategorie",
						code: "M1B",
					},
				],
			},
		};

		const stageGroupObservation: Observation = {
			resourceType: "Observation",
			id: "stage-group-1",
			status: "final",
			effectiveDateTime: "2023-05-15T10:30:00Z",
			hasMember: [{ reference: "Observation/m-category-1" }],
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21908-9",
						display: "Stage group",
					},
				],
			},
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: stageGroupObservation }, { resource: mCategory }],
		};

		const result = parseStageGroupObservation("stage-group-1", bundle);
		expect(result?.m).toBe("1");
	});

	it("should ignore categories without proper profile", () => {
		const invalidCategory: Observation = {
			resourceType: "Observation",
			id: "invalid-category-1",
			status: "final",
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21905-5",
						display: "Primary tumor.clinical [Class] Cancer",
					},
				],
			},
			meta: {
				profile: ["https://example.com/invalid-profile"],
			},
			valueCodeableConcept: {
				coding: [
					{
						system:
							"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-tnm-kategorie",
						code: "T2",
					},
				],
			},
		};

		const stageGroupObservation: Observation = {
			resourceType: "Observation",
			id: "stage-group-1",
			status: "final",
			effectiveDateTime: "2023-05-15T10:30:00Z",
			hasMember: [{ reference: "Observation/invalid-category-1" }],
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21908-9",
						display: "Stage group",
					},
				],
			},
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: stageGroupObservation }, { resource: invalidCategory }],
		};

		const result = parseStageGroupObservation("stage-group-1", bundle);
		expect(result).toEqual({
			date: new Date("2023-05-15T10:30:00Z"),
			t: undefined,
			n: undefined,
			m: undefined,
			prefix: {},
		});
	});

	it("should handle missing member observations", () => {
		const stageGroupObservation: Observation = {
			resourceType: "Observation",
			id: "stage-group-1",
			status: "final",
			effectiveDateTime: "2023-05-15T10:30:00Z",
			hasMember: [
				{ reference: "Observation/missing-t" },
				{ reference: "Observation/missing-n" },
				{ reference: "Observation/missing-m" },
			],
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21908-9",
						display: "Stage group",
					},
				],
			},
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: stageGroupObservation }],
		};

		const result = parseStageGroupObservation("stage-group-1", bundle);
		expect(result).toEqual({
			date: new Date("2023-05-15T10:30:00Z"),
			t: undefined,
			n: undefined,
			m: undefined,
			prefix: {},
		});
	});

	it("should parse real-world example from InKaPP_Darm_C18.json", () => {
		const bundlePath = path.resolve(
			__dirname,
			"../../components/oncology/IDG/test-bundles/InKaPP_Darm_C18.json"
		);
		if (!fs.existsSync(bundlePath)) {
			return;
		}

		const bundle: Bundle = JSON.parse(fs.readFileSync(bundlePath, "utf-8"));

		// Test first TNM staging observation
		const result = parseStageGroupObservation(
			"cd48491246d36924b467461bf334da1aef3bc4eef2619af3e9186dd2ac162239",
			bundle
		);

		expect(result).toBeTruthy();
		expect(result?.date).toBeDefined();
		expect(result?.version).toBe("8");
		expect(result?.t).toBeDefined();
		expect(result?.n).toBeDefined();
		expect(result?.m).toBeDefined();
	});

	it("should handle categories with individual prefixes", () => {
		const tCategory: Observation = {
			resourceType: "Observation",
			id: "t-category-1",
			status: "final",
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21905-5",
						display: "Primary tumor.clinical [Class] Cancer",
					},
				],
			},
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-tnm-kategorie-t",
				],
			},
			extension: [
				{
					extension: [
						{ url: "kategorie", valueCode: "T" },
						{
							url: "praefix",
							valueCoding: {
								system:
									"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-tnm-praefix",
								code: "c",
							},
						},
					],
					url: "https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/tnm-prefix",
				},
			],
			valueCodeableConcept: {
				coding: [
					{
						system:
							"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-tnm-kategorie",
						code: "T2",
					},
				],
			},
		};

		const nCategory: Observation = {
			resourceType: "Observation",
			id: "n-category-1",
			status: "final",
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21906-3",
						display: "Regional lymph nodes.clinical [Class] Cancer",
					},
				],
			},
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-tnm-kategorie-n",
				],
			},
			extension: [
				{
					extension: [
						{ url: "kategorie", valueCode: "N" },
						{
							url: "praefix",
							valueCoding: {
								system:
									"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-tnm-praefix",
								code: "p",
							},
						},
					],
					url: "https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/tnm-prefix",
				},
			],
			valueCodeableConcept: {
				coding: [
					{
						system:
							"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-tnm-kategorie",
						code: "N1",
					},
				],
			},
		};

		const stageGroupObservation: Observation = {
			resourceType: "Observation",
			id: "stage-group-1",
			status: "final",
			effectiveDateTime: "2023-05-15T10:30:00Z",
			hasMember: [
				{ reference: "Observation/t-category-1" },
				{ reference: "Observation/n-category-1" },
			],
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21908-9",
						display: "Stage group",
					},
				],
			},
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [
				{ resource: stageGroupObservation },
				{ resource: tCategory },
				{ resource: nCategory },
			],
		};

		const result = parseStageGroupObservation("stage-group-1", bundle);
		expect(result?.prefix).toEqual({ t: "c", n: "p" });
	});
});
