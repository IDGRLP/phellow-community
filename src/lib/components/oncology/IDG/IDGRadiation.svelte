<script lang="ts">
	import type { Bundle, Procedure, QuestionnaireResponse } from "fhir/r4";
	import radiationFeedback from "./IDGRadiationFeedback";
	import Radiation from "./Details/Radiation/Radiation.svelte";
	import IDGLayout from "./IDGLayout.svelte";

	interface Props {
		procedureId: string;
		bundle: Bundle;
		showFeedback: boolean;
		cancelFeedback?: () => void;
		questionnaireResponse?: QuestionnaireResponse;
	}

	let {
		procedureId,
		bundle,
		showFeedback,
		cancelFeedback,
		questionnaireResponse,
	}: Props = $props();

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

	let subjectReference = $derived(
		procedure?.id ? { reference: `Procedure/${procedure.id}` } : undefined
	);
	let sourceReference = $derived(procedure?.subject);
</script>

<IDGLayout
	{showFeedback}
	{cancelFeedback}
	questionnaire={radiationFeedback}
	{questionnaireResponse}
	onCurrentItemChange={handleCurrentItemChange}
	subject={subjectReference}
	source={sourceReference}
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
