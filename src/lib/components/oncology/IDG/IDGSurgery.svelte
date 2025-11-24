<script lang="ts">
	import Histology from "./Details/Histology/Histology.svelte";
	import Surgery from "./Details/Surgery/Surgery.svelte";
	import IDGLayout from "./IDGLayout.svelte";
	import type { Bundle, Observation, Procedure, Questionnaire } from "fhir/r4";

	interface Props {
		procedureId: string;
		bundle: Bundle;
		showFeedback: boolean;
		cancelFeedback?: () => void;
	}

	let { procedureId, bundle, showFeedback, cancelFeedback }: Props = $props();

	let procedure = $derived(
		bundle.entry?.find((entry) => entry.resource?.id === procedureId)?.resource as
			| Procedure
			| undefined
	);

	let currentItemLinkId = $state<string | undefined>(undefined);

	function handleCurrentItemChange(itemLinkId?: string): void {
		currentItemLinkId = itemLinkId;
		console.log("Current Item LinkId:", itemLinkId);
	}

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
			.filter((observation) => observation.focus?.some((f) => f.reference?.includes(procedureId)))
	);

	const surgeryFeedback: Questionnaire = {
		resourceType: "Questionnaire",
		status: "active",
		title: "Feedback zur Operation",
		id: "3_Fd",
		item: [
			{
				linkId: "3_Fd_OP_ins",
				text: "Stimmen die Operationsdaten?",
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
				linkId: "3_1_Fd_OP_datum",
				type: "group",
				enableBehavior: "any",
				enableWhen: [
					{
						question: "3_Fd_OP_ins",
						operator: "=",
						answerCoding: { code: "correctButIncomplete" },
					},
					{
						question: "3_Fd_OP_ins",
						operator: "=",
						answerCoding: { code: "incorrectButComplete" },
					},
					{
						question: "3_Fd_OP_ins",
						operator: "=",
						answerCoding: { code: "incorrectAndIncomplete" },
					},
				],
				item: [
					{
						linkId: "3_1_Fd_OP_datum_choice",
						text: "Stimmt das Operationsdatum?",
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
						linkId: "3_1_Fd_OP_datum_text",
						text: "Welche Information beim Operationsdatum stimmt nicht bzw. fehlt? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableBehavior: "any",
						enableWhen: [
							{
								question: "3_1_Fd_OP_datum_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
							{
								question: "3_1_Fd_OP_datum_choice",
								operator: "=",
								answerCoding: { code: "noMissing" },
							},
						],
					},
				],
			},
			{
				linkId: "3_2_Fd_OP_residual",
				type: "group",
				enableBehavior: "any",
				enableWhen: [
					{
						question: "3_Fd_OP_ins",
						operator: "=",
						answerCoding: { code: "correctButIncomplete" },
					},
					{
						question: "3_Fd_OP_ins",
						operator: "=",
						answerCoding: { code: "incorrectButComplete" },
					},
					{
						question: "3_Fd_OP_ins",
						operator: "=",
						answerCoding: { code: "incorrectAndIncomplete" },
					},
				],
				item: [
					{
						linkId: "3_2_Fd_OP_residual_choice",
						text: "Ist die Angabe zur Beurteilung des Residualstatus korrekt?",
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
						linkId: "3_2_Fd_OP_residual_text",
						text: "Welche Information zur Beurteilung des Residualstatus stimmt nicht bzw. fehlt? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableBehavior: "any",
						enableWhen: [
							{
								question: "3_2_Fd_OP_residual_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
							{
								question: "3_2_Fd_OP_residual_choice",
								operator: "=",
								answerCoding: { code: "noMissing" },
							},
						],
					},
				],
			},
			{
				linkId: "3_3_Fd_OP_Histologie",
				text: "",
				type: "group",
				enableBehavior: "any",
				enableWhen: [
					{
						question: "3_Fd_OP_ins",
						operator: "=",
						answerCoding: { code: "correctButIncomplete" },
					},
					{
						question: "3_Fd_OP_ins",
						operator: "=",
						answerCoding: { code: "incorrectButComplete" },
					},
					{
						question: "3_Fd_OP_ins",
						operator: "=",
						answerCoding: { code: "incorrectAndIncomplete" },
					},
				],
				item: [
					{
						linkId: "3_3_Fd_OP_Histologie_choice",
						text: "Stimmen die Histologie-Daten?",
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
						linkId: "3_3_Fd_OP_Histologie_text",
						text: "Welche Information der Histologie-Daten stimmen nicht bzw. fehlen? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableBehavior: "any",
						enableWhen: [
							{
								question: "3_2_Fd_OP_Histologie_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
							{
								question: "3_2_Fd_OP_Histologie_choice",
								operator: "=",
								answerCoding: { code: "noMissing" },
							},
						],
					},
				],
			},
			{
				linkId: "3_4_Fd_OP_Freitext_k",
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
	questionnaire={surgeryFeedback}
	onCurrentItemChange={handleCurrentItemChange}
>
	{#snippet children()}
		{#if procedure}
			<Surgery {procedure} {showFeedback} highlightLinkId={currentItemLinkId} />
			{#if histologyObservations && histologyObservations.length > 0}
				<Histology
					showFeedback={false}
					observations={histologyObservations}
					highlightLinkId={currentItemLinkId}
				/>
			{:else}
				<div class="m-0.5">
					<h3 class="font-xl my-0">Histologie</h3>
					<p
						class={[
							"text-muted-foreground",
							currentItemLinkId === "3_3_Fd_OP_Histologie" ? "ring-ring ring-2" : undefined,
						]}
					>
						Keine Histologieinformationen verfügbar.
					</p>
				</div>
			{/if}
		{:else}
			<p class="text-muted-foreground">Keine OP-Informationen verfügbar.</p>
		{/if}
	{/snippet}
</IDGLayout>
