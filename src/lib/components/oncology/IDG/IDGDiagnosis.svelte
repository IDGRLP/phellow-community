<script lang="ts">
	import Diagnosis from "./Details/Diagnosis/Diagnosis.svelte";
	import Fernmetastasen from "./Details/Fernmetastasen/Fernmetastasen.svelte";
	import Histology from "./Details/Histology/Histology.svelte";
	import IDGLayout from "./IDGLayout.svelte";

	import type { Bundle, Condition, Observation, Questionnaire } from "fhir/r4";

	interface Props {
		conditionId: string;
		bundle: Bundle;
		showFeedback: boolean;
		cancelFeedback?: () => void;
	}

	let { conditionId, bundle, showFeedback, cancelFeedback }: Props = $props();

	let condition = $derived(
		bundle.entry?.find((entry) => entry.resource?.id === conditionId)?.resource as
			| Condition
			| undefined
	);

	let histologyObservations = $derived(
		bundle.entry
			?.filter(
				(entry) =>
					entry.resource?.resourceType === "Observation" &&
					entry.resource?.meta?.profile?.some(
						(value) =>
							value ===
							"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-histologie"
					)
			)
			.map((e) => e.resource as Observation)
			.filter((observation) => observation.focus?.some((f) => f.reference?.includes(conditionId)))
	);

	let fernmetastasenObservations = $derived(
		bundle.entry
			?.filter(
				(entry) =>
					entry.resource?.resourceType === "Observation" &&
					entry.resource?.meta?.profile?.some(
						(value) =>
							value ===
							"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-fernmetastasen"
					)
			)
			.map((e) => e.resource as Observation)
			.filter((observation) => observation.focus?.some((f) => f.reference?.includes(conditionId)))
	);

	const diagnosisFeedbackExcel: Questionnaire = {
		resourceType: "Questionnaire",
		status: "active",
		title: "Feedback zur Diagnose",
		id: "1_Fd",
		item: [
			{
				linkId: "0_Fd_Diag_ins",
				text: "Stimmen die Diagnosedaten?",
				required: true,
				type: "choice",
				answerOption: [
					{ valueCoding: { code: "yes", display: "Ja" } },
					{ valueCoding: { code: "no", display: "Nein" } },
					{ valueCoding: { code: "unknown", display: "Ich weiß nicht" } },
					{ valueCoding: { code: "na", display: "Keine Angabe" } },
				],
			},
			{
				linkId: "0_1_Fd_Diag_ins_nein",
				text: "Fehlt eine Krebsdiagnose? Fehlt eine Angabe der hier angezeigten Diagnose und/oder sind vorhandende Daten fehlerhaft?",
				type: "choice",
				required: true,
				repeats: true,
				enableWhen: [
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "no" },
					},
				],
				answerOption: [
					{ valueCoding: { code: "missingDiagnosis", display: "Fehlende Diagnose" } },
					{ valueCoding: { code: "missingInformation", display: "Fehlende Angabe" } },
					{ valueCoding: { code: "incorrectInformation", display: "Fehlerhafte Angabe" } },
					{ valueCoding: { code: "unknown", display: "Weiß nicht" } },
					{ valueCoding: { code: "na", display: "Keine Angabe" } },
				],
			},
			{
				linkId: "1_1_1_Fd",
				type: "group",
				text: "Entität",
				enableWhen: [
					{
						question: "0_1_Fd_Diag_ins_nein",
						operator: "=",
						answerCoding: { code: "missingDiagnosis" },
					},
				],
				item: [
					{
						linkId: "1_1_1_Fd_Diag_Entitaet_f",
						text: "Wenn fehlend, dann Angabe der fehlenden Entität",
						type: "choice",
						answerOption: [
							{ valueCoding: { code: "catalog", display: "Katalog" } },
							{ valueCoding: { code: "other", display: "Sonstiges" } },
						],
					},
					{
						linkId: "1_1_1_1_Fd_Diag_Entitaet_f_u",
						text: "Fehlend, aber nicht bekannt",
						type: "boolean",
						required: false,
					},
					{
						linkId: "1_1_1_2_Fd_Diag_Entitaet_f_kA",
						text: "keine Angabe",
						type: "boolean",
						required: false,
					},
					{
						linkId: "1_1_1_3_Fd_Diag_Entitaet_f_sonst",
						text: "Kommentar",
						type: "string",
						required: false,
					},
				],
			},
			{
				linkId: "1_1_2_Fd",
				type: "group",
				text: "ICD-10",
				enableWhen: [
					{
						question: "0_1_Fd_Diag_ins_nein",
						operator: "=",
						answerCoding: { code: "missingDiagnosis" },
					},
				],
				item: [
					{
						linkId: "1_1_2_Fd_Diag_ICD_f",
						text: "Wenn fehlend, dann Angabe der fehlenden ICD-10",
						type: "choice",
						answerOption: [
							{ valueCoding: { code: "catalog", display: "Katalog" } },
							{ valueCoding: { code: "other", display: "Sonstiges" } },
						],
					},
					{
						linkId: "1_1_2_1_Fd_Diag_ICD_f_u",
						text: "Fehlend, aber nicht bekannt",
						type: "boolean",
						required: false,
					},
					{
						linkId: "1_1_2_2_Fd_Diag_ICD_f_kA",
						text: "keine Angabe",
						type: "boolean",
						required: false,
					},
					{
						linkId: "1_1_2_3_Fd_Diag_ICD_f_sonst",
						text: "Kommentar",
						type: "string",
						required: false,
					},
				],
			},
			{
				linkId: "1_1_3_Fd",
				type: "group",
				text: "Diagnosedatum",
				enableWhen: [
					{
						question: "0_1_Fd_Diag_ins_nein",
						operator: "=",
						answerCoding: { code: "missingDiagnosis" },
					},
				],
				item: [
					{
						linkId: "1_1_3_Fd_Diag_Datum_f",
						text: "Wenn fehlend, dann Angabe des fehlenden Diagnosedatums",
						type: "date",
						extension: [
							{
								url: "http://phellowseven.com/fhir/StructureDefinition/date-precision-mode",
								valueCode: "auto",
							},
						],
					},
					{
						linkId: "1_1_3_1_Fd_Diag_Datum_f_u",
						text: "Fehlend, aber nicht bekannt",
						type: "boolean",
						required: false,
					},
					{
						linkId: "1_1_3_2_Fd_Diag_Datum_f_kA",
						text: "keine Angabe",
						type: "boolean",
						required: false,
					},
					{
						linkId: "1_1_3_3_Fd_Diag_Datum_f_sonst",
						text: "Kommentar",
						type: "string",
						required: false,
					},
				],
			},
			{
				linkId: "1_1_4_Fd_Diag_Freitext_f",
				text: "Angabe sonstiger Informationen, Einrichtung der Behandlung und zum Arzt",
				type: "text",
				required: false,
				enableWhen: [
					{
						question: "0_1_Fd_Diag_ins_nein",
						operator: "=",
						answerCoding: { code: "missingDiagnosis" },
					},
				],
			},
			{
				linkId: "1_2_Fd",
				text: "Entität",
				type: "group",
				enableWhen: [
					{
						question: "0_1_Fd_Diag_ins_nein",
						operator: "=",
						answerCoding: { code: "incorrectInformation" },
					},
				],
				item: [
					{
						linkId: "1_2_Fd_Diag_Entitaet_k",
						text: "Ist die Entität der Krebserkrankung korrekt?",
						type: "choice",
						required: true,
						answerOption: [
							{ valueCoding: { code: "yes", display: "Ja" } },
							{ valueCoding: { code: "no", display: "Nein" } },
							{ valueCoding: { code: "unknown", display: "Ich weiß nicht" } },
							{ valueCoding: { code: "na", display: "Keine Angabe" } },
						],
					},
					{
						linkId: "1_2_1_Fd_Diag_Entitaet_Angabe_k",
						text: "Wenn nein, dann Katalog",
						type: "choice",
						answerOption: [
							{ valueCoding: { code: "catalog", display: "Katalog" } },
							{ valueCoding: { code: "other", display: "Sonstiges" } },
						],
						enableWhen: [
							{
								question: "1_2_Fd_Diag_Entitaet_k",
								operator: "=",
								answerCoding: { code: "no" },
							},
						],
					},
					{
						linkId: "1_2_2_Fd_Diag_Entitaet_Angabe_k_u",
						text: "Fehlerhaft, aber unbekannt",
						type: "boolean",
						required: false,
					},
					{
						linkId: "1_2_3_Fd_Diag_Entitaet_Angabe_k_kA",
						text: "keine Angabe",
						type: "boolean",
						required: false,
					},
					{
						linkId: "1_2_4_Fd_Diag_Entitaet_Angabe_k_sonst",
						text: "Kommentar",
						type: "string",
						required: false,
					},
				],
			},
			{
				linkId: "1_3_Fd",
				text: "ICD-10",
				type: "group",
				enableWhen: [
					{
						question: "0_1_Fd_Diag_ins_nein",
						operator: "=",
						answerCoding: { code: "incorrectInformation" },
					},
				],
				item: [
					{
						linkId: "1_3_Fd_Diag_ICD_k",
						text: "Ist die ICD-10 korrekt?",
						type: "choice",
						required: true,
						answerOption: [
							{ valueCoding: { code: "yes", display: "Ja" } },
							{ valueCoding: { code: "no", display: "Nein" } },
							{ valueCoding: { code: "unknown", display: "Ich weiß nicht" } },
							{ valueCoding: { code: "na", display: "Keine Angabe" } },
						],
					},
					{
						linkId: "1_3_1_Fd_Diag_ICD_Angabe_k",
						text: "Wenn nein, dann Katalog",
						type: "choice",
						answerOption: [
							{ valueCoding: { code: "catalog", display: "Katalog" } },
							{ valueCoding: { code: "other", display: "Sonstiges" } },
						],
						enableWhen: [
							{
								question: "1_3_Fd_Diag_ICD_k",
								operator: "=",
								answerCoding: { code: "no" },
							},
						],
					},
					{
						linkId: "1_3_2_Fd_Diag_ICD_Angabe_u",
						text: "Fehlerhaft, aber unbekannt",
						type: "boolean",
						required: false,
					},
					{
						linkId: "1_3_3_Fd_Diag_ICD_Angabe_kA",
						text: "keine Angabe",
						type: "boolean",
						required: false,
					},
					{
						linkId: "1_3_4_Fd_Diag_ICD_Angabe_k_sonst",
						text: "Kommentar",
						type: "string",
						required: false,
					},
				],
			},
			{
				linkId: "1_4_Fd",
				text: "Diagnosedatum",
				type: "group",
				enableWhen: [
					{
						question: "0_1_Fd_Diag_ins_nein",
						operator: "=",
						answerCoding: { code: "incorrectInformation" },
					},
				],
				item: [
					{
						linkId: "1_4_Fd_Diag_Datum_k",
						text: "Ist das Diagnosedatum korrekt?",
						type: "choice",
						required: true,
						answerOption: [
							{ valueCoding: { code: "yes", display: "Ja" } },
							{ valueCoding: { code: "no", display: "Nein" } },
							{ valueCoding: { code: "unknown", display: "Ich weiß nicht" } },
							{ valueCoding: { code: "na", display: "Keine Angabe" } },
						],
					},
					{
						linkId: "1_4_1_Fd_Diag_Datum_Angabe_k",
						text: "Wenn nein, dann Datum",
						type: "date",
						extension: [
							{
								url: "http://phellowseven.com/fhir/StructureDefinition/date-precision-mode",
								valueCode: "auto",
							},
						],
						enableWhen: [
							{
								question: "1_4_Fd_Diag_Datum_k",
								operator: "=",
								answerCoding: { code: "no" },
							},
						],
					},
					{
						linkId: "1_4_2_Fd_Diag_Datum_Angabe_u",
						text: "Fehlerhaft, aber unbekannt",
						type: "boolean",
						required: false,
					},
					{
						linkId: "1_4_3_Fd_Diag_Datum_Angabe_kA",
						text: "keine Angabe",
						type: "boolean",
						required: false,
					},
					{
						linkId: "1_4_4_Fd_Diag_Datum_Angabe_k_sonst",
						text: "Kommentar",
						type: "string",
						required: false,
					},
				],
			},
			{
				linkId: "1_5_Fd_Diag_Freitext_k",
				text: "Angabe sonstiger Informationen",
				type: "text",
				required: false,
			},
		],
	};

	const diagnosisFeedback: Questionnaire = {
		resourceType: "Questionnaire",
		status: "active",
		title: "Feedback zur Diagnose",
		id: "1_Fd",
		item: [
			{
				linkId: "0_Fd_Diag_ins",
				text: "Stimmen die Diagnosedaten?",
				required: true,
				type: "choice",
				answerOption: [
					{ valueCoding: { code: "yes", display: "Ja" } },
					{ valueCoding: { code: "no", display: "Nein" } },
					{ valueCoding: { code: "unknown", display: "Ich weiß nicht" } },
					{ valueCoding: { code: "na", display: "Keine Angabe" } },
				],
			},
			{
				linkId: "0_1_Fd_Diag_ICD",
				type: "group",
				enableWhen: [
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "no" },
					},
				],
				item: [
					{
						linkId: "0_1_Fd_Diag_ICD_choice",
						text: "Stimmt der ICD-10?",
						required: true,
						type: "choice",
						answerOption: [
							{ valueCoding: { code: "yes", display: "Ja" } },
							{ valueCoding: { code: "no", display: "Nein" } },
							{ valueCoding: { code: "unknown", display: "Ich weiß nicht" } },
							{ valueCoding: { code: "na", display: "Keine Angabe" } },
						],
					},
					{
						linkId: "0_1_Fd_Diag_ICD_text",
						text: "Welche Information beim ICD-10 stimmt nicht bzw. fehlt? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableWhen: [
							{
								question: "0_1_Fd_Diag_ICD_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
						],
					},
				],
			},
			{
				linkId: "0_1_Fd_Diag_Seitenlokalisation",
				text: "",
				type: "group",
				enableWhen: [
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "no" },
					},
				],
				item: [
					{
						linkId: "0_1_Fd_Diag_Seitenlokalisation_choice",
						text: "Stimmt die Seitenlokalisation?",
						type: "choice",
						required: true,
						answerOption: [
							{ valueCoding: { code: "yes", display: "Ja" } },
							{ valueCoding: { code: "no", display: "Nein" } },
							{ valueCoding: { code: "unknown", display: "Ich weiß nicht" } },
							{ valueCoding: { code: "na", display: "Keine Angabe" } },
						],
					},
					{
						linkId: "0_1_Fd_Diag_Seitenlokalisation_text",
						text: "Welche Information der Seitenlokalisation stimmt nicht bzw. fehlt? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableWhen: [
							{
								question: "0_1_Fd_Diag_Seitenlokalisation_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
						],
					},
				],
			},
			{
				linkId: "0_1_Fd_Diag_Histologie",
				text: "",
				type: "group",
				enableWhen: [
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "no" },
					},
				],
				item: [
					{
						linkId: "0_1_Fd_Diag_Histologie_choice",
						text: "Stimmen die Histologie-Daten?",
						type: "choice",
						required: true,
						answerOption: [
							{ valueCoding: { code: "yes", display: "Ja" } },
							{ valueCoding: { code: "no", display: "Nein" } },
							{ valueCoding: { code: "unknown", display: "Ich weiß nicht" } },
							{ valueCoding: { code: "na", display: "Keine Angabe" } },
						],
					},
					{
						linkId: "0_1_Fd_Diag_Histologie_text",
						text: "Welche Information der Histologie-Daten stimmen nicht bzw. fehlen? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableWhen: [
							{
								question: "0_1_Fd_Diag_Histologie_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
						],
					},
				],
			},
			{
				linkId: "0_1_Fd_Diag_Fernmetastasen",
				text: "",
				type: "group",
				enableWhen: [
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "no" },
					},
				],
				item: [
					{
						linkId: "0_1_Fd_Diag_Fernmetastasen_choice",
						text: "Stimmen die Fernmetastasen-Daten?",
						type: "choice",
						required: true,
						answerOption: [
							{ valueCoding: { code: "yes", display: "Ja" } },
							{ valueCoding: { code: "no", display: "Nein" } },
							{ valueCoding: { code: "unknown", display: "Ich weiß nicht" } },
							{ valueCoding: { code: "na", display: "Keine Angabe" } },
						],
					},
					{
						linkId: "0_1_Fd_Diag_Fernmetastasen_text",
						text: "Welche Information der Fernmetastasen-Daten stimmen nicht bzw. fehlen? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableWhen: [
							{
								question: "0_1_Fd_Diag_Fernmetastasen_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
						],
					},
				],
			},
			{
				linkId: "1_5_Fd_Diag_Freitext_k",
				text: "Angabe sonstiger Informationen",
				type: "text",
				required: false,
			},
		],
	};
</script>

<IDGLayout {showFeedback} {cancelFeedback} questionnaire={diagnosisFeedback}>
	{#snippet children()}
		{#if condition}
			<Diagnosis {showFeedback} {condition} />
			<!-- <TnmDisplay {staging} /> -->
			{#if histologyObservations && histologyObservations.length > 0}
				<Histology {showFeedback} observations={histologyObservations} />
			{/if}
			{#if fernmetastasenObservations && fernmetastasenObservations.length > 0}
				<Fernmetastasen {showFeedback} fernmetastasen={fernmetastasenObservations} />
			{/if}
		{:else}
			<p class="text-muted-foreground">Keine Diagnoseinformationen verfügbar.</p>
		{/if}
	{/snippet}
</IDGLayout>
