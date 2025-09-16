import type { Coding, Procedure } from "fhir/r4";
import { obdsTherapieEndeCodes } from "../helper";

const therapietypLabels: Record<string, string> = {
	CH: "Chemotherapie",
	HO: "Hormontherapie",
	IM: "Immun-/Antikörpertherapie",
	ZS: "zielgerichtete Substanzen",
	SZ: "Stammzelltransplantation (inklusive Knochenmarktransplantation)",
	CI: "Chemo- + Immun-/Antikörpertherapie",
	CZ: "Chemotherapie + zielgerichtete Substanzen",
	CIZ: "Chemo- + Immun-/Antikörpertherapie + zielgerichtete Substanzen",
	IZ: "Immun-/Antikörpertherapie + zielgerichtete Substanzen",
	WW: "Watchful Waiting",
	AS: "Active Surveillance",
	WS: "Wait and see",
	OP: "Operation",
	ST: "Strahlentherapie",
	KW: "keine weitere tumorspezifische Therapie empfohlen",
	SO: "Sonstiges",
};

function getTreatmentTypeCoding(procedure: Procedure): Coding | undefined {
	const typeCode = procedure.code?.coding?.find(
		(coding) =>
			coding.system ===
			"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-therapietyp"
	);
	return typeCode;
}

function parseTreatmentType(typeCode: Coding): string {
	if (!typeCode.code) return "Unbekannt";
	return therapietypLabels[typeCode.code] || typeCode.display || "Unbekannt";
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

function formatDate(dateString?: string): string | undefined {
	if (!dateString) return undefined;
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("de-DE", {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(date);
}

function getTreatmentPeriod(
	procedure: Procedure
): { startDate?: string; endDate?: string } | undefined {
	const startDate = formatDate(procedure.performedPeriod?.start);
	const endDate = formatDate(procedure.performedPeriod?.end);
	return { startDate, endDate };
}

export {
	formatDate,
	getTreatmentEndReasonCoding,
	getTreatmentPeriod,
	getTreatmentTypeCoding,
	parseTreatmentEndReason,
	parseTreatmentType,
	therapietypLabels,
};
