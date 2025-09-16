<script lang="ts">
	import type { Procedure } from "fhir/r4";

	import {
		getTargetAreas,
		getTreatmentEndReasonCoding,
		getTreatmentPeriod,
		parseTreatmentEndReason,
	} from "./helper";

	interface Props {
		class?: string;
		radiationTherapy: Procedure;
		showFeedback: boolean;
	}

	let { class: classes, radiationTherapy, showFeedback }: Props = $props();

	const treatmentPeriod = $derived(getTreatmentPeriod(radiationTherapy));
	let treatmentDateString = $derived.by(() => {
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
	let treatmentEndReason = $derived(getTreatmentEndReasonCoding(radiationTherapy));

	const targetAreas = $derived(getTargetAreas(radiationTherapy));
</script>

<div class="flex flex-row items-baseline justify-start gap-2">
	<h3 class="font-xl mt-0">Strahlentherapie</h3>
	{#if treatmentDateString}
		<span class="text-muted-foreground">({treatmentDateString})</span>
	{/if}
</div>

<div
	class={["grid grid-cols-1 gap-8", showFeedback ? "md:grid-cols-1" : "md:grid-cols-2", classes]}
>
	{#if targetAreas}
		{#each targetAreas as targetArea}
			<div class="border-border bg-card flex flex-col gap-6 rounded-lg border p-4 shadow-xs">
				<div class="flex flex-col gap-2">
					<h3 class="mt-0 font-medium">Zielgebiet</h3>
					<div class="text-muted-foreground mt-1">{targetArea.target}</div>
				</div>
				{#if targetArea.laterality}
					<div class="flex flex-col gap-2">
						<h3 class="mt-0 font-medium">Seitenlokalisation</h3>
						<div class="text-muted-foreground mt-1">{targetArea.laterality}</div>
					</div>
				{/if}
			</div>
		{/each}
	{/if}
	{#if treatmentEndReason}
		<div class="border-border bg-card flex flex-col gap-6 rounded-lg border p-4 shadow-xs">
			<div class="flex flex-col gap-2">
				<h3 class="mt-0 font-medium">Grund für das Ende der Behandlung</h3>
				<div class="text-muted-foreground mt-1">{parseTreatmentEndReason(treatmentEndReason)}</div>
			</div>
		</div>
	{/if}
</div>
