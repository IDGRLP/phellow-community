import type { TutorialSequence } from "$lib/types/tutorial";

function waitFor(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const diagnosisTutorial: TutorialSequence = {
	id: "diagnosis-detail",
	prerequisiteUrl: "/module/oncology?file=InKaPP_Lunge_C34.json",
	async setup() {
		// Wait for the timeline to render
		await waitFor(300);

		// Click the first diagnosis event to open its drawer
		const diagnosisEl = document.querySelector('[data-tutorial="timeline-event-diagnosis"]');
		if (diagnosisEl instanceof HTMLElement) {
			diagnosisEl.click();
		}

		// Wait for the drawer to open and render its content
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
			id: "diagnosis-header",
			targetSelector: '[data-tutorial="diagnosis-header"]',
			titleKey: "tutorial_step_diagnosis_header_title",
			descriptionKey: "tutorial_step_diagnosis_header_description",
			placement: "bottom",
		},
		{
			id: "diagnosis-icd10",
			targetSelector: '[data-tutorial="diagnosis-icd10"]',
			titleKey: "tutorial_step_diagnosis_icd10_title",
			descriptionKey: "tutorial_step_diagnosis_icd10_description",
			placement: "bottom",
		},
		{
			id: "diagnosis-laterality",
			targetSelector: '[data-tutorial="diagnosis-laterality"]',
			titleKey: "tutorial_step_diagnosis_laterality_title",
			descriptionKey: "tutorial_step_diagnosis_laterality_description",
			placement: "bottom",
		},
		{
			id: "diagnosis-morphology",
			targetSelector: '[data-tutorial="diagnosis-morphology"]',
			titleKey: "tutorial_step_diagnosis_morphology_title",
			descriptionKey: "tutorial_step_diagnosis_morphology_description",
			placement: "bottom",
		},
		{
			id: "diagnosis-topography",
			targetSelector: '[data-tutorial="diagnosis-topography"]',
			titleKey: "tutorial_step_diagnosis_topography_title",
			descriptionKey: "tutorial_step_diagnosis_topography_description",
			placement: "bottom",
		},
		{
			id: "diagnosis-histology",
			targetSelector: '[data-tutorial="diagnosis-histology"]',
			titleKey: "tutorial_step_diagnosis_histology_title",
			descriptionKey: "tutorial_step_diagnosis_histology_description",
			placement: "top",
		},
		{
			id: "diagnosis-metastases",
			targetSelector: '[data-tutorial="diagnosis-metastases"]',
			titleKey: "tutorial_step_diagnosis_metastases_title",
			descriptionKey: "tutorial_step_diagnosis_metastases_description",
			placement: "top",
		},
	],
};
