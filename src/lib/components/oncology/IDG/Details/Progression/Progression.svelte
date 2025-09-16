<script lang="ts">
	import type { Observation } from "fhir/r4";

	import { formatDate, getGesamtbeurteilungCoding, parseGesamtbeurteilung } from "./helper";
	import CodingCard from "../CodingCard.svelte";

	interface Props {
		class?: string;
		progression: Observation;
		showFeedback: boolean;
	}

	let { class: classes, progression, showFeedback }: Props = $props();

	let gesamtbeurteilung = $derived(getGesamtbeurteilungCoding(progression));

	let progressionDate = $derived(formatDate(progression.effectiveDateTime));
</script>

<div class="flex flex-row items-baseline justify-start gap-2">
	<h3 class="font-xl mt-0">Verlauf</h3>
	<div class="text-muted-foreground">{progressionDate}</div>
</div>

<div
	class={["grid grid-cols-1 gap-8", showFeedback ? "md:grid-cols-1" : "md:grid-cols-2", classes]}
>
	<CodingCard
		heading="Gesamtbeurteilung"
		coding={gesamtbeurteilung}
		noDataText="Keine Gesamtbeurteilung vorhanden"
		codingDisplay={gesamtbeurteilung && parseGesamtbeurteilung(gesamtbeurteilung)}
	/>
</div>
