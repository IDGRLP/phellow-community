<script lang="ts">
	import type { Observation } from "fhir/r4";
	import GewebeProbe from "./GewebeProbe.svelte";

	interface Props {
		class?: string;
		observations: Observation[];
		showFeedback: boolean;
		highlightLinkId?: string;
	}

	let { class: classes, observations, showFeedback, highlightLinkId }: Props = $props();

	let highlight = $derived(
		highlightLinkId === "0_1_Fd_Diag_Histologie" || highlightLinkId === "3_3_Fd_OP_Histologie"
	);

	let element: HTMLElement | null = null;

	$effect(() => {
		if (highlight && element) {
			element.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	});

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

<h3 class="mt-0 text-xl">Histologie</h3>

<div
	class={["grid grid-cols-1 gap-8", showFeedback ? "md:grid-cols-1" : "md:grid-cols-3", classes]}
	bind:this={element}
>
	{#each observations as probe}
		{@const dateString = probe?.effectiveDateTime && formatDate(probe.effectiveDateTime)}
		{@const coding = probe?.valueCodeableConcept?.coding?.[0]}
		{@const text = probe?.valueCodeableConcept?.text}
		<GewebeProbe {dateString} {coding} {text} {highlight} />
	{/each}
</div>
