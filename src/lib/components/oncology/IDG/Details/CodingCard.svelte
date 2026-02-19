<script lang="ts">
	import type { Coding } from "fhir/r4";
	import type { Snippet } from "svelte";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import * as m from "$lib/paraglide/messages";

	interface Props {
		heading: string;
		coding: Coding | undefined;
		codingDisplay?: string;
		text?: string;
		noDataText: string;
		highlight?: boolean;
		children?: Snippet;
	}

	let { heading, coding, codingDisplay, text, noDataText, highlight, children }: Props = $props();

	let element: HTMLElement | null = null;

	$effect(() => {
		if (highlight && element) {
			element.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	});
</script>

<div
	class={[
		"border-border bg-card m-1 flex flex-col gap-2 rounded-lg border p-4 shadow-xs",
		highlight ? "ring-ring ring-2" : "",
	]}
	bind:this={element}
>
	{#if coding}
		<div class="flex items-center justify-start gap-2">
			<h3 class="mt-0 font-medium">{heading}</h3>
		</div>
		<div class="text-muted-foreground mt-1">
			<span>
				{codingDisplay ?? text ?? (coding.display || coding.code)}
			</span>
			<Tooltip.Root delayDuration={300}>
				<Tooltip.Trigger class="cursor-help">
					<span class="bg-muted text-foreground inline-block rounded px-2 py-1 text-sm font-medium">
						{coding.code}
					</span>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>{m.oncology_coding_tooltip()}</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</div>
		{@render children?.()}
	{:else}
		<h3 class="my-0 font-medium">{heading}</h3>
		<p class="text-muted-foreground mt-1">{noDataText}</p>
	{/if}
</div>
