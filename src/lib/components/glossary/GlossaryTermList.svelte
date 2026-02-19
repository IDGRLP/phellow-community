<script lang="ts">
	import type { LetterGroup } from "$lib/types/glossary";
	import GlossaryTermCard from "./GlossaryTermCard.svelte";

	interface Props {
		groups: LetterGroup[];
	}

	let { groups }: Props = $props();
</script>

<div class="space-y-8">
	{#each groups as group (group.letter)}
		<section>
			<h2
				id="letter-{group.letter}"
				class="border-border text-foreground scroll-mt-20 border-b pb-2 text-xl font-bold md:scroll-mt-24"
			>
				{group.letter}
			</h2>
			<div class="mt-4 space-y-3">
				{#each group.terms as term (term.term)}
					<GlossaryTermCard {term} />
				{/each}
			</div>
		</section>
	{/each}
</div>
