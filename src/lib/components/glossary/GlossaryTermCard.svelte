<script lang="ts">
	import type { GlossaryTerm } from "$lib/types/glossary";
	import * as m from "$lib/paraglide/messages";

	interface Props {
		term: GlossaryTerm;
	}

	let { term }: Props = $props();
</script>

<article class="border-border bg-card rounded-lg border p-4 shadow-sm">
	<h3 class="text-foreground text-lg font-semibold">{term.term}</h3>
	<p class="text-muted-foreground mt-1 text-sm leading-relaxed">{term.definition}</p>
	{#if term.alternativeTerms && term.alternativeTerms.length > 0}
		<p class="text-muted-foreground mt-2 text-sm">
			<span class="text-foreground font-medium">{m.glossary_also_known_as()}</span>
			{term.alternativeTerms.join(", ")}
		</p>
	{/if}
	{#if term.parentCategory}
		<div class="mt-2">
			<span
				class="bg-muted text-muted-foreground inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
			>
				{term.parentCategory}
			</span>
		</div>
	{/if}
</article>
