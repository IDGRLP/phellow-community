<script lang="ts">
	interface Props {
		dateString?: string;
		coding?: {
			code?: string;
			display?: string;
		};
		text?: string;
		highlight?: boolean;
	}

	let { dateString, coding, text, highlight }: Props = $props();
</script>

<div
	class={[
		"border-border bg-card m-0.5 flex flex-col gap-2 rounded-lg border p-4 shadow-xs",
		highlight ? "ring-ring ring-2" : undefined,
	]}
>
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
		<div class="text-muted-foreground">
			{text ?? coding?.display ?? coding?.code ?? "Unbekannt"}
		</div>
	</div>
</div>
