<script lang="ts">
	import type { Bundle, Questionnaire } from "fhir/r4";
	import TnmDisplay from "../TNMDisplay.svelte";
	import { parseStageGroupObservation } from "./parseTNM";
	import IDGLayout from "./IDGLayout.svelte";

	interface Props {
		observationId: string;
		bundle: Bundle;
		showFeedback: boolean;
		cancelFeedback?: () => void;
	}

	let { observationId, bundle, showFeedback, cancelFeedback }: Props = $props();

	let currentItemLinkId = $state<string | undefined>(undefined);

	function handleCurrentItemChange(itemLinkId?: string): void {
		currentItemLinkId = itemLinkId;
	}

	let tnmData = $derived(parseStageGroupObservation(observationId, bundle));

	const tnmFeedback: Questionnaire = {
		resourceType: "Questionnaire",
		status: "active",
		title: "Feedback zur TNM-Klassifikation",
		id: "7_Fd",
		item: [
			{
				linkId: "7_Fd_TNM_ins",
				text: "Stimmen die TNM-Daten?",
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
								"Nein, die angezeigten Informationen sind (teilweise) fehlerhaft, aber an sich vollständig (falsch, aber vollständig)",
						},
					},
					{
						valueCoding: {
							code: "incorrectAndIncomplete",
							display:
								"Nein, die angezeigten Informationen sind (teilweise) fehlerhaft und unvollständig (falsch und unvollständig)",
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
				linkId: "7_1_Fd_TNM_datum",
				type: "group",
				enableBehavior: "any",
				enableWhen: [
					{
						question: "7_Fd_TNM_ins",
						operator: "=",
						answerCoding: { code: "correctButIncomplete" },
					},
					{
						question: "7_Fd_TNM_ins",
						operator: "=",
						answerCoding: { code: "incorrectButComplete" },
					},
					{
						question: "7_Fd_TNM_ins",
						operator: "=",
						answerCoding: { code: "incorrectAndIncomplete" },
					},
				],
				item: [
					{
						linkId: "7_1_Fd_TNM_datum_choice",
						text: "Stimmt das Datum?",
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
						linkId: "7_1_Fd_TNM_datum_text",
						text: "Welche Information beim TNM-Datum stimmt nicht bzw. fehlt? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableBehavior: "any",
						enableWhen: [
							{
								question: "7_1_Fd_TNM_datum_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
							{
								question: "7_1_Fd_TNM_datum_choice",
								operator: "=",
								answerCoding: { code: "noMissing" },
							},
						],
					},
				],
			},
			{
				linkId: "7_2_Fd_TNM_classification",
				type: "group",
				enableBehavior: "any",
				enableWhen: [
					{
						question: "7_Fd_TNM_ins",
						operator: "=",
						answerCoding: { code: "correctButIncomplete" },
					},
					{
						question: "7_Fd_TNM_ins",
						operator: "=",
						answerCoding: { code: "incorrectButComplete" },
					},
					{
						question: "7_Fd_TNM_ins",
						operator: "=",
						answerCoding: { code: "incorrectAndIncomplete" },
					},
				],
				item: [
					{
						linkId: "7_2_Fd_TNM_classification_choice",
						text: "Stimmt die Klassifikation?",
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
						linkId: "7_2_Fd_TNM_classification_text",
						text: "Welche Information bei der TNM-Klassifikation stimmt nicht bzw. fehlt? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableBehavior: "any",
						enableWhen: [
							{
								question: "7_2_Fd_TNM_classification_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
							{
								question: "7_2_Fd_TNM_classification_choice",
								operator: "=",
								answerCoding: { code: "noMissing" },
							},
						],
					},
				],
			},
			{
				linkId: "7_3_Fd_TNM_Freitext_k",
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
	questionnaire={tnmFeedback}
	onCurrentItemChange={handleCurrentItemChange}
>
	{#snippet children()}
		{#if tnmData}
			<TnmDisplay staging={tnmData} highlightLinkId={currentItemLinkId} />
		{:else}
			<p class="text-muted-foreground">Keine TNM-Details verfügbar.</p>
		{/if}
	{/snippet}
</IDGLayout>
