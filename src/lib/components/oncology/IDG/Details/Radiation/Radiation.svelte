<script lang="ts">
	import type { Procedure } from "fhir/r4";

	import {
		getTargetAreas,
		getTargetAreasV2026,
		getTreatmentEndReasonCoding,
		getTreatmentPeriod,
		parseTreatmentEndReason,
	} from "./helper";
	import CodingCard from "../CodingCard.svelte";

	interface Props {
		class?: string;
		radiationTherapy: Procedure;
		bestrahlungen?: Procedure[];
		showFeedback: boolean;
		highlightLinkId?: string;
	}

	let {
		class: classes,
		radiationTherapy,
		bestrahlungen,
		showFeedback,
		highlightLinkId,
	}: Props = $props();

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

	const targetAreas = $derived(
		getTargetAreas(radiationTherapy) ?? getTargetAreasV2026(bestrahlungen ?? [])
	);
</script>

<div data-tutorial="radiation-header" class="flex flex-row items-baseline justify-start gap-2">
	<h2 class="font-2xl mt-0">Strahlentherapie</h2>
	{#if treatmentDateString}
		<span
			class={[
				"text-muted-foreground",
				highlightLinkId === "4_1_Fd_Str_datum" ? "ring-ring ring-2" : undefined,
			]}>({treatmentDateString})</span
		>
	{/if}
</div>

<div data-tutorial="radiation-targets">
	<div class="flex flex-row items-baseline justify-start gap-2">
		<h3 class="mt-0 text-xl">Zielgebiete</h3>
	</div>

	<div
		class={["grid grid-cols-1 gap-8", showFeedback ? "md:grid-cols-1" : "md:grid-cols-2", classes]}
	>
		{#if targetAreas}
			{#each targetAreas as targetArea}
				<CodingCard
					heading="Zielgebiet"
					coding={targetArea.target}
					noDataText="Kein Zielgebiet vorhanden"
					codingDisplay={targetArea.target?.display}
					highlight={highlightLinkId === "4_2_Fd_Str_target"}
				>
					{#if targetArea.laterality}
						<div class="flex flex-col gap-1">
							<h4 class="mt-2 text-xl font-medium">Seitenlokalisation</h4>
							<div class="text-muted-foreground">{targetArea.laterality}</div>
						</div>
					{/if}
				</CodingCard>
			{/each}
		{/if}
	</div>
</div>

<div data-tutorial="radiation-end">
	<div class="flex flex-row items-baseline justify-start gap-2">
		<h3 class="mt-0 text-xl">Ende</h3>
	</div>

	{#if treatmentEndReason}
		<div class="grid md:grid-cols-2">
			<div
				class={[
					"border-border bg-card fle-col m-0.5 flex gap-6 rounded-lg border p-4 shadow-xs",
					highlightLinkId === "4_3_Fd_Str_Ende" ? "ring-ring ring-2" : undefined,
				]}
			>
				<div class="flex flex-col gap-2">
					<h3 class="mt-0 font-medium">Grund für das Ende der Behandlung</h3>
					<div class="text-muted-foreground mt-1">
						{parseTreatmentEndReason(treatmentEndReason)}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
