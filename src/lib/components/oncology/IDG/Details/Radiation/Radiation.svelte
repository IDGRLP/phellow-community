<script lang="ts">
	import type { Procedure } from "fhir/r4";

	import { obdsTherapieEndeCodes } from "../helper";
	import { getTargetAreas } from "./helper";

	interface Props {
		class?: string;
		radiationTherapy: Procedure;
		showFeedback: boolean;
	}

	let { class: classes, radiationTherapy, showFeedback }: Props = $props();

	// Helper function to format date
	function formatDate(dateString?: string) {
		if (!dateString) return undefined;
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("de-DE", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(date);
	}

	// Helper function to get treatment period
	function getTreatmentPeriod() {
		const startDate = formatDate(radiationTherapy.performedPeriod?.start);
		const endDate = formatDate(radiationTherapy.performedPeriod?.end);
		return { startDate, endDate };
	}

	function getTreatmendEndReason(): string | undefined {
		const reasonCode = radiationTherapy.outcome?.coding?.find(
			(coding) =>
				coding.system ===
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-therapie-ende-grund"
		);

		if (!reasonCode?.code) return undefined;

		return obdsTherapieEndeCodes[reasonCode.code] || undefined;
	}

	// Get data for display
	const treatmentPeriod = $derived(getTreatmentPeriod());
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
	let treatmentEndReason = $derived(getTreatmendEndReason());

	// Get data for display
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
				<div>
					<div class="flex items-center justify-start gap-2">
						<h4 class="font-normal">Zielgebiet</h4>
					</div>
					<div class="text-muted-foreground">{targetArea.target}</div>
				</div>
				{#if targetArea.laterality}
					<div>
						<div class="flex items-center justify-start gap-2">
							<h4 class="font-normal">Seitenlokalisation</h4>
						</div>
						<div class="text-muted-foreground">{targetArea.laterality}</div>
					</div>
				{/if}
			</div>
		{/each}
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
