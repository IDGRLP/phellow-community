<script lang="ts">
	import Histology from "./Details/Histology/Histology.svelte";
	import Surgery from "./Details/Surgery/Surgery.svelte";
	import IDGLayout from "./IDGLayout.svelte";
	import type { Bundle, Observation, Procedure } from "fhir/r4";
	import surgeryFeedback from "./IDGSurgeryFeedback";

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

	let subjectReference = $derived(
		procedure?.id ? { reference: `Procedure/${procedure.id}` } : undefined
	);
	let sourceReference = $derived(procedure?.subject);

	let currentItemLinkId = $state<string | undefined>(undefined);

	function handleCurrentItemChange(itemLinkId?: string): void {
		currentItemLinkId = itemLinkId;
	}

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
</script>

<IDGLayout
	{showFeedback}
	{cancelFeedback}
	questionnaire={surgeryFeedback}
	onCurrentItemChange={handleCurrentItemChange}
	subject={subjectReference}
	source={sourceReference}
>
	{#snippet children()}
		{#if procedure}
			<Surgery {procedure} {showFeedback} highlightLinkId={currentItemLinkId} />
			{#if histologyObservations && histologyObservations.length > 0}
				<div data-tutorial="surgery-histology">
					<Histology
						showFeedback={false}
						observations={histologyObservations}
						highlightLinkId={currentItemLinkId}
					/>
				</div>
			{:else}
				<div data-tutorial="surgery-histology" class="m-0.5">
					<h3 class="my-0 text-xl">Histologie</h3>
					<p
						class={[
							"text-muted-foreground",
							currentItemLinkId === "3_3_Fd_OP_Histologie" ? "ring-ring ring-2" : undefined,
						]}
					>
						Keine Histologieinformationen verfügbar.
					</p>
				</div>
			{/if}
		{:else}
			<p class="text-muted-foreground">Keine OP-Informationen verfügbar.</p>
		{/if}
	{/snippet}
</IDGLayout>
