<script lang="ts">
	import { compareAsc, differenceInCalendarDays, max } from "date-fns";

	import X from "@lucide/svelte/icons/x";

	import { Button, buttonVariants } from "$ui/button";
	import { Checkbox } from "$ui/checkbox";
	import * as Drawer from "$ui/drawer";
	import { Label } from "$ui/label";

	import TimelineBar from "./TimelineBar.svelte";
	import TimelineSpot from "./TimelineSpot.svelte";
	import { computeLanes, formatLegendDate, type Event } from "./timelineHelper";

	import IdgDiagnosis from "../IDG/IDGDiagnosis.svelte";
	import IdgSurgery from "../IDG/IDGSurgery.svelte";
	import IdgProgression from "../IDG/IDGProgression.svelte";
	import IdgSystemicTherapy from "../IDG/IDGSystemicTherapy.svelte";
	import IdgRadiation from "../IDG/IDGRadiation.svelte";
	import IdgTNMDisplay from "../IDG/IDGTNMDisplay.svelte";
	import type { Bundle, QuestionnaireResponse } from "fhir/r4";
	import MessageCircleCheck from "@lucide/svelte/icons/message-circle-check";

	import * as m from "$lib/paraglide/messages";
	import CircleHelp from "@lucide/svelte/icons/circle-help";
	import { tutorialStore } from "$lib/stores/tutorialStore.svelte";
	import { diagnosisTutorial } from "$components/tutorial/steps/diagnosisTutorial";
	import { surgeryTutorial } from "$components/tutorial/steps/surgeryTutorial";
	import { radiationTutorial } from "$components/tutorial/steps/radiationTutorial";
	import { systemicTherapyTutorial } from "$components/tutorial/steps/systemicTherapyTutorial";
	import { progressionTutorial } from "$components/tutorial/steps/progressionTutorial";
	import { tnmTutorial } from "$components/tutorial/steps/tnmTutorial";
	import { cn } from "$lib/utils";

	interface Props {
		events: Event[];
		bundle: Bundle;
		selectedEvent: Event | undefined;
		onSelectEvent: (event: Event | undefined) => void;
	}

	let { events, bundle, selectedEvent, onSelectEvent }: Props = $props();

	let filterEmptyDates = $state(true);
	let showJson = $state(false);
	let showFeedback = $state(false);
	function cancelFeedback() {
		showFeedback = false;
	}

	let showDrawer = $derived(!!selectedEvent);

	let selectedResource = $derived(
		bundle.entry?.find((e) => e.resource?.id === selectedEvent?.resourceId)?.resource
	);
	let selectedSubjectRef = $derived(
		selectedResource?.id && selectedResource?.resourceType
			? `${selectedResource.resourceType}/${selectedResource.id}`
			: undefined
	);
	let existingResponse = $state<QuestionnaireResponse | null>(null);

	$effect(() => {
		const ref = selectedSubjectRef;
		existingResponse = null;
		if (!ref) return;

		const controller = new AbortController();
		fetch(`/fhir/searchQuestionnaireResponse?subject=${encodeURIComponent(ref)}`, {
			signal: controller.signal,
		})
			.then((res) => (res.ok ? res.json() : null))
			.then((bundle) => {
				const entry = bundle?.entry?.[0]?.resource as QuestionnaireResponse | undefined;
				existingResponse = entry ?? null;
			})
			.catch((err) => {
				if (err?.name !== "AbortError") {
					console.error("Failed to fetch existing QuestionnaireResponse", err);
				}
			});

		return () => controller.abort();
	});

	// Sort events by start date
	let sortedEvents = $derived([...events].sort((a, b) => compareAsc(a.startDate, b.startDate)));
	// Compute the lanes to handle overlapping events
	let lanes = $derived(computeLanes(sortedEvents));

	// Track which event types and visual types have been attributed for tutorial targeting
	let attributedTypes = $derived.by(() => {
		const types = new Set<string>();
		let firstSpot = false;
		let firstBar = false;
		const attrs = new Map<
			string,
			{ tutorialEventType?: string; tutorialSpot?: boolean; tutorialBar?: boolean }
		>();

		for (const lane of lanes) {
			for (const event of lane) {
				const a: { tutorialEventType?: string; tutorialSpot?: boolean; tutorialBar?: boolean } = {};
				if (!types.has(event.type)) {
					types.add(event.type);
					a.tutorialEventType = event.type;
				}
				if (event.endDate && !firstBar) {
					firstBar = true;
					a.tutorialBar = true;
				}
				if (!event.endDate && !firstSpot) {
					firstSpot = true;
					a.tutorialSpot = true;
				}
				if (a.tutorialEventType || a.tutorialSpot || a.tutorialBar) {
					attrs.set(event.resourceId, a);
				}
			}
		}
		return attrs;
	});
	// Get the min and max dates for scaling
	let minDate = $derived(sortedEvents.length > 0 ? sortedEvents[0].startDate : new Date());
	let maxDate = $derived(
		sortedEvents.length > 0
			? max(sortedEvents.map((event) => event.endDate ?? event.startDate))
			: new Date()
	);
	// Calculate the total duration in milliseconds
	let totalDuration = $derived(differenceInCalendarDays(maxDate, minDate));

	// Generate an array of dates containing only the first of the month between minDate and maxDate
	let firstOfMonthDates = $derived.by(() => {
		var dates = [];
		let currentDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

		while (currentDate <= maxDate) {
			dates.push(new Date(currentDate));
			currentDate.setMonth(currentDate.getMonth() + 1);
		}

		if (filterEmptyDates) {
			dates = dates.filter((date) =>
				sortedEvents.some(
					(event) =>
						(event.startDate.getFullYear() === date.getFullYear() &&
							event.startDate.getMonth() === date.getMonth()) ||
						(event.endDate &&
							event.endDate.getFullYear() === date.getFullYear() &&
							event.endDate.getMonth() === date.getMonth())
				)
			);
		}

		return dates;
	});
