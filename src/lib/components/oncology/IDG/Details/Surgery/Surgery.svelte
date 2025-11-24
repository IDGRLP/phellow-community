<script lang="ts">
	import type { Procedure } from "fhir/r4";

	import { parseResidualstatus } from "./helper";
	import CodingCard from "../CodingCard.svelte";

	interface Props {
		class?: string;
		procedure: Procedure;
		showFeedback: boolean;
		highlightLinkId?: string;
	}

	let { class: classes, procedure, showFeedback, highlightLinkId }: Props = $props();

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
	<div
		class={[
			"text-muted-foreground",
			highlightLinkId === "3_1_Fd_OP_datum" ? "ring-ring ring-2" : undefined,
		]}
	>
		{performedDate}
	</div>
</div>

<div
	class={["grid grid-cols-1 gap-8", showFeedback ? "md:grid-cols-1" : "md:grid-cols-2", classes]}
>
	<!-- Residualstatus -->
	<CodingCard
		heading="Residualstatus"
		coding={residualstatusCoding}
		noDataText="Kein Residualstatus vorhanden"
		codingDisplay={residualstatusCoding && parseResidualstatus(residualstatusCoding)}
		highlight={highlightLinkId === "3_2_Fd_OP_residual"}
	/>
</div>
