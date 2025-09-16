<script lang="ts">
	import type { Procedure } from "fhir/r4";
	import {
		getTreatmentPeriod,
		getTreatmentEndReasonCoding,
		parseTreatmentEndReason,
		getTreatmentTypeCoding,
		parseTreatmentType,
	} from "./helper";
	import CodingCard from "../CodingCard.svelte";

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
	let treatmentEndReason = $derived(getTreatmentEndReasonCoding(procedure));
	let treatmentType = $derived(getTreatmentTypeCoding(procedure));
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
	<!-- Therapietyp -->
	<CodingCard
		heading="Therapietyp"
		coding={treatmentType}
		noDataText="Kein Therapietyp vorhanden"
		codingDisplay={treatmentType && parseTreatmentType(treatmentType)}
	/>

	<!-- Treatment End Reason -->
	{#if treatmentEndReason}
		<CodingCard
			heading="Grund für das Ende der Behandlung"
			coding={treatmentEndReason}
			noDataText="Kein Grund für das Ende der Behandlung vorhanden"
			codingDisplay={treatmentEndReason && parseTreatmentEndReason(treatmentEndReason)}
		/>
	{/if}
</div>
