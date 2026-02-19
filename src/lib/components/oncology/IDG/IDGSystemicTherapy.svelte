<script lang="ts">
	import type { Bundle, MedicationStatement, Procedure } from "fhir/r4";
	import systemicTherapyFeedback from "./IDGSystemicTherapyFeedback";
	import SystemicTherapy from "./Details/SystemicTherapy/SystemicTherapy.svelte";
	import IDGLayout from "./IDGLayout.svelte";
	import Medication from "./Details/SystemicTherapy/Medication.svelte";

	interface Props {
		procedureId: string;
		bundle: Bundle;
		showFeedback: boolean;
		cancelFeedback?: () => void;
	}

	let { procedureId, bundle, showFeedback, cancelFeedback }: Props = $props();

	let currentItemLinkId = $state<string | undefined>(undefined);

	let procedure = $derived(
		bundle.entry?.find((entry) => entry.resource?.id === procedureId)?.resource as
			| Procedure
			| undefined
	);

	let medications = $derived(
		bundle.entry
			?.filter(
				(entry) =>
					entry.resource?.meta?.profile?.includes(
						"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-systemische-therapie-medikation"
					) && entry.resource?.resourceType === "MedicationStatement"
			)
			.map((entry) => entry.resource as MedicationStatement)
			.filter(
				(medication) =>
					medication.derivedFrom?.some((part) => part.reference === `Procedure/${procedureId}`) ??
					false
			)
	);

	function handleCurrentItemChange(itemLinkId?: string): void {
		currentItemLinkId = itemLinkId;
	}
</script>

<IDGLayout
	{showFeedback}
	{cancelFeedback}
	questionnaire={systemicTherapyFeedback}
	onCurrentItemChange={handleCurrentItemChange}
>
	{#snippet children()}
		{#if procedure}
			<SystemicTherapy {procedure} {showFeedback} highlightLinkId={currentItemLinkId} />
		{:else}
			<p class="text-muted-foreground">Keine Systemische Therapieinformationen verfügbar.</p>
		{/if}

		{#if medications && medications.length > 0}
			<div data-tutorial="systemic-medication">
				<Medication {medications} {showFeedback} highlightLinkId={currentItemLinkId} />
			</div>
		{/if}
	{/snippet}
</IDGLayout>
