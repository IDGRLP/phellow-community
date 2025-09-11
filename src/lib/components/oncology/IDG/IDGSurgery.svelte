<script lang="ts">
	import Histology from "./Details/Histology/Histology.svelte";
	import Surgery from "./Details/Surgery/Surgery.svelte";
	import IDGLayout from "./IDGLayout.svelte";
	import type { Bundle, Observation, Procedure, Questionnaire } from "fhir/r4";

	interface Props {
		procedureId: string;
		bundle: Bundle;
		showFeedback: boolean;
		cancelFeedback?: () => void;
	}

	let { procedureId, bundle, showFeedback, cancelFeedback }: Props = $props();

	let procedure = $derived(
		bundle.entry?.find((entry) => entry.resource?.id === procedureId)?.resource as
			| Procedure
			| undefined
	);

	let histologyObservations = $derived(
		bundle.entry
			?.filter(
				(entry) =>
					entry.resource?.resourceType === "Observation" &&
					entry.resource?.meta?.profile?.some(
						(value) =>
							value ===
							"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-histologie"
					)
			)
			.map((e) => e.resource as Observation)
			.filter((observation) => observation.focus?.some((f) => f.reference?.includes(procedureId)))
	);

	const surgeryFeedback: Questionnaire = {
		resourceType: "Questionnaire",
		status: "active",
		title: "Feedback zur Operation",
		id: "3_Fd",
		item: [],
	};
</script>

<IDGLayout {showFeedback} {cancelFeedback} questionnaire={surgeryFeedback}>
	{#snippet children()}
		{#if procedure}
			<Surgery {procedure} {showFeedback} />
			{#if histologyObservations && histologyObservations.length > 0}
				<Histology showFeedback={false} observations={histologyObservations} />
			{/if}
		{:else}
			<p class="text-muted-foreground">Keine OP-Informationen verfügbar.</p>
		{/if}
	{/snippet}
</IDGLayout>
