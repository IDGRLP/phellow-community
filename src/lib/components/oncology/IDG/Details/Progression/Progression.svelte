<script lang="ts">
	import type { Observation } from "fhir/r4";

	import { formatDate, getGesamtbeurteilungCoding, parseGesamtbeurteilung } from "./helper";
	import CodingCard from "../CodingCard.svelte";

	interface Props {
		class?: string;
		progression: Observation;
		showFeedback: boolean;
		highlightLinkId?: string;
	}

	let { class: classes, progression, showFeedback, highlightLinkId }: Props = $props();

	let gesamtbeurteilung = $derived(getGesamtbeurteilungCoding(progression));

	let progressionDate = $derived(formatDate(progression.effectiveDateTime));
</script>

<div data-tutorial="progression-header" class="flex flex-row items-baseline justify-start gap-2">
	<h3 class="font-xl mt-0">Verlauf</h3>
	<div
		class={[
			"text-muted-foreground",
			highlightLinkId === "6_1_Fd_Ver_datum" ? "ring-ring ring-2" : undefined,
		]}
	>
		{progressionDate}
	</div>
</div>

<div
	class={["grid grid-cols-1 gap-8", showFeedback ? "md:grid-cols-1" : "md:grid-cols-2", classes]}
>
	<div data-tutorial="progression-assessment">
		<CodingCard
			heading="Gesamtbeurteilung"
			coding={gesamtbeurteilung}
			noDataText="Keine Gesamtbeurteilung vorhanden"
			codingDisplay={gesamtbeurteilung && parseGesamtbeurteilung(gesamtbeurteilung)}
			highlight={highlightLinkId === "6_2_Fd_Ver_target"}
		/>
	</div>
</div>
