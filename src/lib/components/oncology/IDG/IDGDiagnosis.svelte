<script lang="ts">
	import Diagnosis from "./Details/Diagnosis/Diagnosis.svelte";
	import ProstataPSA from "./Details/Diagnosis/ProstataPSA.svelte";
	import Tumorgroesse from "./Details/Diagnosis/Tumorgroesse.svelte";
	import Fernmetastasen from "./Details/Fernmetastasen/Fernmetastasen.svelte";
	import Histology from "./Details/Histology/Histology.svelte";
	import IDGLayout from "./IDGLayout.svelte";

	import type { Bundle, Condition, Observation } from "fhir/r4";
	import diagnosisFeedback from "./IDGDiagnosisFeedback";

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

	let subjectReference = $derived(
		condition?.id ? { reference: `Condition/${condition.id}` } : undefined
	);
	let sourceReference = $derived(condition?.subject);

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
</script>

<IDGLayout
	{showFeedback}
	{cancelFeedback}
	questionnaire={diagnosisFeedback}
	onCurrentItemChange={handleCurrentItemChange}
	subject={subjectReference}
	source={sourceReference}
>
	{#snippet children()}
		{#if condition}
			<Diagnosis {showFeedback} {condition} highlightLinkId={currentItemLinkId} />

			{#if tumorGroesse && tumorGroesse.length > 0}
				<div data-tutorial="diagnosis-tumor-size">
					<Tumorgroesse
						{showFeedback}
						observations={tumorGroesse}
						highlightLinkId={currentItemLinkId}
					/>
				</div>
			{/if}

			{#if psaValues && psaValues.length > 0}
				<ProstataPSA {showFeedback} observations={psaValues} highlightLinkId={currentItemLinkId} />
			{/if}

			{#if histologyObservations && histologyObservations.length > 0}
				<div data-tutorial="diagnosis-histology">
					<Histology
						{showFeedback}
						observations={histologyObservations}
						highlightLinkId={currentItemLinkId}
					/>
				</div>
			{:else}
				<div data-tutorial="diagnosis-histology">
					<h3 class="my-0 text-xl">Histologie</h3>
					<p class="text-muted-foreground">Keine Histologieinformationen verfügbar.</p>
				</div>
			{/if}

			{#if fernmetastasenObservations && fernmetastasenObservations.length > 0}
				<div data-tutorial="diagnosis-metastases">
					<Fernmetastasen
						{showFeedback}
						fernmetastasen={fernmetastasenObservations}
						highlightLinkId={currentItemLinkId}
					/>
				</div>
			{:else}
				<div data-tutorial="diagnosis-metastases">
					<h3 class="my-0 text-xl">Fernmetastasen</h3>
					<p class="text-muted-foreground">Keine Fernmetastaseninformationen verfügbar.</p>
				</div>
			{/if}
		{:else}
			<p class="text-muted-foreground">Keine Diagnoseinformationen verfügbar.</p>
		{/if}
	{/snippet}
</IDGLayout>
