<script lang="ts">
	interface Props {
		code: string;
		display: string;
		dateString?: string;
	}

	let { code, display, dateString }: Props = $props();
</script>

<div class="border-border bg-card flex flex-col gap-2 rounded-lg border p-4 shadow-xs">
	<div class="flex items-center justify-between">
		<h3 class="mt-0 mb-2 font-medium">Fernmetastase</h3>
		{#if dateString}
			<div title="Entnahmedatum" class="text-muted-foreground">{dateString}</div>
		{/if}
	</div>
	<div class="flex items-center justify-start gap-2">
		<h4 class="font-normal">Lokalisation</h4>
		<span class="bg-muted text-muted-foreground inline-block rounded px-2 py-1 text-xs font-medium">
			{code}
		</span>
	</div>
	<div class="text-muted-foreground">{display}</div>
</div>
