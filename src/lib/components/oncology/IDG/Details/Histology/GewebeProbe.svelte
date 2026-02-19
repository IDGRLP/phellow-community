<script lang="ts">
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import * as m from "$lib/paraglide/messages";

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
	{#if coding?.code}
		<div>
			<div class="flex items-center justify-start gap-2">
				<h4 class="font-normal">Histologischer Befund</h4>
			</div>
			<div class="text-muted-foreground">
				<span>
					{text ?? coding?.display ?? coding?.code ?? "Unbekannt"}
				</span>
				<Tooltip.Root delayDuration={300}>
					<Tooltip.Trigger class="cursor-help">
						<span
							class="bg-muted text-foreground inline-block rounded px-2 py-1 text-sm font-medium"
						>
							{coding?.code}
						</span>
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>{m.oncology_coding_tooltip()}</p>
					</Tooltip.Content>
				</Tooltip.Root>
			</div>
		</div>
	{/if}
</div>
