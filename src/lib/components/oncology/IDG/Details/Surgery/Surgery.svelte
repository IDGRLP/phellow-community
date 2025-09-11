<script lang="ts">
	import type { Procedure } from "fhir/r4";

	import { parseResidualstatus } from "./helper";

	interface Props {
		class?: string;
		procedure: Procedure;
		showFeedback: boolean;
	}

	let { class: classes, procedure, showFeedback }: Props = $props();

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

	const performedDate = formatDate(procedure.performedDateTime);

	const residualstatusCoding = $derived.by(() => {
		return procedure.outcome?.coding?.find(
			(coding) =>
				coding.system ===
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-residualstatus-lokal"
		);
	});
</script>

<div class="flex flex-row items-baseline justify-start gap-2">
	<h3 class="font-xl mt-0">Operation</h3>
	<div class="text-muted-foreground">{performedDate}</div>
</div>

<div
	class={["grid grid-cols-1 gap-8", showFeedback ? "md:grid-cols-1" : "md:grid-cols-2", classes]}
>
	{#if residualstatusCoding}
		<div class="border-border bg-card flex flex-col gap-2 rounded-lg border p-4 shadow-xs">
			<div class="flex items-center justify-start gap-2">
				<h3 class="mt-0 font-medium">Residualstatus</h3>
				<span
					class="bg-muted text-muted-foreground inline-block rounded px-2 py-1 text-xs font-medium"
				>
					{residualstatusCoding.code}
				</span>
			</div>
			<div class="text-muted-foreground mt-1">
				{residualstatusCoding.display || parseResidualstatus(residualstatusCoding)}
			</div>
		</div>
	{/if}
</div>
