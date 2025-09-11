<script lang="ts">
	import type { Bundle, Observation, Questionnaire } from "fhir/r4";
	import Progression from "./Details/Progression/Progression.svelte";
	import IDGLayout from "./IDGLayout.svelte";

	interface Props {
		observationId: string;
		bundle: Bundle;
		showFeedback: boolean;
		cancelFeedback?: () => void;
	}

	let { observationId, bundle, showFeedback, cancelFeedback }: Props = $props();

	let observation = $derived(
		bundle.entry?.find((entry) => entry.resource?.id === observationId)?.resource as
			| Observation
			| undefined
	);

	const progressionFeedback: Questionnaire = {
		resourceType: "Questionnaire",
		status: "active",
		title: "Feedback zum Verlauf",
		id: "6_Fd",
		item: [
			{
				linkId: "6_Fd_Ver_ins",
				text: "Sind die Angaben zum Verlauf korrekt?",
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
				linkId: "6_1_Fd_Ver_ins_nein",
				text: "Wenn nein, fehlt eine Verlaufsmeldung, fehlt eine Angabe der hier angezeigten Daten zum Verlauf und/oder sind vorhandende Daten fehlerhaft?",
				type: "choice",
				required: true,
				repeats: true,
				enableWhen: [
					{
						question: "6_Fd_Ver_ins",
						operator: "=",
						answerCoding: { code: "no" },
					},
				],
				answerOption: [
					{ valueCoding: { code: "missingProgression", display: "Fehlende/r Verlauf/Verläufe" } },
					{ valueCoding: { code: "missingInformation", display: "Fehlende Angabe/n" } },
					{ valueCoding: { code: "incorrectInformation", display: "Fehlerhafte Angabe/n" } },
					{ valueCoding: { code: "unknown", display: "Weiß nicht" } },
					{ valueCoding: { code: "na", display: "Keine Angabe" } },
				],
			},
			{
				linkId: "6_1_1_Fd",
				type: "group",
				text: "Datum Verlauf",
				enableWhen: [
					{
						question: "6_1_Fd_Ver_ins_nein",
						operator: "=",
						answerCoding: { code: "missingProgression" },
					},
				],
				item: [
					{
						linkId: "6_1_1_Fd_Ver_Datum_f",
						text: "Wenn fehlend, dann Angabe Datum Verlauf",
						type: "date",
						extension: [
							{
								url: "http://phellowseven.com/fhir/StructureDefinition/date-precision-mode",
								valueCode: "auto",
							},
						],
					},
					{
						linkId: "6_1_1_1_Fd_Ver_Datum_f_u",
						text: "Fehlend, aber nicht bekannt",
						type: "boolean",
						required: false,
					},
					{
						linkId: "6_1_1_2_Fd_Ver_Datum_f_kA",
						text: "keine Angabe",
						type: "boolean",
						required: false,
					},
					{
						linkId: "6_1_1_3_Fd_Ver_Datum_f_sonst",
						text: "Kommentar",
						type: "string",
						required: false,
					},
				],
			},
			{
				linkId: "6_1_2_Fd",
				type: "group",
				text: "Datum Verlauf",
				enableWhen: [
					{
						question: "6_1_Fd_Ver_ins_nein",
						operator: "=",
						answerCoding: { code: "missingProgression" },
					},
				],
				item: [
					{
						linkId: "6_1_2_Fd_Ver_Tumorstatus_k",
						text: "Wenn fehlend, dann Angabe zum Tumorstatus",
						type: "choice",
						answerOption: [
							{ valueCoding: { code: "CR", display: "Vollremission (complete remission, CR)" } },
							{ valueCoding: { code: "PR", display: "Teilremission (partial remission, PR)" } },
							{
								valueCoding: {
									code: "NC",
									display: "keine aenderung (no change, NC) = stable disease",
								},
							},
							{ valueCoding: { code: "PD", display: "Progression" } },
							{ valueCoding: { code: "SD", display: "divergentes Geschehen" } },
							{
								valueCoding: {
									code: "MR",
									display:
										"klinische Besserung des Zustandes, Teilremissionkriterien jedoch nicht erfuellt (minimal response, MR)",
								},
							},
							{
								valueCoding: {
									code: "CRr",
									display: "Vollremission mit residualen Auffaelligkeiten (CRr)",
								},
							},
							{ valueCoding: { code: "Rec", display: "Rezidiv" } },
							{ valueCoding: { code: "Unk", display: "Beurteilung unmoeglich" } },
						],
					},
					{
						linkId: "6_1_2_1_Fd_Ver_Tumorstatus_f_u",
						text: "Fehlend, aber nicht bekannt",
						type: "boolean",
						required: false,
					},
					{
						linkId: "6_1_2_2_Fd_Ver_Tumorstatus_f_kA",
						text: "keine Angabe",
						type: "boolean",
						required: false,
					},
					{
						linkId: "6_1_2_3_Fd_Ver_Tumorstatus_f_sonst",
						text: "Kommentar",
						type: "string",
						required: false,
					},
				],
			},
			{
				linkId: "6_1_3_Fd_Sys_Freitext_f",
				text: "Angabe sonstiger Informationen, Einrichtung der Behandlung und zum Arzt",
				type: "text",
				required: false,
				enableWhen: [
					{
						question: "6_1_Fd_Ver_ins_nein",
						operator: "=",
						answerCoding: { code: "missingProgression" },
					},
				],
			},
			{
				linkId: "6_2_Fd",
				text: "Verlaufsdatum",
				type: "group",
				enableWhen: [
					{
						question: "6_1_Fd_Ver_ins_nein",
						operator: "=",
						answerCoding: { code: "incorrectInformation" },
					},
				],
				item: [
					{
						linkId: "6_2_Fd_Ver_Datum_k",
						text: "Ist das Verlaufsdatum richtig datiert?",
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
						linkId: "6_2_1_Fd_Ver_Datum_Angabe_k",
						text: "Wenn nein, dann Angabe des Datums",
						type: "date",
						extension: [
							{
								url: "http://phellowseven.com/fhir/StructureDefinition/date-precision-mode",
								valueCode: "auto",
							},
						],
						enableWhen: [
							{
								question: "6_2_Fd_Ver_Datum_k",
								operator: "=",
								answerCoding: { code: "no" },
							},
						],
					},
					{
						linkId: "6_2_2_Fd_Ver_Datum_Angabe_k_u",
						text: "Wenn nein, aber unbekannt",
						type: "boolean",
						required: false,
					},
					{
						linkId: "6_2_3_Fd_Ver_Datum_Angabe_k_kA",
						text: "keine Angabe",
						type: "boolean",
						required: false,
					},
					{
						linkId: "6_2_4_Fd_Ver_Datum_Angabe_k_sonst",
						text: "Kommentar",
						type: "string",
						required: false,
					},
				],
			},
			{
				linkId: "6_3_Fd",
				text: "Gesamtbeurteilung Tumorstatus",
				type: "group",
				enableWhen: [
					{
						question: "6_1_Fd_Ver_ins_nein",
						operator: "=",
						answerCoding: { code: "incorrectInformation" },
					},
				],
				item: [
					{
						linkId: "6_3_Fd_Ver_Tumorstatus_k",
						text: "Ist die Angabe zur Gesamtbeurteilung des Tumorstatus korrekt?",
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
						linkId: "6_3_1_Fd_Ver_Tumorstatus_Angabe_k",
						text: "Wenn nein, dann Angabe zur Gesamtbeurteilung",
						type: "choice",
						answerOption: [
							{ valueCoding: { code: "CR", display: "Vollremission (complete remission, CR)" } },
							{ valueCoding: { code: "PR", display: "Teilremission (partial remission, PR)" } },
							{
								valueCoding: {
									code: "NC",
									display: "keine aenderung (no change, NC) = stable disease",
								},
							},
							{ valueCoding: { code: "PD", display: "Progression" } },
							{ valueCoding: { code: "SD", display: "divergentes Geschehen" } },
							{
								valueCoding: {
									code: "MR",
									display:
										"klinische Besserung des Zustandes, Teilremissionkriterien jedoch nicht erfuellt (minimal response, MR)",
								},
							},
							{
								valueCoding: {
									code: "CRr",
									display: "Vollremission mit residualen Auffaelligkeiten (CRr)",
								},
							},
							{ valueCoding: { code: "Rec", display: "Rezidiv" } },
							{ valueCoding: { code: "Unk", display: "Beurteilung unmoeglich" } },
						],
						enableWhen: [
							{
								question: "6_3_Fd_Ver_Tumorstatus_k",
								operator: "=",
								answerCoding: { code: "no" },
							},
						],
					},
					{
						linkId: "6_3_2_Fd_Ver_Tumorstatus_Angabe_k_u",
						text: "Wenn nein, aber unbekannt",
						type: "boolean",
						required: false,
					},
					{
						linkId: "6_3_3_Fd_Ver_Tumorstatus_Angabe_k_kA",
						text: "keine Angabe",
						type: "boolean",
						required: false,
					},
					{
						linkId: "6_3_4_Fd_Ver_Tumorstatus_Angabe_k_sonst",
						text: "Kommentar",
						type: "string",
						required: false,
					},
				],
			},
			{
				linkId: "6_4_Fd_Ver_Freitext_k",
				text: "Angabe sonstiger Informationen",
				type: "text",
				required: false,
			},
		],
	};
</script>

<IDGLayout {showFeedback} {cancelFeedback} questionnaire={progressionFeedback}>
	{#snippet children()}
		{#if observation}
			<Progression {showFeedback} progression={observation} />
		{:else}
			<p class="text-muted-foreground">Keine Verlaufsinformationen verfügbar.</p>
		{/if}
	{/snippet}
</IDGLayout>
