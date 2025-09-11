<script lang="ts">
	import type { Bundle, Procedure, Questionnaire } from "fhir/r4";
	import Radiation from "./Details/Radiation/Radiation.svelte";
	import IDGLayout from "./IDGLayout.svelte";

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

	const radiationFeedback: Questionnaire = {
		resourceType: "Questionnaire",
		status: "active",
		title: "Feedback zur Strahlentherapie",
		id: "4_Fd",
		item: [],
	};
</script>

<IDGLayout {showFeedback} {cancelFeedback} questionnaire={radiationFeedback}>
	{#snippet children()}
		{#if procedure}
			<Radiation radiationTherapy={procedure} {showFeedback} />
		{:else}
			<p class="text-muted-foreground">Keine Strahlentherapieinformationen verfügbar.</p>
		{/if}
	{/snippet}
</IDGLayout>
