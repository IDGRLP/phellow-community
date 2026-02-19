<script lang="ts">
	import type { Bundle, Observation } from "fhir/r4";
	import progressionFeedback from "./IDGProgressionFeedback";
	import Progression from "./Details/Progression/Progression.svelte";
	import IDGLayout from "./IDGLayout.svelte";

	interface Props {
		observationId: string;
		bundle: Bundle;
		showFeedback: boolean;
		cancelFeedback?: () => void;
	}

	let { observationId, bundle, showFeedback, cancelFeedback }: Props = $props();

	let currentItemLinkId = $state<string | undefined>(undefined);

	let observation = $derived(
		bundle.entry?.find((entry) => entry.resource?.id === observationId)?.resource as
			| Observation
			| undefined
	);

	function handleCurrentItemChange(itemLinkId?: string): void {
		currentItemLinkId = itemLinkId;
	}
</script>

<IDGLayout
	{showFeedback}
	{cancelFeedback}
	questionnaire={progressionFeedback}
	onCurrentItemChange={handleCurrentItemChange}
>
	{#snippet children()}
		{#if observation}
			<Progression {showFeedback} progression={observation} highlightLinkId={currentItemLinkId} />
		{:else}
			<p class="text-muted-foreground">Keine Verlaufsinformationen verfügbar.</p>
		{/if}
	{/snippet}
</IDGLayout>
