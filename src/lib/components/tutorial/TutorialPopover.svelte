<script lang="ts">
	import { Popover as PopoverPrimitive } from "bits-ui";
	import { cn } from "$lib/utils";
	import { tutorialStore } from "$lib/stores/tutorialStore.svelte";
	import * as m from "$lib/paraglide/messages";
	import { Button } from "$ui/button";
	import X from "@lucide/svelte/icons/x";
	import TriangleAlert from "@lucide/svelte/icons/triangle-alert";

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type MessageFn = (...args: any[]) => string;
	const messages = m as unknown as Record<string, MessageFn>;

	let customAnchor = $state<{ getBoundingClientRect: () => DOMRect } | null>(null);

	function centerAnchor() {
		return {
			getBoundingClientRect: () => new DOMRect(window.innerWidth / 2, window.innerHeight / 3, 0, 0),
		};
	}

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

			// Steps with no targetSelector render as a centered notice
			if (!step.targetSelector) {
				customAnchor = centerAnchor();
				return;
			}

			const el = document.querySelector(step.targetSelector);
			if (el) {
				customAnchor = {
					getBoundingClientRect: () => el.getBoundingClientRect(),
				};
			} else {
				customAnchor = centerAnchor();
			}
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

	let isNoticeStep = $derived(!tutorialStore.currentStep?.targetSelector);
</script>

{#if tutorialStore.active && tutorialStore.currentStep && customAnchor}
	<PopoverPrimitive.Root open={true}>
		<PopoverPrimitive.Content
			{customAnchor}
			side={tutorialStore.currentStep.placement}
			sideOffset={12}
			class={cn(
				"bg-popover text-popover-foreground z-[70] rounded-md border p-4 shadow-md outline-hidden",
				"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
				isNoticeStep ? "w-96 border-yellow-500/50 p-6" : "w-80"
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

				{#if isNoticeStep}
					<div class="flex items-start gap-3 pr-6">
						<TriangleAlert class="mt-0.5 size-6 shrink-0 text-yellow-500" />
						<div>
							<h4 class="text-base font-bold">{getTitle()}</h4>
							<p class="text-muted-foreground mt-1 text-sm leading-relaxed">
								{getDescription()}
							</p>
						</div>
					</div>
				{:else}
					<div class="pr-6">
						<h4 class="text-sm font-semibold">{getTitle()}</h4>
						<p class="text-muted-foreground text-sm">{getDescription()}</p>
					</div>
				{/if}

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
