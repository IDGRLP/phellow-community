import type { TutorialSequence } from "$lib/types/tutorial";

function waitFor(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const systemicTherapyTutorial: TutorialSequence = {
	id: "systemic-therapy-detail",
	prerequisiteUrl: "/module/oncology?file=InKaPP_Lunge_C34.json",
	async setup() {
		await waitFor(300);
		const el = document.querySelector('[data-tutorial="timeline-event-systemic-therapy"]');
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
			id: "systemic-header",
			targetSelector: '[data-tutorial="systemic-header"]',
			titleKey: "tutorial_step_systemic_header_title",
			descriptionKey: "tutorial_step_systemic_header_description",
			placement: "bottom",
		},
		{
			id: "systemic-type",
			targetSelector: '[data-tutorial="systemic-type"]',
			titleKey: "tutorial_step_systemic_type_title",
			descriptionKey: "tutorial_step_systemic_type_description",
			placement: "bottom",
		},
		{
			id: "systemic-end",
			targetSelector: '[data-tutorial="systemic-end"]',
			titleKey: "tutorial_step_systemic_end_title",
			descriptionKey: "tutorial_step_systemic_end_description",
			placement: "top",
		},
		{
			id: "systemic-medication",
			targetSelector: '[data-tutorial="systemic-medication"]',
			titleKey: "tutorial_step_systemic_medication_title",
			descriptionKey: "tutorial_step_systemic_medication_description",
			placement: "top",
		},
	],
};
