<script lang="ts">
	import type { Observation } from "fhir/r4";
	import GewebeProbe from "./GewebeProbe.svelte";

	interface Props {
		class?: string;
		observations: Observation[];
		showFeedback: boolean;
	}

	let { class: classes, observations, showFeedback }: Props = $props();

	// Helper function to format date
	function formatDate(dateString?: string) {
		if (!dateString) return "Unbekannt";
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("de-DE", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(date);
	}
</script>

<h3 class="font-xl mt-0">Histologie</h3>

<div
	class={["grid grid-cols-1 gap-8", showFeedback ? "md:grid-cols-1" : "md:grid-cols-3", classes]}
>
	{#each observations as probe}
		{@const dateString = probe?.effectiveDateTime && formatDate(probe.effectiveDateTime)}
		{@const coding = probe?.valueCodeableConcept?.coding?.[0]}
		<GewebeProbe {dateString} {coding} />
	{/each}
</div>
