<script lang="ts">
	interface Props {
		dateString?: string;
		coding?: {
			code?: string;
			display?: string;
		};
	}

	let { dateString, coding }: Props = $props();
</script>

<div class="border-border bg-card flex flex-col gap-2 rounded-lg border p-4 shadow-xs">
	<div class="flex items-center justify-between">
		<h3 class="mt-0 mb-2 font-medium">Gewebe-Probe</h3>
		<div title="Entnahmedatum" class="text-muted-foreground">{dateString || "Unbekannt"}</div>
	</div>
	<div>
		<div class="flex items-center justify-start gap-2">
			<h4 class="font-normal">Histologischer Befund</h4>
			<span
				class="bg-muted text-muted-foreground inline-block rounded px-2 py-1 text-xs font-medium"
			>
				{coding?.code}
			</span>
		</div>
		<div class="text-muted-foreground">{coding?.display || coding?.code || "Unbekannt"}</div>
	</div>
</div>
