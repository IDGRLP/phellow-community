<script lang="ts">
	import { Popover as PopoverPrimitive } from "bits-ui";
	import { cn } from "$lib/utils";
	import { tutorialStore } from "$lib/stores/tutorialStore.svelte";
	import * as m from "$lib/paraglide/messages";
	import { Button } from "$ui/button";
	import X from "@lucide/svelte/icons/x";

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type MessageFn = (...args: any[]) => string;
	const messages = m as unknown as Record<string, MessageFn>;

	let customAnchor = $state<{ getBoundingClientRect: () => DOMRect } | null>(null);

	$effect(() => {
		if (!tutorialStore.active || !tutorialStore.currentStep) {
			customAnchor = null;
			return;
		}

		// Re-run when step changes
		tutorialStore.currentStepIndex;

		function updateAnchor() {
			const step = tutorialStore.currentStep;
			if (!step) return;
			const el = document.querySelector(step.targetSelector);
			if (!el) return;
			customAnchor = {
				getBoundingClientRect: () => el.getBoundingClientRect(),
			};
		}

		const timeout = setTimeout(updateAnchor, 60);
		return () => clearTimeout(timeout);
	});

	function getTitle(): string {
		const step = tutorialStore.currentStep;
		if (!step) return "";
		return messages[step.titleKey]?.() ?? step.titleKey;
	}

	function getDescription(): string {
		const step = tutorialStore.currentStep;
		if (!step) return "";
		return messages[step.descriptionKey]?.() ?? step.descriptionKey;
	}
</script>

{#if tutorialStore.active && tutorialStore.currentStep && customAnchor}
	<PopoverPrimitive.Root open={true}>
		<PopoverPrimitive.Content
			{customAnchor}
			side={tutorialStore.currentStep.placement}
			sideOffset={12}
			class={cn(
				"bg-popover text-popover-foreground z-[70] w-80 rounded-md border p-4 shadow-md outline-hidden",
				"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
			)}
		>
			<div class="relative flex flex-col gap-3">
				<button
					class="absolute -top-1 -right-1 rounded-sm p-1 opacity-70 hover:opacity-100"
					onclick={() => tutorialStore.cancel()}
				>
					<X class="size-4" />
					<span class="sr-only">{m.tutorial_nav_cancel()}</span>
				</button>

				<div class="pr-6">
					<h4 class="text-sm font-semibold">{getTitle()}</h4>
					<p class="text-muted-foreground text-sm">{getDescription()}</p>
				</div>

				<p class="text-muted-foreground text-xs">
					{m.tutorial_progress({
						current: String(tutorialStore.currentStepIndex + 1),
						total: String(tutorialStore.totalSteps),
					})}
				</p>

				<div class="flex justify-between gap-2">
					{#if !tutorialStore.isFirstStep}
						<Button variant="outline" size="sm" onclick={() => tutorialStore.previous()}>
							{m.tutorial_nav_previous()}
						</Button>
					{:else}
						<div></div>
					{/if}
					<Button size="sm" onclick={() => tutorialStore.next()}>
						{#if tutorialStore.isLastStep}
							{m.tutorial_nav_finish()}
						{:else}
							{m.tutorial_nav_next()}
						{/if}
					</Button>
				</div>
			</div>
		</PopoverPrimitive.Content>
	</PopoverPrimitive.Root>
{/if}
