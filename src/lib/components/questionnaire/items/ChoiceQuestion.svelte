<script lang="ts">
	import Check from "@lucide/svelte/icons/check";
	import type { ItemComponentInterface } from "./itemComponentInterface";
	import Button from "$ui/button/button.svelte";
	import type { Coding } from "fhir/r4";

	let {
		item,
		value = undefined,
		onAnswer,
		disabled = false,
	}: ItemComponentInterface<string | Coding> = $props();

	let options = $derived(item.answerOption ?? []);

	let isMultiple = $derived(item.repeats === true);

	function handleSelect(optionValue: string | Coding) {
		if (isMultiple) {
			let selected = Array.isArray(value) ? [...value] : [];
			const idx = selected.findIndex((v) =>
				typeof v === "object"
					? JSON.stringify(v) === JSON.stringify(optionValue)
					: v === optionValue
			);
			if (idx > -1) {
				selected.splice(idx, 1);
			} else {
				selected.push(optionValue);
			}
			onAnswer(selected);
		} else {
			onAnswer(optionValue);
		}
	}

	function codingsMatch(a: string | Coding, b: string | Coding): boolean {
		if (typeof a === "object" && typeof b === "object") {
			return a.code === b.code;
		}
		return a === b;
	}

	function isSelected(optionValue: string | Coding) {
		if (isMultiple) {
			return Array.isArray(value)
				? value.some((v) => codingsMatch(v, optionValue))
				: false;
		}
		if (value === undefined) return false;
		return codingsMatch(value as string | Coding, optionValue);
	}
</script>

<div class="flex flex-col gap-2">
	{#each options as option (option.valueString ?? option.valueCoding?.code ?? option.valueCoding?.display ?? option)}
		{@const optionValue = option.valueString ?? option.valueCoding ?? ""}
		{@const display = option.valueString ?? option.valueCoding?.display ?? optionValue}

		<Button
			variant={isSelected(optionValue) ? "default" : "outline"}
			class="flex h-auto w-full items-center justify-start gap-2 border text-left whitespace-normal"
			onclick={() => handleSelect(optionValue)}
			{disabled}
		>
			<div
				class="border-secondary-foreground flex size-5 flex-shrink-0 items-center justify-center rounded-full border"
			>
				{#if isSelected(optionValue)}
					<Check class="size-4 " />
				{/if}
			</div>
			<span class="leading-relaxed break-words">{display}</span>
		</Button>
	{/each}
</div>
