<script lang="ts">
	import * as m from "$lib/paraglide/messages";

	interface Props {
		activeLetters: Set<string>;
	}

	let { activeLetters }: Props = $props();

	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
</script>

<nav aria-label={m.glossary_letter_nav_label()}>
	<!-- Desktop: vertical sticky sidebar -->
	<div class="hidden md:sticky md:top-24 md:flex md:flex-col md:items-center md:gap-0.5">
		{#each alphabet as letter}
			{#if activeLetters.has(letter)}
				<a
					href="#letter-{letter}"
					class="text-foreground hover:bg-accent hover:text-accent-foreground flex size-7 items-center justify-center rounded text-sm font-medium transition-colors"
				>
					{letter}
				</a>
			{:else}
				<span
					class="text-muted-foreground/40 flex size-7 items-center justify-center text-sm"
					aria-disabled="true"
				>
					{letter}
				</span>
			{/if}
		{/each}
	</div>

	<!-- Mobile: horizontal scrollable row -->
	<div class="flex gap-1 overflow-x-auto pb-2 md:hidden">
		{#each alphabet as letter}
			{#if activeLetters.has(letter)}
				<a
					href="#letter-{letter}"
					class="text-foreground hover:bg-accent hover:text-accent-foreground flex size-8 shrink-0 items-center justify-center rounded text-sm font-medium transition-colors"
				>
					{letter}
				</a>
			{:else}
				<span
					class="text-muted-foreground/40 flex size-8 shrink-0 items-center justify-center text-sm"
					aria-disabled="true"
				>
					{letter}
				</span>
			{/if}
		{/each}
	</div>
</nav>
