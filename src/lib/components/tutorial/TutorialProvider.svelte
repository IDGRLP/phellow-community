<script lang="ts">
	import { tutorialStore } from "$lib/stores/tutorialStore.svelte";
	import * as m from "$lib/paraglide/messages";
	import TutorialOverlay from "./TutorialOverlay.svelte";
	import TutorialPopover from "./TutorialPopover.svelte";

	let loadError = $state(false);
	let loadTimeout: ReturnType<typeof setTimeout> | undefined;

	// T014: Handle demo dataset load failure — wait up to 5s for first step's target
	$effect(() => {
		if (!tutorialStore.active || !tutorialStore.currentStep) {
			loadError = false;
			return;
		}

		// Only check on initial activation (step 0)
		if (tutorialStore.currentStepIndex !== 0) return;

		const step = tutorialStore.currentStep;
		const el = document.querySelector(step.targetSelector);
		if (el) {
			loadError = false;
			return;
		}

		// Element not found yet — wait up to 5 seconds
		const observer = new MutationObserver(() => {
			if (document.querySelector(step.targetSelector)) {
				observer.disconnect();
				clearTimeout(loadTimeout);
				loadError = false;
			}
		});

		observer.observe(document.body, { childList: true, subtree: true });

		loadTimeout = setTimeout(() => {
			observer.disconnect();
			if (!document.querySelector(step.targetSelector)) {
				loadError = true;
				tutorialStore.cancel();
			}
		}, 5000);

		return () => {
			observer.disconnect();
			clearTimeout(loadTimeout);
		};
	});

	// T019: Escape key to cancel
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape" && tutorialStore.active) {
			tutorialStore.cancel();
		}
	}

	// T022: Handle browser back/forward during tutorial
	function handlePopstate() {
		if (tutorialStore.active) {
			tutorialStore.cancel();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} onpopstate={handlePopstate} />

{#if tutorialStore.active}
	<TutorialOverlay />
	<!-- Interaction-blocking layer: captures all pointer events on app elements -->
	<div class="fixed inset-0 z-[65]"></div>
	<div class="pointer-events-auto z-[70]">
		<TutorialPopover />
	</div>
{/if}

{#if loadError}
	<div
		class="bg-destructive text-destructive-foreground fixed bottom-4 left-1/2 z-[80] -translate-x-1/2 rounded-md px-4 py-2 shadow-lg"
	>
		{m.tutorial_error_load_failed()}
	</div>
{/if}
