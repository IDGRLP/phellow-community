<script lang="ts">
	import type { Bundle, Observation, QuestionnaireResponse } from "fhir/r4";
	import tnmFeedback from "./IDGTNMFeedback";
	import TnmDisplay from "../TNMDisplay.svelte";
	import { parseStageGroupObservation } from "./parseTNM";
	import IDGLayout from "./IDGLayout.svelte";

	interface Props {
		observationId: string;
		bundle: Bundle;
		showFeedback: boolean;
		cancelFeedback?: () => void;
		questionnaireResponse?: QuestionnaireResponse;
	}

	let {
		observationId,
		bundle,
		showFeedback,
		cancelFeedback,
		questionnaireResponse,
	}: Props = $props();

	let currentItemLinkId = $state<string | undefined>(undefined);

	function handleCurrentItemChange(itemLinkId?: string): void {
		currentItemLinkId = itemLinkId;
	}

	let tnmData = $derived(parseStageGroupObservation(observationId, bundle));

	let tnmObservation = $derived(
		bundle.entry?.find((entry) => entry.resource?.id === observationId)?.resource as
			| Observation
			| undefined
	);
	let subjectReference = $derived({ reference: `Observation/${observationId}` });
	let sourceReference = $derived(tnmObservation?.subject);
</script>

<IDGLayout
	{showFeedback}
	{cancelFeedback}
	questionnaire={tnmFeedback}
	{questionnaireResponse}
	onCurrentItemChange={handleCurrentItemChange}
	subject={subjectReference}
	source={sourceReference}
>
	{#snippet children()}
		{#if tnmData}
			<TnmDisplay staging={tnmData} highlightLinkId={currentItemLinkId} />
		{:else}
			<p class="text-muted-foreground">Keine TNM-Details verfügbar.</p>
		{/if}
	{/snippet}
</IDGLayout>
