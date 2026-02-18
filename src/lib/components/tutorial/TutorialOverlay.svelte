<script lang="ts">
	import { tutorialStore } from "$lib/stores/tutorialStore.svelte";
	import { onDestroy } from "svelte";

	let clipPath = $state("none");
	let resizeObserver: ResizeObserver | undefined;

	function computeClipPath() {
		const step = tutorialStore.currentStep;
		if (!step) {
			clipPath = "none";
			return;
		}

		if (!step.targetSelector) {
			// No target — full dim, no cutout
			clipPath = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
			return;
		}

		const el = document.querySelector(step.targetSelector);
		if (!el) {
			clipPath = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
			return;
		}

		const rect = el.getBoundingClientRect();
		const pad = step.padding ?? 8;
		const vw = window.innerWidth;
		const vh = window.innerHeight;

		const left = ((rect.left - pad) / vw) * 100;
		const top = ((rect.top - pad) / vh) * 100;
		const right = ((rect.right + pad) / vw) * 100;
		const bottom = ((rect.bottom + pad) / vh) * 100;

		// Polygon with a rectangular cutout (clockwise outer, counter-clockwise inner)
		clipPath = `polygon(
			0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
			${left}% ${top}%, ${left}% ${bottom}%, ${right}% ${bottom}%, ${right}% ${top}%, ${left}% ${top}%
		)`;
	}

	$effect(() => {
		if (!tutorialStore.active) return;

		// Re-run when currentStepIndex changes
		tutorialStore.currentStepIndex;

		// Small delay to ensure DOM is ready after step transition
		const timeout = setTimeout(computeClipPath, 50);

		resizeObserver?.disconnect();
		resizeObserver = new ResizeObserver(computeClipPath);
		resizeObserver.observe(document.body);

		window.addEventListener("scroll", computeClipPath, true);

		return () => {
			clearTimeout(timeout);
			resizeObserver?.disconnect();
			window.removeEventListener("scroll", computeClipPath, true);
		};
	});

	onDestroy(() => {
		resizeObserver?.disconnect();
	});
</script>

{#if tutorialStore.active}
	<div
		class="fixed inset-0 z-[60] bg-black/50 transition-[clip-path] duration-300"
		style="clip-path: {clipPath};"
	></div>
{/if}
