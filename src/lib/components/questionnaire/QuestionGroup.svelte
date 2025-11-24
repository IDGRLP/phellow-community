<!-- src/lib/components/questionnaire/QuestionGroup.svelte -->
<script lang="ts">
	import type { QuestionnaireItem } from "fhir/r4";
	import QuestionComponent from "./QuestionComponent.svelte";
	import type { QuestionnaireAnswer } from "$lib/stores/questionnaireStore.svelte";
	import { fade, slide } from "svelte/transition";

	interface Props {
		parentItem: QuestionnaireItem;
		items: QuestionnaireItem[];
		answers: Map<string, QuestionnaireAnswer>;
		onAnswer: (linkId: string, value: any) => void;
		isItemEnabled: (linkId: string) => boolean;
		errors: Map<string, string | undefined>;
	}
	let { parentItem, items, answers, onAnswer, isItemEnabled, errors }: Props = $props();
</script>

<div class="space-y-6">
	{#if items.length !== 0 && parentItem.text}
		<h3 class="mt-0">
			{#if parentItem.prefix}
				<span class="mr-1">{parentItem.prefix}</span>
			{/if}
			{parentItem.text}
		</h3>
	{/if}

	<div class="space-y-4">
		{#if items.length === 0}
			{#if isItemEnabled(parentItem.linkId)}
				<div
					out:slide={{ duration: 100, axis: "y" }}
					in:slide={{ duration: 100, delay: 150, axis: "y" }}
				>
					<QuestionComponent
						item={parentItem}
						answer={answers.get(parentItem.linkId)}
						onAnswer={(value) => onAnswer(parentItem.linkId, value)}
						{isItemEnabled}
						globalError={errors.get(parentItem.linkId)}
					/>
				</div>
			{/if}
		{:else}
			{#each items as item (item.linkId)}
				{#if isItemEnabled(item.linkId)}
					<div
						out:slide={{ duration: 100, axis: "y" }}
						in:slide={{ duration: 100, delay: 150, axis: "y" }}
					>
						<QuestionComponent
							{item}
							answer={answers.get(item.linkId)}
							onAnswer={(value) => onAnswer(item.linkId, value)}
							{isItemEnabled}
							globalError={errors.get(item.linkId)}
						/>
					</div>
				{/if}
			{/each}
		{/if}
	</div>
</div>
