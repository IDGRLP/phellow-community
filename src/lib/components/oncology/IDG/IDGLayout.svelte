<script lang="ts">
	import type { Questionnaire, QuestionnaireResponse, Reference } from "fhir/r4";
	import QuestionnaireForm from "$components/questionnaire/QuestionnaireForm.svelte";
	import { Button } from "$ui/button";
	import { type Snippet } from "svelte";

	interface Props {
		showFeedback: boolean;
		cancelFeedback?: () => void;
		questionnaire?: Questionnaire;
		questionnaireResponse?: QuestionnaireResponse;
		children: Snippet;
		feedback?: Snippet;
		onCurrentItemChange?: (itemLinkId?: string) => void;
		subject?: Reference;
		source?: Reference;
	}

	let {
		showFeedback,
		cancelFeedback,
		questionnaire,
		questionnaireResponse,
		children,
		feedback,
		onCurrentItemChange,
		subject,
		source,
	}: Props = $props();

	async function onSubmit(response: QuestionnaireResponse): Promise<void> {
		onCurrentItemChange?.(undefined);

		const existingId = questionnaireResponse?.id;
		const url = existingId
			? `/fhir/questionnaireResponse/${encodeURIComponent(existingId)}`
			: `/fhir/questionnaireResponse`;
		const method = existingId ? "PUT" : "POST";

		try {
			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/fhir+json" },
				body: JSON.stringify(response),
			});
			if (!res.ok) {
				console.error("Failed to submit QuestionnaireResponse", res.status, await res.text());
				return;
			}
		} catch (err) {
			console.error("Failed to submit QuestionnaireResponse", err);
			return;
		}

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
				<QuestionnaireForm
					resource={questionnaire}
					{questionnaireResponse}
					{onSubmit}
					{onCurrentItemChange}
					{subject}
					{source}
				/>
			{/if}
			<Button variant="destructive" onclick={onCancelFeedback}>Feedback Abbrechen</Button>
		</div>
	{/if}
</div>
