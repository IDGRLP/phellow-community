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
	class={["flex cursor-pointer flex-col rounded-lg p-2 hover:shadow-md", getEventColor(event.type)]}
	style="grid-column: {lane}/span 1;grid-row-start: {rowStart}; grid-row-end: {rowEnd};"
	data-tutorial-bar={tutorialBar ? "timeline-bar-first" : undefined}
	data-tutorial={tutorialEventAttr(tutorialEventType)}
	{onclick}
>
	<div
		class={[
			"flex flex-col items-start justify-start",
			stickyTitle ? "sticky top-[100px]" : undefined,
		]}
	>
		<div class="flex items-start space-x-2">
			{#if Icon}
				<Icon class="text-primary-foreground mt-[6px] size-4 shrink-0" />
			{/if}
			<div class="text-primary-foreground text-xl font-semibold">{getTitleForEvent(event)}</div>
		</div>
		<div class="text-primary-foreground text-sm">
			{formatDateRange(event.startDate, event.endDate)}
		</div>
	</div>
</button>
