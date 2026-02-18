import type { TutorialSequence } from "$lib/types/tutorial";

function waitFor(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const surgeryTutorial: TutorialSequence = {
	id: "surgery-detail",
	prerequisiteUrl: "/module/oncology?file=InKaPP_Lunge_C34.json",
	async setup() {
		await waitFor(300);
		const el = document.querySelector('[data-tutorial="timeline-event-surgery"]');
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
			id: "surgery-header",
			targetSelector: '[data-tutorial="surgery-header"]',
			titleKey: "tutorial_step_surgery_header_title",
			descriptionKey: "tutorial_step_surgery_header_description",
			placement: "bottom",
		},
		{
			id: "surgery-residual",
			targetSelector: '[data-tutorial="surgery-residual"]',
			titleKey: "tutorial_step_surgery_residual_title",
			descriptionKey: "tutorial_step_surgery_residual_description",
			placement: "bottom",
		},
		{
			id: "surgery-histology",
			targetSelector: '[data-tutorial="surgery-histology"]',
			titleKey: "tutorial_step_surgery_histology_title",
			descriptionKey: "tutorial_step_surgery_histology_description",
			placement: "top",
		},
	],
};
