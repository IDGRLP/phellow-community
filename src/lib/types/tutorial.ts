export interface TutorialStep {
	id: string;
	/** CSS selector for the highlighted element. Omit or leave empty for a centered notice (no highlight). */
	targetSelector?: string;
	titleKey: string;
	descriptionKey: string;
	placement: "top" | "bottom" | "left" | "right";
	padding?: number;
}

export interface TutorialSequence {
	id: string;
	steps: TutorialStep[];
	prerequisiteUrl: string;
	/** Runs after navigation but before the first step. Use to set up UI state (e.g. open a drawer). */
	setup?: () => Promise<void> | void;
}

export interface TutorialState {
	active: boolean;
	sequence: TutorialSequence | null;
	currentStepIndex: number;
	savedUrl: string;
}
