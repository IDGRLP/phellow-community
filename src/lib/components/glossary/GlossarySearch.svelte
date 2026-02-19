<script lang="ts">
	import Fuse from "fuse.js";
	import type { GlossaryTerm } from "$lib/types/glossary";
	import * as m from "$lib/paraglide/messages";
	import { Input } from "$ui/input";
	import Search from "@lucide/svelte/icons/search";

	interface Props {
		terms: GlossaryTerm[];
		onfilter: (filtered: GlossaryTerm[], isSearching: boolean) => void;
	}

	let { terms, onfilter }: Props = $props();

	let query = $state("");

	const fuse = $derived(
		new Fuse(terms, {
			keys: [
				{ name: "term", weight: 1.0 },
				{ name: "alternativeTerms", weight: 0.8 },
				{ name: "keywords", weight: 0.6 },
				{ name: "parentCategory", weight: 0.4 },
			],
			threshold: 0.4,
			includeScore: true,
		})
	);

	function handleInput() {
		if (query.trim() === "") {
			onfilter(terms, false);
		} else {
			const results = fuse.search(query);
			onfilter(
				results.map((r) => r.item),
				true
			);
		}
	}
</script>

<div class="relative">
	<label for="glossary-search" class="sr-only">{m.glossary_search_label()}</label>
	<Search
		class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
		aria-hidden="true"
	/>
	<Input
		id="glossary-search"
		type="search"
		placeholder={m.glossary_search_placeholder()}
		class="pl-10"
		bind:value={query}
		oninput={handleInput}
	/>
</div>
