<script module lang="ts">
	import * as m from "$lib/paraglide/messages";
	export function getPageTitle() {
		return m.overview_title();
	}
</script>

<script lang="ts">
	import { headPageTitle } from "$lib/utils";
	import { route } from "$lib/ROUTES";
	import { localizeHref } from "$lib/paraglide/runtime";

	import AppLayout from "./_appLayout.svelte";
	import { Button } from "$ui/button";

	import Info from "@lucide/svelte/icons/info";
	import Users from "@lucide/svelte/icons/users";
	import ExternalLink from "@lucide/svelte/icons/external-link";
	import BookOpen from "@lucide/svelte/icons/book-open";
	import ArrowRight from "@lucide/svelte/icons/arrow-right";
	import Shell from "@lucide/svelte/icons/shell";
</script>

<svelte:head>
	<title>{headPageTitle()}</title>
</svelte:head>

<AppLayout>
	{#snippet children()}
		<div class="mx-auto max-w-3xl space-y-8">
			<div>
				<h1>{m.overview_heading()}</h1>
				<p class="text-muted-foreground mt-3 text-lg leading-relaxed">
					{m.overview_intro()}
				</p>
				<p class="bg-muted mt-4 rounded-lg border-l-4 border-blue-500 p-4 font-medium">
					{m.overview_highlight()}
				</p>
				<p class="mt-4 text-lg">{m.overview_intro_closing()}</p>
				<Button href={localizeHref(route("/module/oncology"))} size="lg" class="mt-6">
					<Shell class="size-5" />
					{m.overview_cta_oncology()}
					<ArrowRight class="size-5" />
				</Button>
			</div>

			<div class="bg-card rounded-lg border p-6">
				<div class="mb-3 flex items-center gap-3">
					<div class="bg-primary/10 text-primary rounded-lg p-2">
						<Info class="size-5" />
					</div>
					<h2 class="mt-0">{m.overview_what_title()}</h2>
				</div>
				<p class="text-muted-foreground leading-relaxed">
					{m.overview_what_body()}
				</p>
			</div>

			<div class="bg-card rounded-lg border p-6">
				<div class="mb-3 flex items-center gap-3">
					<div class="bg-primary/10 text-primary rounded-lg p-2">
						<Users class="size-5" />
					</div>
					<h2 class="mt-0">{m.overview_perspective_title()}</h2>
				</div>
				<p class="text-muted-foreground leading-relaxed">
					{m.overview_perspective_body()}
				</p>
				<p class="mt-3 font-medium">
					{m.overview_perspective_highlight()}
				</p>
			</div>

			<div class="bg-card rounded-lg border p-6">
				<div class="mb-3 flex items-center gap-3">
					<div class="bg-primary/10 text-primary rounded-lg p-2">
						<BookOpen class="size-5" />
					</div>
					<h2 class="mt-0">{m.overview_learn_more_title()}</h2>
				</div>
				<p class="text-muted-foreground leading-relaxed">
					{m.overview_learn_more_body()}
				</p>
				<a
					href="https://www.idg-rlp.de/projekte/alle-projekte/inkapp"
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary hover:text-primary/80 mt-4 inline-flex items-center gap-2 font-medium underline underline-offset-4"
				>
					{m.overview_learn_more_link()}
					<ExternalLink class="size-4" />
				</a>
			</div>
		</div>
	{/snippet}
</AppLayout>
