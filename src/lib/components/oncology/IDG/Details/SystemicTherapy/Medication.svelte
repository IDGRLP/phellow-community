<script lang="ts">
	import type { MedicationStatement } from "fhir/r4";

	interface Props {
		class?: string;
		medications: MedicationStatement[];
		showFeedback: boolean;
		highlightLinkId?: string;
	}

	let { class: classes, medications, showFeedback, highlightLinkId }: Props = $props();

	let highlight = $derived(highlightLinkId === "0_1_Fd_Sys_Med");

	let element: HTMLElement | null = null;

	$effect(() => {
		if (highlight && element) {
			element.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	});
</script>

<h3 class="font-xl mt-0">Medikamente</h3>

<div
	class={[
		"grid grid-cols-1",
		showFeedback ? "gap-4 md:grid-cols-1" : "gap-8 md:grid-cols-3",
		classes,
	]}
	bind:this={element}
>
	{#each medications as medication}
		{@const text = medication.medicationCodeableConcept?.text}
		<div
			class={[
				"border-border bg-card m-0.5 flex items-baseline justify-between gap-2 rounded-lg border p-4 shadow-xs",
				highlight ? "ring-ring ring-2" : undefined,
			]}
		>
			<h3 class="my-0 font-medium">
				{text ?? "–"}
			</h3>
		</div>
	{/each}
</div>
