<script module lang="ts">
	export function getPageTitle() {
		return m.module_oncology();
	}
</script>

<script lang="ts">
	import AppLayout from "../../_appLayout.svelte";
	import type { PageData } from "./$types";
	import * as m from "$lib/paraglide/messages";
	import Timeline from "$components/oncology/Timeline/Timeline.svelte";
	import { Button } from "$components/ui/button";
	import { page } from "$app/state";

	let { data }: { data: PageData } = $props();

	const availableSampleFiles = [
		{ title: "Brust C50", file: "InKaPP_Brust_C50.json" },
		{ title: "Darm C18", file: "InKaPP_Darm_C18.json" },
		{ title: "Lunge C34", file: "InKaPP_Lunge_C34.json" },
		{ title: "Prostata C61", file: "InKaPP_Prostata_C61.json" },
	];

	function buttonIsActive(file: string) {
		const currentFile = page.url.searchParams.get("file");
		if (!currentFile) return file === "InKaPP_Lunge_C34.json";
		return currentFile === file;
	}
</script>

<AppLayout title={getPageTitle()}>
	{#snippet children()}
		<p class="text-muted-foreground leading-7 tracking-tight">
			<strong>Hinweis:</strong> Diese Seite befindet sich noch in der Entwicklung und die dargestellten
			Daten können Fehler enthalten. Für verlässliche und individuelle Informationen wenden Sie sich
			bitte an Ihre behandelnde Fachperson.
		</p>
		<div class="flex flex-row gap-4">
			{#each availableSampleFiles as item (item.file)}
				<Button
					href="/module/oncology?file={item.file}"
					variant="secondary"
					class={[
						buttonIsActive(item.file)
							? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
							: "hover:ring-1",
					]}>{item.title}</Button
				>
			{/each}
		</div>
		<Timeline events={data.events} bundle={data.bundle} />
	{/snippet}
</AppLayout>
