import type { TutorialSequence } from "$lib/types/tutorial";

function waitFor(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const radiationTutorial: TutorialSequence = {
	id: "radiation-detail",
	prerequisiteUrl: "/module/oncology?file=InKaPP_Lunge_C34.json",
	async setup() {
		await waitFor(300);
		const el = document.querySelector('[data-tutorial="timeline-event-radiation"]');
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
			id: "radiation-header",
			targetSelector: '[data-tutorial="radiation-header"]',
			titleKey: "tutorial_step_radiation_header_title",
			descriptionKey: "tutorial_step_radiation_header_description",
			placement: "bottom",
		},
		{
			id: "radiation-targets",
			targetSelector: '[data-tutorial="radiation-targets"]',
			titleKey: "tutorial_step_radiation_targets_title",
			descriptionKey: "tutorial_step_radiation_targets_description",
			placement: "bottom",
		},
		{
			id: "radiation-end",
			targetSelector: '[data-tutorial="radiation-end"]',
			titleKey: "tutorial_step_radiation_end_title",
			descriptionKey: "tutorial_step_radiation_end_description",
			placement: "top",
		},
	],
};
