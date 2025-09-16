import type { Coding, Procedure } from "fhir/r4";
import { obdsTherapieEndeCodes } from "../helper";

const bestrahlungZielgebiet: Record<string, string> = {
	"1.1": "Ganzhirn (Neurokranium, inklusive Meningen)",
	"1.2": "Teilhirn (frontal/parietal/occipital/temporal/Kleinhirn)",
	"1.3": "Neuroachse/Rückenmark",
	"1.4": "Hypophyse",
	"1.5": "Hirn sonstiges",
	"2.1": "Auge",
	"2.2": "Nase/Nasennebenhöhle",
	"2.3": "Mundhöhle inklusive Mundhöhlenvorhof",
	"2.4": "Ohr",
	"2.5": "Speicheldrüse",
	"2.6": "Pharynx",
	"2.7": "Nasopharynx",
	"2.8": "Oropharynx",
	"2.9": "Hypopharynx",
	"2.10": "Larynx",
	"2.11": "Schilddrüse",
	"2.12": "Kopf‑Hals sonstige",
	"3.1": "Mamma als Ganzbrust",
	"3.2": "Mamma als Teilbrust",
	"3.3": "Thoraxwand",
	"3.4": "Lunge",
	"3.5": "Ösophagus",
	"3.6": "Mediastinum",
	"3.7": "Thymus",
	"3.8": "Thorax sonstige",
	"4.1": "Magen",
	"4.2": "Pankreas",
	"4.3": "Leber",
	"4.4": "Milz",
	"4.5": "Niere",
	"4.6": "Nebennieren",
	"4.7": "Retroperitoneum",
	"4.8": "Ureter",
	"4.9": "Bauchwand",
	"4.10": "Oberbauch",
	"4.11": "Gallengänge",
	"4.12": "Gallenblase",
	"4.13": "Abdomen sonstige",
	"5.1": "Rektum",
	"5.2": "Analbereich",
	"5.3": "Harnblase",
	"5.4": "Prostata",
	"5.5": "Hoden",
	"5.6": "Penis",
	"5.7": "Uterus",
	"5.8": "Zervix",
	"5.9": "Vulva",
	"5.10": "Vagina",
	"5.11": "Beckenwand",
	"5.12": "Becken sonstige",
	"6.1": "Schädel",
	"6.2": "Schädelbasis",
	"6.3": "Orbita",
	"6.4": "Halswirbelsäule",
	"6.5": "Brustwirbelsäule",
	"6.6": "Lendenwirbelsäule",
	"6.7": "Sacrum/Coccygeum",
	"6.8": "Rippen",
	"6.9": "Sternum",
	"6.10": "Schulter",
	"6.11": "Oberarm",
	"6.12": "Unterarm",
	"6.13": "Hand",
	"6.14": "Becken",
	"6.15": "Hüfte",
	"6.16": "Oberschenkel",
	"6.17": "Unterschenkel",
	"6.18": "Fuß",
	"6.19": "Knochen sonstige",
	"7.1": "Kopf, Gesicht, Hals",
	"7.2": "obere Extremität inklusive Schulter",
	"7.3": "untere Extremität und Hüfte",
	"7.4": "Thorax",
	"7.5": "Abdomen",
	"7.6": "Becken",
	"7.7": "Stammes o. n. A.",
	"7.8": "mehrere Bereiche überlappend",
	"7.9": "sonstige Weichteile o. n. A.",
	"8.1": "Ganzhaut",
	"8.2": "Teilbereiche",
	"9.1": "Cervikale Lymphknoten",
	"9.2": "Supra-/infraclavikuläre Lymphknoten",
	"9.3": "Axilläre Lymphknoten",
};

const lateralityMap: Record<string, string> = {
	L: "Links",
	R: "Rechts",
	B: "Beidseitig",
	M: "Mittig",
	U: "Unbekannt",
};

type TargetArea = {
	target?: string;
	laterality?: string;
};

// Helper function to get radiation details
function getTargetAreas(radiationTherapy: Procedure): TargetArea[] | undefined {
	const radiationExt = radiationTherapy.extension?.find(
		(ext) =>
			ext.url ===
			"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-ex-onko-strahlentherapie-bestrahlung"
	);

	if (!radiationExt?.extension) return undefined;

	// Get target area
	const targetAreas = radiationExt.extension.filter((ext) => ext.url === "Zielgebiet");
	let extractedAreas: TargetArea[] = [];

	for (const targetArea of targetAreas) {
		let targetCode = targetArea.valueCodeableConcept?.coding?.[0]?.code;
		if (targetCode && targetCode.endsWith(".")) {
			targetCode = targetCode.slice(0, -1);
		}
		const target = targetCode ? bestrahlungZielgebiet[targetCode] : undefined;

		// Get laterality
		const lateralityExt = radiationExt.extension.find(
			(ext) => ext.url === "Zielgebiet_Lateralitaet"
		);
		const lateralityCode = lateralityExt?.valueCodeableConcept?.coding?.[0]?.code;

		const laterality = lateralityCode ? lateralityMap[lateralityCode] : undefined;

		extractedAreas.push({ target, laterality });
	}

	return extractedAreas;
}

// Helper function to format date
function formatDate(dateString?: string) {
	if (!dateString) return undefined;
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("de-DE", {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(date);
}

function getTreatmentPeriod(radiationTherapy: Procedure) {
	const startDate = formatDate(radiationTherapy.performedPeriod?.start);
	const endDate = formatDate(radiationTherapy.performedPeriod?.end);
	return { startDate, endDate };
}

function getTreatmentEndReasonCoding(procedure: Procedure): Coding | undefined {
	const reasonCoding = procedure.outcome?.coding?.find(
		(coding) =>
			coding.system ===
			"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-therapie-ende-grund"
	);

	return reasonCoding;
}

function parseTreatmentEndReason(reasonCoding: Coding): string {
	if (!reasonCoding.code) return "Unbekannt";
	return obdsTherapieEndeCodes[reasonCoding.code] || reasonCoding.display || "Unbekannt";
}

export {
	bestrahlungZielgebiet,
	formatDate,
	getTargetAreas,
	getTreatmentEndReasonCoding,
	getTreatmentPeriod,
	parseTreatmentEndReason,
};
