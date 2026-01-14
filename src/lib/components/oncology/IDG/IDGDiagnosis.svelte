<script lang="ts">
	import Diagnosis from "./Details/Diagnosis/Diagnosis.svelte";
	import ProstataPSA from "./Details/Diagnosis/ProstataPSA.svelte";
	import Tumorgroesse from "./Details/Diagnosis/Tumorgroesse.svelte";
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

	let currentItemLinkId = $state<string | undefined>(undefined);

	function handleCurrentItemChange(itemLinkId?: string): void {
		currentItemLinkId = itemLinkId;
	}

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
								"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-histologie" ||
							value ===
								"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-histologie-icdo3"
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

	let tumorGroesse = $derived(
		bundle.entry
			?.filter((entry) =>
				entry.resource?.meta?.profile?.includes(
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-tumorgroesse"
				)
			)
			?.map((e) => e.resource as Observation)
			.filter((observation) => observation.focus?.some((f) => f.reference?.includes(conditionId)))
	);

	let psaValues = $derived(
		bundle.entry
			?.filter((entry) =>
				entry.resource?.meta?.profile?.includes(
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-prostate-psa"
				)
			)
			?.map((e) => e.resource as Observation)
			.filter((observation) => observation.focus?.some((f) => f.reference?.includes(conditionId)))
	);

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
				linkId: "0_1_Fd_Diag_ICD",
				type: "group",
				enableBehavior: "any",
				enableWhen: [
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "correctButIncomplete" },
					},
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "incorrectButComplete" },
					},
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "incorrectAndIncomplete" },
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
							{ valueCoding: { code: "no", display: "Nein, die Information stimmt nicht" } },
							{ valueCoding: { code: "noMissing", display: "Nein, es fehlt etwas" } },
							{ valueCoding: { code: "unknown", display: "Ich weiß nicht" } },
							{ valueCoding: { code: "na", display: "Hierzu möchte ich keine Angabe machen" } },
						],
					},
					{
						linkId: "0_1_Fd_Diag_ICD_text",
						text: "Welche Information beim ICD-10 stimmt nicht bzw. fehlt? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableBehavior: "any",
						enableWhen: [
							{
								question: "0_1_Fd_Diag_ICD_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
							{
								question: "0_1_Fd_Diag_ICD_choice",
								operator: "=",
								answerCoding: { code: "noMissing" },
							},
						],
					},
				],
			},
			{
				linkId: "0_1_Fd_Diag_Seitenlokalisation",
				text: "",
				type: "group",
				enableBehavior: "any",
				enableWhen: [
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "correctButIncomplete" },
					},
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "incorrectButComplete" },
					},
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "incorrectAndIncomplete" },
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
							{ valueCoding: { code: "no", display: "Nein, die Information stimmt nicht" } },
							{ valueCoding: { code: "noMissing", display: "Nein, es fehlt etwas" } },
							{ valueCoding: { code: "unknown", display: "Ich weiß nicht" } },
							{ valueCoding: { code: "na", display: "Hierzu möchte ich keine Angabe machen" } },
						],
					},
					{
						linkId: "0_1_Fd_Diag_Seitenlokalisation_text",
						text: "Welche Information der Seitenlokalisation stimmt nicht bzw. fehlt? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableBehavior: "any",
						enableWhen: [
							{
								question: "0_1_Fd_Diag_Seitenlokalisation_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
							{
								question: "0_1_Fd_Diag_Seitenlokalisation_choice",
								operator: "=",
								answerCoding: { code: "noMissing" },
							},
						],
					},
				],
			},
			{
				linkId: "0_1_Fd_Diag_Morphologie",
				text: "",
				type: "group",
				enableBehavior: "any",
				enableWhen: [
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "correctButIncomplete" },
					},
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "incorrectButComplete" },
					},
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "incorrectAndIncomplete" },
					},
				],
				item: [
					{
						linkId: "0_1_Fd_Diag_Morphologie_choice",
						text: "Stimmt die Morphologie?",
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
						linkId: "0_1_Fd_Diag_Morphologie_text",
						text: "Welche Information der Morphologie stimmt nicht bzw. fehlt? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableBehavior: "any",
						enableWhen: [
							{
								question: "0_1_Fd_Diag_Morphologie_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
							{
								question: "0_1_Fd_Diag_Morphologie_choice",
								operator: "=",
								answerCoding: { code: "noMissing" },
							},
						],
					},
				],
			},
			{
				linkId: "0_1_Fd_Diag_Topographie",
				text: "",
				type: "group",
				enableBehavior: "any",
				enableWhen: [
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "correctButIncomplete" },
					},
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "incorrectButComplete" },
					},
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "incorrectAndIncomplete" },
					},
				],
				item: [
					{
						linkId: "0_1_Fd_Diag_Topographie_choice",
						text: "Stimmt die Topographie?",
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
						linkId: "0_1_Fd_Diag_Topographie_text",
						text: "Welche Information der Topographie stimmt nicht bzw. fehlt? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableBehavior: "any",
						enableWhen: [
							{
								question: "0_1_Fd_Diag_Topographie_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
							{
								question: "0_1_Fd_Diag_Topographie_choice",
								operator: "=",
								answerCoding: { code: "noMissing" },
							},
						],
					},
				],
			},
			{
				linkId: "0_1_Fd_Diag_Histologie",
				text: "",
				type: "group",
				enableBehavior: "any",
				enableWhen: [
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "correctButIncomplete" },
					},
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "incorrectButComplete" },
					},
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "incorrectAndIncomplete" },
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
							{ valueCoding: { code: "no", display: "Nein, die Information stimmt nicht" } },
							{ valueCoding: { code: "noMissing", display: "Nein, es fehlt etwas" } },
							{ valueCoding: { code: "unknown", display: "Ich weiß nicht" } },
							{ valueCoding: { code: "na", display: "Hierzu möchte ich keine Angabe machen" } },
						],
					},
					{
						linkId: "0_1_Fd_Diag_Histologie_text",
						text: "Welche Information der Histologie-Daten stimmen nicht bzw. fehlen? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableBehavior: "any",
						enableWhen: [
							{
								question: "0_1_Fd_Diag_Histologie_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
							{
								question: "0_1_Fd_Diag_Histologie_choice",
								operator: "=",
								answerCoding: { code: "noMissing" },
							},
						],
					},
				],
			},
			{
				linkId: "0_1_Fd_Diag_Fernmetastasen",
				text: "",
				type: "group",
				enableBehavior: "any",
				enableWhen: [
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "correctButIncomplete" },
					},
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "incorrectButComplete" },
					},
					{
						question: "0_Fd_Diag_ins",
						operator: "=",
						answerCoding: { code: "incorrectAndIncomplete" },
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
							{ valueCoding: { code: "no", display: "Nein, die Information stimmt nicht" } },
							{ valueCoding: { code: "noMissing", display: "Nein, es fehlt etwas" } },
							{ valueCoding: { code: "unknown", display: "Ich weiß nicht" } },
							{ valueCoding: { code: "na", display: "Hierzu möchte ich keine Angabe machen" } },
						],
					},
					{
						linkId: "0_1_Fd_Diag_Fernmetastasen_text",
						text: "Welche Information der Fernmetastasen-Daten stimmen nicht bzw. fehlen? Seien Sie bitte möglichst präzise.",
						type: "text",
						required: true,
						enableBehavior: "any",
						enableWhen: [
							{
								question: "0_1_Fd_Diag_Fernmetastasen_choice",
								operator: "=",
								answerCoding: { code: "no" },
							},
							{
								question: "0_1_Fd_Diag_Fernmetastasen_choice",
								operator: "=",
								answerCoding: { code: "noMissing" },
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

<IDGLayout
	{showFeedback}
	{cancelFeedback}
	questionnaire={diagnosisFeedback}
	onCurrentItemChange={handleCurrentItemChange}
>
	{#snippet children()}
		{#if condition}
			<Diagnosis {showFeedback} {condition} highlightLinkId={currentItemLinkId} />

			{#if tumorGroesse && tumorGroesse.length > 0}
				<Tumorgroesse
					{showFeedback}
					observations={tumorGroesse}
					highlightLinkId={currentItemLinkId}
				/>
			{/if}

			{#if psaValues && psaValues.length > 0}
				<ProstataPSA {showFeedback} observations={psaValues} highlightLinkId={currentItemLinkId} />
			{/if}

			{#if histologyObservations && histologyObservations.length > 0}
				<Histology
					{showFeedback}
					observations={histologyObservations}
					highlightLinkId={currentItemLinkId}
				/>
			{:else}
				<div>
					<h3 class="font-xl my-0">Histologie</h3>
					<p class="text-muted-foreground">Keine Histologieinformationen verfügbar.</p>
				</div>
			{/if}

			{#if fernmetastasenObservations && fernmetastasenObservations.length > 0}
				<Fernmetastasen
					{showFeedback}
					fernmetastasen={fernmetastasenObservations}
					highlightLinkId={currentItemLinkId}
				/>
			{:else}
				<div>
					<h3 class="font-xl my-0">Fernmetastasen</h3>
					<p class="text-muted-foreground">Keine Fernmetastaseninformationen verfügbar.</p>
				</div>
			{/if}
		{:else}
			<p class="text-muted-foreground">Keine Diagnoseinformationen verfügbar.</p>
		{/if}
	{/snippet}
</IDGLayout>
