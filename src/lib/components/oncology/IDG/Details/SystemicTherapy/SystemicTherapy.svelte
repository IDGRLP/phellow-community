<script lang="ts">
	import type { Procedure } from "fhir/r4";
	import { getTreatmendEndReason, getTreatmentPeriod, getTreatmentType } from "./helper";

	interface Props {
		class?: string;
		procedure: Procedure;
		showFeedback: boolean;
	}

	let { class: classes, procedure, showFeedback }: Props = $props();

	// Get data for display
	const treatmentPeriod = $derived(getTreatmentPeriod(procedure));
	let treatmentDateString = $derived.by(() => {
		if (!treatmentPeriod) return undefined;

		if (treatmentPeriod.startDate && treatmentPeriod.endDate) {
			return `${treatmentPeriod.startDate} - ${treatmentPeriod.endDate}`;
		} else if (treatmentPeriod.startDate) {
			return treatmentPeriod.startDate;
		} else if (treatmentPeriod.endDate) {
			return treatmentPeriod.endDate;
		} else {
			return undefined;
		}
	});
	let treatmentEndReason = $derived(getTreatmendEndReason(procedure));
	let treatmentType = $derived(getTreatmentType(procedure));
</script>

<div class="flex flex-row items-baseline justify-start gap-2">
	<h3 class="font-xl mt-0">Systemische Therapie</h3>
	{#if treatmentDateString}
		<span class="text-muted-foreground">({treatmentDateString})</span>
	{/if}
</div>

<div
	class={["grid grid-cols-1 gap-8", showFeedback ? "md:grid-cols-1" : "md:grid-cols-2", classes]}
>
	{#if treatmentType}
		<div class="border-border bg-card flex flex-col gap-6 rounded-lg border p-4 shadow-xs">
			<div>
				<div class="flex items-center justify-start gap-2">
					<h4 class="font-normal">Therapietyp</h4>
				</div>
				<div class="text-muted-foreground">{treatmentType}</div>
			</div>
		</div>
	{/if}
	{#if treatmentEndReason}
		<div class="border-border bg-card flex flex-col gap-6 rounded-lg border p-4 shadow-xs">
			<div>
				<div class="flex items-center justify-start gap-2">
					<h4 class="font-normal">Grund für das Ende der Behandlung</h4>
				</div>
				<div class="text-muted-foreground">{treatmentEndReason}</div>
			</div>
		</div>
	{/if}
</div>
