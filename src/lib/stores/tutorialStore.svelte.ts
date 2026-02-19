import { goto } from "$app/navigation";
import type { TutorialSequence, TutorialStep } from "$lib/types/tutorial";

export function createTutorialStore() {
	let active = $state(false);
	let currentStepIndex = $state(0);
	let sequence = $state<TutorialSequence | null>(null);
	let savedUrl = $state("");

	const currentStep: TutorialStep | null = $derived(
		sequence ? (sequence.steps[currentStepIndex] ?? null) : null
	);
	const totalSteps: number = $derived(sequence ? sequence.steps.length : 0);
	const isFirstStep: boolean = $derived(currentStepIndex === 0);
	const isLastStep: boolean = $derived(totalSteps > 0 && currentStepIndex === totalSteps - 1);
	const progress: number = $derived(totalSteps > 0 ? (currentStepIndex + 1) / totalSteps : 0);

	function deactivate() {
		const url = savedUrl;
		active = false;
		sequence = null;
		currentStepIndex = 0;
		savedUrl = "";
		if (url) {
			goto(url);
		}
	}

	async function activate(seq: TutorialSequence) {
		if (active) return;

		savedUrl = window.location.pathname + window.location.search;
		sequence = seq;

		const currentUrl = window.location.pathname + window.location.search;
		if (currentUrl !== seq.prerequisiteUrl) {
			await goto(seq.prerequisiteUrl);
		}

		if (seq.setup) {
			await seq.setup();
		}

		active = true;
		currentStepIndex = 0;
	}

	function next() {
		if (!active || !sequence) return;
		if (isLastStep) {
			deactivate();
		} else {
			currentStepIndex++;
		}
	}

	function previous() {
		if (!active || isFirstStep) return;
		currentStepIndex--;
	}

	function cancel() {
		if (!active) return;
		deactivate();
	}

	return {
		get active() {
			return active;
		},
		get currentStepIndex() {
			return currentStepIndex;
		},
		get sequence() {
			return sequence;
		},
		get currentStep() {
			return currentStep;
		},
		get totalSteps() {
			return totalSteps;
		},
		get isFirstStep() {
			return isFirstStep;
		},
		get isLastStep() {
			return isLastStep;
		},
		get progress() {
			return progress;
		},
		activate,
		next,
		previous,
		cancel,
	};
}

export const tutorialStore = createTutorialStore();