</script>

<div class="flex w-full flex-col items-center">
	<div
		data-tutorial="timeline-legend"
		style="--columns: {lanes.length}; --rows: {totalDuration}; --rowGap: 0.0625rem;"
		class={["timeline-grid", "with-legend"]}
	>
		<div
			class="bg-foreground h-full w-0.5"
			style="grid-column: 2/span 1;grid-row-start: {differenceInCalendarDays(
				firstOfMonthDates[0],
				minDate
			)}; grid-row-end: {totalDuration + 2}; justify-self: center;"
		></div>
		{#each firstOfMonthDates as monthDate}
			{@const rowStart = differenceInCalendarDays(monthDate, minDate) + 1}
			<div
				style="grid-column: 1/span 1;grid-row-start: {rowStart}; grid-row-end: {rowStart +
					1}; justify-self: end;"
			>
				<p>{formatLegendDate(monthDate)}</p>
			</div>
			<div
				class="bg-primary size-3 rounded-full"
				style="grid-column: 2/span 1;grid-row-start: {rowStart}; grid-row-end: {rowStart +
					1}; justify-self: center; align-self: center;"
			></div>
		{/each}

		{#each lanes as lane}
			{#each lane as event}
				{@const rowStart = differenceInCalendarDays(event.startDate, minDate) + 1}
				{@const rowEnd = event.endDate
					? differenceInCalendarDays(event.endDate, minDate)
					: rowStart + 1}
				{@const laneIndex = (event.lane ?? 0) + 3}

				{@const tutorialAttrs = attributedTypes.get(event.resourceId)}

				{#if event.endDate}
					<TimelineBar
						{event}
						lane={laneIndex}
						{rowStart}
						{rowEnd}
						onclick={() => onSelectEvent(event)}
						tutorialEventType={tutorialAttrs?.tutorialEventType}
						tutorialBar={tutorialAttrs?.tutorialBar}
					/>
				{:else}
					<TimelineSpot
						{event}
						lane={laneIndex}
						{rowStart}
						{rowEnd}
						onclick={() => onSelectEvent(event)}
						tutorialEventType={tutorialAttrs?.tutorialEventType}
						tutorialSpot={tutorialAttrs?.tutorialSpot}
					/>
				{/if}
			{/each}
		{/each}
	</div>
</div>

<Drawer.Root
	open={showDrawer}
	onOpenChange={(open) => {
		if (!open) {
			showFeedback = false;
			onSelectEvent(undefined);
		}
	}}
>
	<Drawer.Portal>
		<Drawer.Overlay class="bg-black/40" />
		{#if selectedEvent}
			{@const entry = bundle.entry?.find((e) => e.resource?.id === selectedEvent?.resourceId)}
			<Drawer.Content
				showDefaultOverlay={false}
				class="border-b-none border-border fixed right-0 bottom-0 left-0 -mx-px flex h-full max-h-[95%] flex-col rounded-t-[0.625rem] border"
			>
				<div
					class="mx-auto flex w-full flex-col gap-8 overflow-y-auto p-2 px-4 pt-0 select-text md:p-4 md:px-8"
				>
					<Drawer.Header class="p-0">
						<div class="flex flex-row items-end justify-between">
							<Drawer.Title>
								<div class="flex flex-row gap-4">
									<!-- <div class="flex items-center justify-center space-x-2">
										<Checkbox id="showJson" name="showJson" bind:checked={showJson}></Checkbox>
										<Label
											id="showJson-label"
											for="showJson"
											class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											JSON anzeigen
										</Label>
									</div> -->
									{#if !showFeedback}
										<Button
											onclick={() => (showFeedback = true)}
											class={buttonVariants({ variant: "secondary" })}
										>
											Feedback zu diesem Datensatz geben
										</Button>
									{/if}
									{#if existingResponse}
										<div
											class="bg-muted text-muted-foreground inline-flex items-center gap-2 self-center rounded-full px-3 py-1 text-xs"
										>
											<MessageCircleCheck class="size-3.5" />
											<span>Bereits abgegebenes Feedback gefunden</span>
										</div>
									{/if}
								</div>
							</Drawer.Title>
							<Drawer.Close
								class={[buttonVariants({ variant: "outline" }), "fixed top-8 right-8 size-11"]}
							>
								<X />
							</Drawer.Close>
						</div>
						<!-- <Drawer.Description class="space-y-2 text-justify">
							<p>
								{formatDateRange(
									selectedEvent.startDate,
									selectedEvent?.endDate ?? selectedEvent?.startDate
								)}
							</p>
						</Drawer.Description> -->
					</Drawer.Header>

					{#if selectedEvent.type === "diagnosis"}
						<div class="-mb-6 flex justify-end">
							<Button
								variant="ghost"
								class={cn(
									"hover:border-border cursor-pointer border border-transparent hover:ring"
								)}
								size="sm"
								onclick={() => {
									onSelectEvent(undefined);
									tutorialStore.activate(diagnosisTutorial);
								}}
							>
								<CircleHelp class="size-4" />
								{m.tutorial_diagnosis_button_label()}
							</Button>
						</div>
						<IdgDiagnosis
							{showFeedback}
							{cancelFeedback}
							conditionId={selectedEvent.resourceId}
							{bundle}
						/>
					{:else if selectedEvent.type === "surgery"}
						<div class="-mb-6 flex justify-end">
							<Button
								variant="ghost"
								class={cn(
									"hover:border-border cursor-pointer border border-transparent hover:ring"
								)}
								size="sm"
								onclick={() => {
									onSelectEvent(undefined);
									tutorialStore.activate(surgeryTutorial);
								}}
							>
								<CircleHelp class="size-4" />
								{m.tutorial_surgery_button_label()}
							</Button>
						</div>
						<IdgSurgery
							{showFeedback}
							{cancelFeedback}
							procedureId={selectedEvent.resourceId}
							{bundle}
						/>
					{:else if selectedEvent.type === "radiation"}
						<div class="-mb-6 flex justify-end">
							<Button
								variant="ghost"
								class={cn(
									"hover:border-border cursor-pointer border border-transparent hover:ring"
								)}
								size="sm"
								onclick={() => {
									onSelectEvent(undefined);
									tutorialStore.activate(radiationTutorial);
								}}
							>
								<CircleHelp class="size-4" />
								{m.tutorial_radiation_button_label()}
							</Button>
						</div>
						<IdgRadiation
							{showFeedback}
							{cancelFeedback}
							procedureId={selectedEvent.resourceId}
							{bundle}
						/>
					{:else if selectedEvent.type === "systemicTherapy"}
						<div class="-mb-6 flex justify-end">
							<Button
								variant="ghost"
								class={cn(
									"hover:border-border cursor-pointer border border-transparent hover:ring"
								)}
								size="sm"
								onclick={() => {
									onSelectEvent(undefined);
									tutorialStore.activate(systemicTherapyTutorial);
								}}
							>
								<CircleHelp class="size-4" />
								{m.tutorial_systemic_therapy_button_label()}
							</Button>
						</div>
						<IdgSystemicTherapy
							{showFeedback}
							{cancelFeedback}
							procedureId={selectedEvent.resourceId}
							{bundle}
						/>
					{:else if selectedEvent.type === "progression"}
						<div class="-mb-6 flex justify-end">
							<Button
								variant="ghost"
								class={cn(
									"hover:border-border cursor-pointer border border-transparent hover:ring"
								)}
								size="sm"
								onclick={() => {
									onSelectEvent(undefined);
									tutorialStore.activate(progressionTutorial);
								}}
							>
								<CircleHelp class="size-4" />
								{m.tutorial_progression_button_label()}
							</Button>
						</div>
						<IdgProgression
							{showFeedback}
							{cancelFeedback}
							observationId={selectedEvent.resourceId}
							{bundle}
						/>
					{:else if selectedEvent.type === "tnm"}
						<div class="-mb-6 flex justify-end">
							<Button
								variant="ghost"
								class={cn(
									"hover:border-border cursor-pointer border border-transparent hover:ring"
								)}
								size="sm"
								onclick={() => {
									onSelectEvent(undefined);
									tutorialStore.activate(tnmTutorial);
								}}
							>
								<CircleHelp class="size-4" />
								{m.tutorial_tnm_button_label()}
							</Button>
						</div>
						<IdgTNMDisplay
							{showFeedback}
							{cancelFeedback}
							observationId={selectedEvent.resourceId}
							{bundle}
						/>
					{/if}
					{#if showJson}
						<pre>{JSON.stringify(entry, null, 2)}</pre>
					{/if}
				</div>
			</Drawer.Content>
		{/if}
	</Drawer.Portal>
</Drawer.Root>

<style>
	.timeline-grid {
		display: grid;
		justify-content: center;
		column-gap: 0.5rem;
		row-gap: var(--rowGap);
		grid-auto-rows: min-content;
	}

	.with-legend {
		grid-template-columns: minmax(4rem, 1fr) 1.5rem repeat(var(--columns), minmax(4rem, 2fr));
	}

	.without-legend {
		grid-template-columns: repeat(var(--columns), minmax(4rem, 1fr));
	}
</style>
