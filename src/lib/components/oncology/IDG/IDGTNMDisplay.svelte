<script lang="ts">
	import type { Bundle } from "fhir/r4";
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

	let tnmData = $derived(parseStageGroupObservation(observationId, bundle));
</script>

<IDGLayout {showFeedback} {cancelFeedback}>
	{#snippet children()}
		{#if tnmData}
			<TnmDisplay staging={tnmData} />
		{:else}
			<p class="text-muted-foreground">Keine TNM-Details verfügbar.</p>
		{/if}
	{/snippet}
</IDGLayout>
