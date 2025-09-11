<script lang="ts">
	import type { Observation } from "fhir/r4";

	import CircleHelp from "@lucide/svelte/icons/circle-help";
	import X from "@lucide/svelte/icons/x";

	import * as Drawer from "$ui/drawer";
	import { buttonVariants } from "$components/ui/button";
	import MetastasenInformation from "./MetastasenInformation.svelte";

	interface Props {
		class?: string;
		fernmetastasen: Observation[];
		showFeedback: boolean;
	}

	let { fernmetastasen, class: classes, showFeedback }: Props = $props();

	let sortedFernmetastasen = $derived(
		[...fernmetastasen].sort((a, b) => {
			const dateA = a.effectiveDateTime ? new Date(a.effectiveDateTime) : new Date(0);
			const dateB = b.effectiveDateTime ? new Date(b.effectiveDateTime) : new Date(0);
			return dateA.getTime() - dateB.getTime();
		})
	);

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

	const locationMap: Record<string, string> = {
		PUL: "Lunge",
		OSS: "Knochen",
		HEP: "Leber",
		BRA: "Gehirn",
		LYM: "Lymphknoten (nicht regional)",
		MAR: "Knochenmark",
		PLE: "Pleura",
		PER: "Peritoneum",
		ADR: "Nebenniere",
		SKI: "Haut",
		OTH: "Sonstige Fernmetastasen",
		GEN: "Generalisierte Metastasierung",
	};
</script>

<div class="flex flex-col items-baseline gap-2 md:flex-row md:gap-4">
	<h3 class="font-xl mt-0">Fernmetastasen</h3>
	<Drawer.NestedRoot>
		<!-- snapPoints={[0.25, 0.5, 0.75, 1]} bind:activeSnapPoint -->
		<Drawer.Trigger class={buttonVariants({ variant: "ghost", size: "sm" })}>
			<CircleHelp /> <span class="underline">Was bedeutet das?</span>
		</Drawer.Trigger>
		<Drawer.Portal>
			<Drawer.Overlay class="bg-black/40" />
			<Drawer.Content
				showDefaultOverlay={false}
				class="border-b-none border-border bg-card fixed right-0 bottom-0 left-0 -mx-px flex max-h-[97%] flex-col rounded-t-[10px] border"
			>
				<div class="mx-auto flex w-full flex-col overflow-y-auto p-4 pt-0 select-text">
					<Drawer.Header>
						<div class="flex flex-row items-end justify-between">
							<Drawer.Title>Was sind Fernmetastasen?</Drawer.Title>
							<Drawer.Close class={buttonVariants({ variant: "outline" })}><X /></Drawer.Close>
						</div>
						<Drawer.Description class="space-y-2 text-justify">
							Fernmetastasen sind Absiedlungen des Tumors in entfernten Organen oder Geweben. Sie
							entstehen, wenn Krebszellen über das Blut- oder Lymphsystem in andere Körperregionen
							gelangen.
						</Drawer.Description>
					</Drawer.Header>
				</div>
			</Drawer.Content>
		</Drawer.Portal>
	</Drawer.NestedRoot>
</div>

<div
	class={["grid grid-cols-1 gap-8", showFeedback ? "md:grid-cols-1" : "md:grid-cols-3", classes]}
>
	{#each sortedFernmetastasen as metastase}
		{@const coding = metastase.valueCodeableConcept?.coding?.find(
			(c) =>
				c.system ===
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-lokalisation-fernmetastasen"
		)}
		{@const dateString = metastase.effectiveDateTime && formatDate(metastase.effectiveDateTime)}
		{#if coding?.code}
			<MetastasenInformation code={coding?.code} display={locationMap[coding?.code]} {dateString} />
		{/if}
	{/each}
</div>
