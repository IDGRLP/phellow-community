import type { TutorialSequence } from "$lib/types/tutorial";

function waitFor(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const progressionTutorial: TutorialSequence = {
	id: "progression-detail",
	prerequisiteUrl: "/module/oncology?file=InKaPP_Lunge_C34.json",
	async setup() {
		await waitFor(300);
		const el = document.querySelector('[data-tutorial="timeline-event-progression"]');
		if (el instanceof HTMLElement) {
			el.click();
		}
		await waitFor(500);
	},
	steps: [
		{
			id: "notice-demo-data",
			titleKey: "tutorial_notice_demo_data_title",
			descriptionKey: "tutorial_notice_demo_data_description",
			placement: "bottom",
		},
		{
			id: "progression-header",
			targetSelector: '[data-tutorial="progression-header"]',
			titleKey: "tutorial_step_progression_header_title",
			descriptionKey: "tutorial_step_progression_header_description",
			placement: "bottom",
		},
		{
			id: "progression-assessment",
			targetSelector: '[data-tutorial="progression-assessment"]',
			titleKey: "tutorial_step_progression_assessment_title",
			descriptionKey: "tutorial_step_progression_assessment_description",
			placement: "bottom",
		},
	],
};
