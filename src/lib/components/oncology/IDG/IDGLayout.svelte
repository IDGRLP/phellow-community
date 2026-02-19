<script lang="ts">
	import type { Questionnaire, QuestionnaireResponse } from "fhir/r4";
	import QuestionnaireForm from "$components/questionnaire/QuestionnaireForm.svelte";
	import { Button } from "$ui/button";
	import { type Snippet } from "svelte";

	interface Props {
		showFeedback: boolean;
		cancelFeedback?: () => void;
		questionnaire?: Questionnaire;
		children: Snippet;
		feedback?: Snippet;
		onCurrentItemChange?: (itemLinkId?: string) => void;
	}

	let {
		showFeedback,
		cancelFeedback,
		questionnaire,
		children,
		feedback,
		onCurrentItemChange,
	}: Props = $props();

	function onSubmit(response: QuestionnaireResponse): void {
		onCurrentItemChange?.(undefined);
		if (import.meta.env.DEV) {
			return;
		}
		cancelFeedback?.();
	}

	function onCancelFeedback(): void {
		onCurrentItemChange?.(undefined);
		cancelFeedback?.();
	}
</script>

<div class={["grid gap-4", showFeedback ? "h-[94%] grid-cols-1 lg:grid-cols-2" : "grid-cols-1"]}>
	<div class="flex flex-col gap-8 overflow-y-auto">
		{@render children()}
	</div>
	{#if showFeedback}
		<div
			class="bg-card border-border flex flex-col justify-between gap-4 overflow-y-auto rounded-lg border p-4 shadow-xs"
		>
			{#if feedback}
				{@render feedback()}
			{:else if questionnaire}
				<QuestionnaireForm resource={questionnaire} {onSubmit} {onCurrentItemChange} />
			{/if}
			<Button variant="destructive" onclick={onCancelFeedback}>Feedback Abbrechen</Button>
		</div>
	{/if}
</div>
