<!-- src/lib/components/questionnaire/items/BooleanQuestion.svelte -->
<script lang="ts">
	import * as m from "$lib/paraglide/messages";

	import type { ItemComponentInterface } from "./itemComponentInterface";
	import { Button } from "$ui/button";

	interface Props extends ItemComponentInterface<boolean> {}

	let { item, value = undefined, onAnswer }: Props = $props();
</script>

<div class="flex gap-4">
	<Button
		data-testid="boolean-yes"
		data-selected={value === true}
		class={[
			value === true
				? "bg-primary text-primary-foreground"
				: "bg-secondary text-secondary-foreground",
		]}
		onclick={() => onAnswer(true)}
	>
		{m.questionnaire_boolean_yes()}
	</Button>
	<Button
		data-testid="boolean-no"
		data-selected={value === false}
		class={[
			value === false
				? "bg-primary text-primary-foreground"
				: "bg-secondary text-secondary-foreground",
		]}
		onclick={() => onAnswer(false)}
	>
		{m.questionnaire_boolean_no()}
	</Button>
</div>
