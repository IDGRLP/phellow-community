<script lang="ts">
	import type { Bundle, Procedure, Questionnaire } from "fhir/r4";
	import Radiation from "./Details/Radiation/Radiation.svelte";
	import IDGLayout from "./IDGLayout.svelte";

	interface Props {
		procedureId: string;
		bundle: Bundle;
		showFeedback: boolean;
		cancelFeedback?: () => void;
	}

	let { procedureId, bundle, showFeedback, cancelFeedback }: Props = $props();

	let currentItemLinkId = $state<string | undefined>(undefined);

	let procedure = $derived(
		bundle.entry?.find((entry) => entry.resource?.id === procedureId)?.resource as
			| Procedure
			| undefined
	);

	let bestrahlungen = $derived(
		bundle.entry
			?.filter(
				(entry) =>
					entry.resource?.meta?.profile?.includes(
						"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-strahlentherapie-bestrahlung-strahlentherapie"
					) && entry.resource?.resourceType === "Procedure"
			)
			.map((entry) => entry.resource as Procedure)
			.filter(
				(bestrahlung) =>
					bestrahlung.partOf?.some((part) => part.reference === `Procedure/${procedureId}`) ?? false
			)
	);

	function handleCurrentItemChange(itemLinkId?: string): void {
		currentItemLinkId = itemLinkId;
	}

	const radiationFeedback: Questionnaire = {
		resourceType: "Questionnaire",
		status: "active",
		title: "Feedback zur Strahlentherapie",
		id: "4_Fd",
		item: [
			{
				linkId: "4_Fd_Str_ins",
				text: "Sind die Angaben zur Strahlentherapie korrekt?",
				required: true,
				type: "choice",
				answerOption: [
					{
						valueCoding: {
							code: "correctAndComplete",
							display:
								"Ja, die angezeigten Informationen sind korrekt und vollständig (richtig und vollständig)",
						},
					},
					{
						valueCoding: {
							code: "correctButIncomplete",
							display:
								"Ja, die angezeigten Informationen sind korrekt, aber es fehlt etwas (richtig, aber unvollständig)",
						},
					},
					{
						valueCoding: {
							code: "incorrectButComplete",
							display:
								"Nein, die angezeigten Informationen sind teilweise fehlerhaft, aber an sich vollständig (falsch, aber vollständig)",
						},
					},
					{
						valueCoding: {
							code: "incorrectAndIncomplete",
							display:
								"Nein, die angezeigten Informationen sind teilweise fehlerhaft und unvollständig (falsch und unvollständig)",
						},
					},
					{
						valueCoding: {
							code: "correctButUnclearIfComplete",
							display:
								"Die angezeigten Informationen sind korrekt, aber ich weiß nicht, ob noch etwas fehlt (richtig, aber unklar, ob vollständig)",
						},
					},
					{
						valueCoding: {
							code: "unknown",
							display:
								"Ich weiß nicht, ob die anzeigten Informationen korrekt sind und ob noch Informationen fehlen (Richtigkeit und Vollständigkeit unklar)",
						},
					},
					{ valueCoding: { code: "na", display: "Hierzu möchte ich keine Angabe machen" } },
				],
			},
			{
				linkId: "4_1_Fd_Str_datum",
				type: "group",
				enableBehavior: "any",
				enableWhen: [
					{
						question: "4_Fd_Str_ins",
						operator: "=",
						answerCoding: { code: "correctButIncomplete" },
					},
					{
						question: "4_Fd_Str_ins",
						operator: "=",
						answerCoding: { code: "incorrectButComplete" },
					},
					{
						question: "4_Fd_Str_ins",
						operator: "=",
						answerCoding: { code: "incorrectAndIncomplete" },
					},
				],
				item: [
					{
						linkId: "4_1_Fd_Str_datum_choice",
						text: "Stimmt das Datum der Strahlentherapie?",
						required: true,
						type: "choice",
						answerOption: [
							{ valueCoding: { code: "yes", display: "Ja" } },
							{ valueCoding: { code: "no", display: "Nein, die Information stimmt nicht" } },
							{ valueCoding: { code: "noMissing", display: "Nein, es fehlt etwas" } },
							{ valueCoding: { code: "unknown", display: "Ich weiß nicht" } },
							{ valueCoding: { code: "na", display: "Hierzu möchte ich keine Angabe machen" } },
						],
					},
					{
						linkId: "4_1_Fd_Str_datum_text",
						text: "Welche Information beim Datum der Strahlentherapie stimmt nicht bzw. fehlt? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableBehavior: "any",
						enableWhen: [
							{
								question: "4_1_Fd_Str_datum_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
							{
								question: "4_1_Fd_Str_datum_choice",
								operator: "=",
								answerCoding: { code: "noMissing" },
							},
						],
					},
				],
			},
			{
				linkId: "4_2_Fd_Str_target",
				type: "group",
				enableBehavior: "any",
				enableWhen: [
					{
						question: "4_Fd_Str_ins",
						operator: "=",
						answerCoding: { code: "correctButIncomplete" },
					},
					{
						question: "4_Fd_Str_ins",
						operator: "=",
						answerCoding: { code: "incorrectButComplete" },
					},
					{
						question: "4_Fd_Str_ins",
						operator: "=",
						answerCoding: { code: "incorrectAndIncomplete" },
					},
				],
				item: [
					{
						linkId: "4_2_Fd_Str_target_choice",
						text: "Ist die Angabe zu den Zielgebieten korrekt?",
						required: true,
						type: "choice",
						answerOption: [
							{ valueCoding: { code: "yes", display: "Ja" } },
							{ valueCoding: { code: "no", display: "Nein, die Information stimmt nicht" } },
							{ valueCoding: { code: "noMissing", display: "Nein, es fehlt etwas" } },
							{ valueCoding: { code: "unknown", display: "Ich weiß nicht" } },
							{ valueCoding: { code: "na", display: "Hierzu möchte ich keine Angabe machen" } },
						],
					},
					{
						linkId: "4_2_Fd_Str_target_text",
						text: "Welche Information zu den Zielgebieten stimmt nicht bzw. fehlt? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableBehavior: "any",
						enableWhen: [
							{
								question: "4_2_Fd_Str_target_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
							{
								question: "4_2_Fd_Str_target_choice",
								operator: "=",
								answerCoding: { code: "noMissing" },
							},
						],
					},
				],
			},
			{
				linkId: "4_3_Fd_Str_Ende",
				text: "",
				type: "group",
				enableBehavior: "any",
				enableWhen: [
					{
						question: "4_Fd_Str_ins",
						operator: "=",
						answerCoding: { code: "correctButIncomplete" },
					},
					{
						question: "4_Fd_Str_ins",
						operator: "=",
						answerCoding: { code: "incorrectButComplete" },
					},
					{
						question: "4_Fd_Str_ins",
						operator: "=",
						answerCoding: { code: "incorrectAndIncomplete" },
					},
				],
				item: [
					{
						linkId: "4_3_Fd_Str_Ende_choice",
						text: "Stimmt der Grund für das Ende der Behandlung?",
						type: "choice",
						required: true,
						answerOption: [
							{ valueCoding: { code: "yes", display: "Ja" } },
							{ valueCoding: { code: "no", display: "Nein, die Information stimmt nicht" } },
							{ valueCoding: { code: "noMissing", display: "Nein, es fehlt etwas" } },
							{ valueCoding: { code: "unknown", display: "Ich weiß nicht" } },
							{ valueCoding: { code: "na", display: "Hierzu möchte ich keine Angabe machen" } },
						],
					},
					{
						linkId: "4_3_Fd_Str_Ende_text",
						text: "Welche Information zum Grund für das Ende der Behandlung stimmt nicht bzw. fehlt? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableBehavior: "any",
						enableWhen: [
							{
								question: "4_3_Fd_Str_Ende_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
							{
								question: "4_3_Fd_Str_Ende_choice",
								operator: "=",
								answerCoding: { code: "noMissing" },
							},
						],
					},
				],
			},
			{
				linkId: "4_4_Fd_Str_Freitext_k",
				text: "Angabe sonstiger Informationen",
				type: "text",
				required: false,
			},
		],
	};
</script>

<IDGLayout
	{showFeedback}
	{cancelFeedback}
	questionnaire={radiationFeedback}
	onCurrentItemChange={handleCurrentItemChange}
>
	{#snippet children()}
		{#if procedure}
			<Radiation
				radiationTherapy={procedure}
				{bestrahlungen}
				{showFeedback}
				highlightLinkId={currentItemLinkId}
			/>
		{:else}
			<p class="text-muted-foreground">Keine Strahlentherapieinformationen verfügbar.</p>
		{/if}
	{/snippet}
</IDGLayout>
