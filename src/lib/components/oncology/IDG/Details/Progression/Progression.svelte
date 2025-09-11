<script lang="ts">
	import type { Observation } from "fhir/r4";

	import { getStatusColor, getStatusDisplayString } from "./helper";

	interface Props {
		class?: string;
		progression: Observation;
		showFeedback: boolean;
	}

	let { class: classes, progression, showFeedback }: Props = $props();

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

	let gesamtbeurteilung = $derived(
		progression.valueCodeableConcept?.coding?.find(
			(coding) =>
				coding.system ===
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-verlauf-gesamtbeurteilung"
		)
	);

	let progressionDate = $derived(formatDate(progression.effectiveDateTime));
	let gesamtbeurteilungStatus = $derived(getStatusDisplayString(gesamtbeurteilung?.code || ""));
</script>

<div class="flex flex-row items-baseline justify-start gap-2">
	<h3 class="font-xl mt-0">Verlauf</h3>
	<div class="text-muted-foreground">{progressionDate}</div>
</div>

<div
	class={["grid grid-cols-1 gap-8", showFeedback ? "md:grid-cols-1" : "md:grid-cols-2", classes]}
>
	<div class="border-border bg-card flex flex-col gap-6 rounded-lg border p-4 shadow-xs">
		<div>
			<div class="flex items-center justify-start gap-2">
				<h4 class="font-normal">Gesamtbeurteilung</h4>
				<span
					class="bg-muted text-muted-foreground inline-block rounded px-2 py-1 text-xs font-medium"
				>
					{gesamtbeurteilung?.code}
				</span>
			</div>
			<div class="text-muted-foreground">{gesamtbeurteilungStatus}</div>
		</div>
	</div>
</div>
