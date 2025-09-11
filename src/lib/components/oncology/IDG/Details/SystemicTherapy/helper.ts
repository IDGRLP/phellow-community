import type { Procedure } from "fhir/r4";
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

function getTreatmentType(procedure: Procedure): string | undefined {
	const typeCode = procedure.code?.coding?.find(
		(coding) =>
			coding.system ===
			"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-therapietyp"
	)?.code;

	if (!typeCode) return undefined;

	return therapietypLabels[typeCode];
}

function getTreatmendEndReason(procedure: Procedure): string | undefined {
	const reasonCode = procedure.outcome?.coding?.find(
		(coding) =>
			coding.system ===
			"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-therapie-ende-grund"
	);

	if (!reasonCode?.code) return undefined;

	return obdsTherapieEndeCodes[reasonCode.code] || undefined;
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

// Helper function to get treatment period
function getTreatmentPeriod(
	procedure: Procedure
): { startDate?: string; endDate?: string } | undefined {
	const startDate = formatDate(procedure.performedPeriod?.start);
	const endDate = formatDate(procedure.performedPeriod?.end);
	return { startDate, endDate };
}

export {
	formatDate,
	getTreatmendEndReason,
	getTreatmentPeriod,
	getTreatmentType,
	therapietypLabels,
};
