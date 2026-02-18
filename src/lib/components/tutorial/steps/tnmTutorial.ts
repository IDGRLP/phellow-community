import type { TutorialSequence } from "$lib/types/tutorial";

function waitFor(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const tnmTutorial: TutorialSequence = {
	id: "tnm-detail",
	prerequisiteUrl: "/module/oncology?file=InKaPP_Lunge_C34.json",
	async setup() {
		await waitFor(300);
		const el = document.querySelector('[data-tutorial="timeline-event-tnm"]');
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
			id: "tnm-header",
			targetSelector: '[data-tutorial="tnm-header"]',
			titleKey: "tutorial_step_tnm_header_title",
			descriptionKey: "tutorial_step_tnm_header_description",
			placement: "bottom",
		},
		{
			id: "tnm-formula",
			targetSelector: '[data-tutorial="tnm-formula"]',
			titleKey: "tutorial_step_tnm_formula_title",
			descriptionKey: "tutorial_step_tnm_formula_description",
			placement: "bottom",
		},
	],
};
