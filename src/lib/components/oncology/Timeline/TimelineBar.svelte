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
		stickyTitle?: boolean;
		tutorialEventType?: string;
		tutorialBar?: boolean;
	}

	let {
		event,
		lane,
		rowStart,
		rowEnd,
		onclick,
		stickyTitle = false,
		tutorialEventType,
		tutorialBar,
	}: Props = $props();

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
	class={[
		"focus-visible:ring-ring flex cursor-pointer flex-col rounded-lg border border-black/10 p-2 shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-1",
		getEventColor(event.type),
	]}
	style="grid-column: {lane}/span 1;grid-row-start: {rowStart}; grid-row-end: {rowEnd};"
	data-tutorial-bar={tutorialBar ? "timeline-bar-first" : undefined}
	data-tutorial={tutorialEventAttr(tutorialEventType)}
	{onclick}
>
	<div
		class={[
			"flex flex-col items-start justify-start",
			stickyTitle ? "sticky top-[6.25rem]" : undefined,
		]}
	>
		<div class="flex items-start space-x-2">
			{#if Icon}
				<Icon class="text-foreground mt-[0.375rem] size-4 shrink-0" />
			{/if}
			<div class="text-foreground text-xl font-semibold underline">{getTitleForEvent(event)}</div>
		</div>
		<div class="text-foreground text-sm">
			{formatDateRange(event.startDate, event.endDate)}
		</div>
	</div>
</button>
