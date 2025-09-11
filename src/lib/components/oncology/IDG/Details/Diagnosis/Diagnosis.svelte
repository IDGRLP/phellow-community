<script lang="ts">
	import type { Condition } from "fhir/r4";
	import { parseSeitenlokalisation } from "./helper";

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
	{#if icdCoding}
		<div class="border-border bg-card flex flex-col gap-2 rounded-lg border p-4 shadow-xs">
			<div class="flex items-center justify-start gap-2">
				<h3 class="mt-0 font-medium">ICD-10</h3>
				<span
					class="bg-muted text-muted-foreground inline-block rounded px-2 py-1 text-xs font-medium"
				>
					{icdCoding.code}
				</span>
			</div>
			<div class="text-muted-foreground mt-1">{icdCoding.display || icdCoding.code}</div>
			<!-- TODO: Seitenlokalisation -->
			<!-- {#if icdCoding.side}
				<div class="mt-1 text-sm">
					Seite: <span class="text-muted-foreground">{icdCoding.side}</span>
				</div>
			{/if} -->
		</div>
	{/if}

	{#if morphologyCoding}
		<div class="border-border bg-card flex flex-col gap-2 rounded-lg border p-4 shadow-xs">
			<div class="flex items-center justify-start gap-2">
				<h3 class="mt-0 font-medium">Morphologie</h3>
				<span
					class="bg-muted text-muted-foreground inline-block rounded px-2 py-1 text-xs font-medium"
				>
					{morphologyCoding.code}
				</span>
			</div>
			<div class="text-muted-foreground mt-1">
				{morphologyCoding.display || morphologyCoding.code}
			</div>
		</div>
	{/if}
	{#if topographyCoding}
		<div class="border-border bg-card flex flex-col gap-2 rounded-lg border p-4 shadow-xs">
			<div class="flex items-center justify-start gap-2">
				<h3 class="mt-0 font-medium">Topographie</h3>
				<span
					class="bg-muted text-muted-foreground inline-block rounded px-2 py-1 text-xs font-medium"
				>
					{topographyCoding.code}
				</span>
			</div>
			<div class="text-muted-foreground mt-1">
				{topographyCoding.display || topographyCoding.code}
			</div>
		</div>
	{/if}
	{#if seitenlokalisation}
		<div class="border-border bg-card flex flex-col gap-2 rounded-lg border p-4 shadow-xs">
			<div class="flex items-center justify-start gap-2">
				<h3 class="mt-0 font-medium">Seitenlokalisation</h3>
				<span
					class="bg-muted text-muted-foreground inline-block rounded px-2 py-1 text-xs font-medium"
				>
					{seitenlokalisation.code}
				</span>
			</div>
			<div class="text-muted-foreground mt-1">
				{seitenlokalisation.display || parseSeitenlokalisation(seitenlokalisation)}
			</div>
		</div>
	{/if}
</div>
