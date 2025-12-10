<script lang="ts">
	import type { Observation } from "fhir/r4";
	import { method } from "lodash-es";

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

	let sortedObservations = $derived(
		[...observations].sort((a, b) => {
			const dateA = a.effectiveDateTime ? new Date(a.effectiveDateTime) : new Date(0);
			const dateB = b.effectiveDateTime ? new Date(b.effectiveDateTime) : new Date(0);
			return dateA.getTime() - dateB.getTime();
		})
	);

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

<h3 class="font-xl mt-0">PSA Werte</h3>

<div
	class={[
		"grid grid-cols-1",
		showFeedback ? "gap-4 md:grid-cols-1" : "gap-8 md:grid-cols-3",
		classes,
	]}
	bind:this={element}
>
	{#each sortedObservations as psa}
		{@const dateString = psa?.effectiveDateTime && formatDate(psa.effectiveDateTime)}
		{@const valueString = psa?.valueQuantity?.value}
		{@const unit = psa?.valueQuantity?.unit}
		<div
			class={[
				"border-border bg-card m-0.5 flex items-baseline justify-between gap-2 rounded-lg border p-4 shadow-xs",
				highlight ? "ring-ring ring-2" : undefined,
			]}
		>
			<h3 class="my-0 font-medium">
				{valueString ?? "–"}
				{unit ?? "–"}
			</h3>
			<div title="Entnahmedatum" class="text-muted-foreground">{dateString || "Unbekannt"}</div>
		</div>
	{/each}
</div>
