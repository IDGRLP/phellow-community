<script module lang="ts">
	export function getPageTitle() {
		return m.glossary_title();
	}
</script>

<script lang="ts">
	import { headPageTitle } from "$lib/utils";
	import * as m from "$lib/paraglide/messages";

	import { groupTermsByLetter } from "$lib/types/glossary";
	import glossaryData from "$lib/data/glossary.json";
	import type { GlossaryTerm } from "$lib/types/glossary";

	import AppLayout from "../_appLayout.svelte";
	import GlossaryTermList from "$components/glossary/GlossaryTermList.svelte";
	import GlossaryTermCard from "$components/glossary/GlossaryTermCard.svelte";
	import GlossarySearch from "$components/glossary/GlossarySearch.svelte";
	import GlossaryLetterNav from "$components/glossary/GlossaryLetterNav.svelte";

	const allTerms: GlossaryTerm[] = glossaryData;
	let filteredTerms = $state<GlossaryTerm[]>(allTerms);
	let isSearching = $state(false);
	const groups = $derived(groupTermsByLetter(filteredTerms));
	const activeLetters = $derived(new Set(groups.map((g) => g.letter)));
</script>

<svelte:head>
	<title>{headPageTitle(m.glossary_title())}</title>
</svelte:head>

<AppLayout title={m.glossary_title()}>
	{#snippet children()}
		<div class="space-y-6">
			<GlossarySearch
				terms={allTerms}
				onfilter={(filtered, searching) => {
					filteredTerms = filtered;
					isSearching = searching;
				}}
			/>

			{#if filteredTerms.length === 0}
				<p class="text-muted-foreground py-8 text-center">{m.glossary_no_results()}</p>
			{:else if isSearching}
				<!-- Relevance-ranked flat list when searching -->
				<div class="space-y-3">
					{#each filteredTerms as term (term.term)}
						<GlossaryTermCard {term} />
					{/each}
				</div>
			{:else}
				<!-- Alphabetical grouping when browsing -->
				<!-- Mobile letter nav -->
				<div class="md:hidden">
					<GlossaryLetterNav {activeLetters} />
				</div>

				<div class="flex gap-6">
					<div class="min-w-0 flex-1">
						<GlossaryTermList {groups} />
					</div>
					<!-- Desktop letter nav -->
					<div class="hidden md:block">
						<GlossaryLetterNav {activeLetters} />
					</div>
				</div>
			{/if}
		</div>
	{/snippet}
</AppLayout>
