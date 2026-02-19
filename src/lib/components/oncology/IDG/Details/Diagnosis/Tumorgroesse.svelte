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

<h3 class="mt-0 text-xl">Tumorgrößen</h3>

<div
	class={["grid grid-cols-1 gap-8", showFeedback ? "md:grid-cols-1" : "md:grid-cols-3", classes]}
	bind:this={element}
>
	{#each observations as probe}
		{@const dateString = probe?.effectiveDateTime && formatDate(probe.effectiveDateTime)}
		{@const coding = probe?.bodySite?.coding?.[0]}
		{@const text = probe?.bodySite?.text}
		{@const method =
			probe?.method?.text ?? probe.method?.coding?.[0]?.display ?? probe.method?.coding?.[0]?.code}
		{@const valueString = probe?.valueQuantity?.value}
		{@const unit = probe?.valueQuantity?.unit}
		<div
			class={[
				"border-border bg-card m-0.5 flex flex-col gap-2 rounded-lg border p-4 shadow-xs",
				highlight ? "ring-ring ring-2" : undefined,
			]}
		>
			<div class="flex items-center justify-between">
				<h3 class="mt-0 mb-2 font-medium">
					{text ?? coding?.display ?? coding?.code ?? "Unbekannt"}
				</h3>
				<div title="Entnahmedatum" class="text-muted-foreground">{dateString || "Unbekannt"}</div>
			</div>
			<div>
				<div class="flex items-center justify-start gap-2">
					<h4 class="font-normal">{valueString ?? "–"} {unit ?? "–"}</h4>
				</div>
				{#if method}
					<div class="text-muted-foreground">
						{method}
					</div>
				{/if}
			</div>
		</div>
	{/each}
</div>
