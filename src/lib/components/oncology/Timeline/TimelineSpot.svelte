<script lang="ts">
	import {
		formatDateRange,
		getEventColor,
		getEventIcon,
		getTitleForEvent,
		type Event,
	} from "./timelineHelper";

	interface Props {
		event: Event;
		lane: number;
		rowStart: number;
		rowEnd: number;
		onclick?: () => void;
		tutorialEventType?: string;
		tutorialSpot?: boolean;
	}

	let { event, lane, rowStart, rowEnd, onclick, tutorialEventType, tutorialSpot }: Props = $props();

	const eventTypeMap: Record<string, string> = {
		systemicTherapy: "systemic-therapy",
	};
	function tutorialEventAttr(type?: string): string | undefined {
		if (!type) return undefined;
		return `timeline-event-${eventTypeMap[type] ?? type}`;
	}

	let Icon = $derived(getEventIcon(event.type));
</script>

<button
	class={["group flex cursor-pointer flex-row items-center space-x-2 rounded-lg"]}
	style="grid-column: {lane}/span 1;grid-row-start: {rowStart}; grid-row-end: {rowEnd};"
	data-tutorial-spot={tutorialSpot ? "timeline-spot-first" : undefined}
	data-tutorial={tutorialEventAttr(tutorialEventType)}
	{onclick}
>
	<div
		class={[
			"flex size-8 items-center justify-center rounded-full p-2 group-hover:shadow-md",
			getEventColor(event.type),
		]}
	>
		{#if Icon}
			<Icon class="text-primary-foreground" />
		{/if}
	</div>
	<div class="flex flex-col items-start justify-center">
		<div class="text-foreground text-xl font-semibold">{getTitleForEvent(event)}</div>
		<div class="text-foreground text-sm">
			{formatDateRange(event.startDate, event.endDate)}
		</div>
	</div>
</button>
