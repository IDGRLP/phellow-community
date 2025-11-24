<script lang="ts">
	import type { Bundle, Procedure, Questionnaire } from "fhir/r4";
	import SystemicTherapy from "./Details/SystemicTherapy/SystemicTherapy.svelte";
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

	function handleCurrentItemChange(itemLinkId?: string): void {
		currentItemLinkId = itemLinkId;
	}

	const systemicTherapyFeedback: Questionnaire = {
		resourceType: "Questionnaire",
		status: "active",
		title: "Feedback zur Systemischen Therapie",
		id: "5_Fd",
		item: [
			{
				linkId: "5_Fd_Sys_ins",
				text: "Sind die Angaben zur systemischen Therapie korrekt?",
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
								"Nein, die angezeigten Informationen sind fehlerhaft, aber an sich vollständig (falsch, aber vollständig)",
						},
					},
					{
						valueCoding: {
							code: "incorrectAndIncomplete",
							display:
								"Nein, die angezeigten Informationen sind fehlerhaft und unvollständig (falsch und unvollständig)",
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
				linkId: "5_1_Fd_Sys_datum",
				type: "group",
				enableBehavior: "any",
				enableWhen: [
					{
						question: "5_Fd_Sys_ins",
						operator: "=",
						answerCoding: { code: "correctButIncomplete" },
					},
					{
						question: "5_Fd_Sys_ins",
						operator: "=",
						answerCoding: { code: "incorrectButComplete" },
					},
					{
						question: "5_Fd_Sys_ins",
						operator: "=",
						answerCoding: { code: "incorrectAndIncomplete" },
					},
				],
				item: [
					{
						linkId: "5_1_Fd_Sys_datum_choice",
						text: "Stimmt das Datum der systemischen Therapie?",
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
						linkId: "5_1_Fd_Sys_datum_text",
						text: "Welche Information beim Datum der systemischen Therapie stimmt nicht bzw. fehlt? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableBehavior: "any",
						enableWhen: [
							{
								question: "5_1_Fd_Sys_datum_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
							{
								question: "5_1_Fd_Sys_datum_choice",
								operator: "=",
								answerCoding: { code: "noMissing" },
							},
						],
					},
				],
			},
			{
				linkId: "5_2_Fd_Sys_type",
				type: "group",
				enableBehavior: "any",
				enableWhen: [
					{
						question: "5_Fd_Sys_ins",
						operator: "=",
						answerCoding: { code: "correctButIncomplete" },
					},
					{
						question: "5_Fd_Sys_ins",
						operator: "=",
						answerCoding: { code: "incorrectButComplete" },
					},
					{
						question: "5_Fd_Sys_ins",
						operator: "=",
						answerCoding: { code: "incorrectAndIncomplete" },
					},
				],
				item: [
					{
						linkId: "5_2_Fd_Sys_type_choice",
						text: "Ist die Angabe zum Therapietyp korrekt?",
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
						linkId: "5_2_Fd_Sys_type_text",
						text: "Welche Information zum Therapietyp stimmt nicht bzw. fehlt? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableBehavior: "any",
						enableWhen: [
							{
								question: "5_2_Fd_Sys_type_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
							{
								question: "5_2_Fd_Sys_type_choice",
								operator: "=",
								answerCoding: { code: "noMissing" },
							},
						],
					},
				],
			},
			{
				linkId: "5_3_Fd_Sys_Ende",
				text: "",
				type: "group",
				enableBehavior: "any",
				enableWhen: [
					{
						question: "5_Fd_Sys_ins",
						operator: "=",
						answerCoding: { code: "correctButIncomplete" },
					},
					{
						question: "5_Fd_Sys_ins",
						operator: "=",
						answerCoding: { code: "incorrectButComplete" },
					},
					{
						question: "5_Fd_Sys_ins",
						operator: "=",
						answerCoding: { code: "incorrectAndIncomplete" },
					},
				],
				item: [
					{
						linkId: "5_3_Fd_Sys_Ende_choice",
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
						linkId: "5_3_Fd_Sys_Ende_text",
						text: "Welche Information zum Grund für das Ende der Behandlung stimmt nicht bzw. fehlt? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableBehavior: "any",
						enableWhen: [
							{
								question: "5_3_Fd_Sys_Ende_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
							{
								question: "5_3_Fd_Sys_Ende_choice",
								operator: "=",
								answerCoding: { code: "noMissing" },
							},
						],
					},
				],
			},
			{
				linkId: "5_4_Fd_Sys_Freitext_k",
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
	questionnaire={systemicTherapyFeedback}
	onCurrentItemChange={handleCurrentItemChange}
>
	{#snippet children()}
		{#if procedure}
			<SystemicTherapy {procedure} {showFeedback} highlightLinkId={currentItemLinkId} />
		{:else}
			<p class="text-muted-foreground">Keine Systemische Therapieinformationen verfügbar.</p>
		{/if}
	{/snippet}
</IDGLayout>
