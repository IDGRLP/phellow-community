<script lang="ts">
	import type { Coding, Condition } from "fhir/r4";
	import { parseSeitenlokalisation } from "./helper";
	import CodingCard from "../CodingCard.svelte";

	interface Props {
		class?: string;
		condition: Condition;
		showFeedback: boolean;
	}

	let { class: classes, condition, showFeedback }: Props = $props();

	const icdCoding = $derived.by(() => {
		return condition.code?.coding?.find(
			(coding) => coding.system === "http://fhir.de/CodeSystem/bfarm/icd-10-gm"
		);
	});

	const morphologyCoding = $derived.by(() => {
		return condition.code?.coding?.find(
			(coding) => coding.system === "http://terminology.hl7.org/CodeSystem/icd-o-3"
		);
	});

	const topographyCoding = $derived.by(() => {
		return condition.bodySite?.[0].coding?.find(
			(coding) => coding.system === "http://terminology.hl7.org/CodeSystem/icd-o-3"
		);
	});
	const seitenlokalisation = $derived.by(() => {
		return condition.bodySite?.[0].coding?.find(
			(coding) =>
				coding.system ===
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-seitenlokalisation"
		);
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

	// Get diagnosis data
	const diagnosisDate = formatDate(condition.recordedDate);
</script>

<div class="flex flex-row items-baseline justify-start gap-2">
	<h3 class="font-xl mt-0">Diagnose</h3>
	<div class="text-muted-foreground">{diagnosisDate}</div>
</div>

<div
	class={["grid grid-cols-1 gap-8", showFeedback ? "md:grid-cols-1" : "md:grid-cols-3", classes]}
>
	<!-- ICD-10 Kodierung -->
	<CodingCard heading="ICD-10" coding={icdCoding} noDataText="Keine ICD-10-Kodierung vorhanden" />

	<!-- Seitenlokalisation -->
	<CodingCard
		heading="Seitenlokalisation"
		coding={seitenlokalisation}
		noDataText="Keine Seitenlokalisation vorhanden"
		codingDisplay={seitenlokalisation && parseSeitenlokalisation(seitenlokalisation)}
	/>

	<!-- Morphologie -->
	<CodingCard
		heading="Morphologie"
		coding={morphologyCoding}
		noDataText="Keine Morphologie-Kodierung vorhanden"
	/>

	<!-- Topographie -->
	<CodingCard
		heading="Topographie"
		coding={topographyCoding}
		noDataText="Keine Topographie-Kodierung vorhanden"
	/>
</div>
