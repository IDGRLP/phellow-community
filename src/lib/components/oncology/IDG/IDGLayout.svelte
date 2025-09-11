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
	}

	let { showFeedback, cancelFeedback, questionnaire, children, feedback }: Props = $props();

	function onSubmit(response: QuestionnaireResponse): void {
		if (import.meta.env.APP_ENV === "development") {
			return;
		}
		cancelFeedback?.();
	}
</script>

<div class={["grid gap-4", showFeedback ? "h-[94%] grid-cols-2" : "grid-cols-1"]}>
	<div class="flex flex-col gap-8 overflow-y-auto">
		{@render children()}
	</div>
	{#if showFeedback}
		<div class="bg-background flex flex-col justify-between gap-4 overflow-y-auto rounded-lg p-4">
			{#if feedback}
				{@render feedback()}
			{:else if questionnaire}
				<QuestionnaireForm resource={questionnaire} {onSubmit} />
			{/if}
			<Button variant="destructive" onclick={cancelFeedback}>Feedback Abbrechen</Button>
		</div>
	{/if}
</div>
