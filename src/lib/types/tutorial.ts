export interface TutorialStep {
	id: string;
	targetSelector: string;
	titleKey: string;
	descriptionKey: string;
	placement: "top" | "bottom" | "left" | "right";
	padding?: number;
}

export interface TutorialSequence {
	id: string;
	steps: TutorialStep[];
	prerequisiteUrl: string;
}

export interface TutorialState {
	active: boolean;
	sequence: TutorialSequence | null;
	currentStepIndex: number;
	savedUrl: string;
}
