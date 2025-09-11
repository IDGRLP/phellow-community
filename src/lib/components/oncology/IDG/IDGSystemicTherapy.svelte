<script lang="ts">
	import type { Bundle, Procedure, Questionnaire } from "fhir/r4";
	import SystemicTherapy from "./Details/SystemicTherapy/SystemicTherapy.svelte";
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

	const systemicTherapyFeedback: Questionnaire = {
		resourceType: "Questionnaire",
		status: "active",
		title: "Feedback zur Systemischen Therapie",
		id: "5_Fd",
		item: [],
	};
</script>

<IDGLayout {showFeedback} {cancelFeedback} questionnaire={systemicTherapyFeedback}>
	{#snippet children()}
		{#if procedure}
			<SystemicTherapy {procedure} {showFeedback} />
		{:else}
			<p class="text-muted-foreground">Keine Systemische Therapieinformationen verfügbar.</p>
		{/if}
	{/snippet}
</IDGLayout>
