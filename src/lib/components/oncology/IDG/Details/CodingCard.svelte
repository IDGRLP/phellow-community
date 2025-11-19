<script lang="ts">
	import type { Coding } from "fhir/r4";

	interface Props {
		heading: string;
		coding: Coding | undefined;
		codingDisplay?: string;
		noDataText: string;
		highlight?: boolean;
	}

	let { heading, coding, codingDisplay, noDataText, highlight }: Props = $props();

	let element: HTMLElement | null = null;

	$effect(() => {
		if (highlight && element) {
			element.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	});
</script>

<div
	class={[
		"border-border bg-card m-0.5 flex flex-col gap-2 rounded-lg border p-4 shadow-xs",
		highlight ? "ring-ring ring-2" : "",
	]}
	bind:this={element}
>
	{#if coding}
		<div class="flex items-center justify-start gap-2">
			<h3 class="mt-0 font-medium">{heading}</h3>
			<span
				class="bg-muted text-muted-foreground inline-block rounded px-2 py-1 text-xs font-medium"
			>
				{coding.code}
			</span>
		</div>
		<div class="text-muted-foreground mt-1">
			{codingDisplay ?? (coding.display || coding.code)}
		</div>
	{:else}
		<h3 class="my-0 font-medium">{heading}</h3>
		<p class="text-muted-foreground mt-1">{noDataText}</p>
	{/if}
</div>
