import type { TutorialSequence } from "$lib/types/tutorial";

export const timelineTutorial: TutorialSequence = {
	id: "timeline-overview",
	prerequisiteUrl: "/module/oncology?file=InKaPP_Lunge_C34.json",
	steps: [
		{
			id: "timeline-legend",
			targetSelector: '[data-tutorial="timeline-legend"]',
			titleKey: "tutorial_step_legend_title",
			descriptionKey: "tutorial_step_legend_description",
			placement: "right",
			padding: 12,
		},
		{
			id: "timeline-spot-first",
			targetSelector: '[data-tutorial-spot="timeline-spot-first"]',
			titleKey: "tutorial_step_spot_title",
			descriptionKey: "tutorial_step_spot_description",
			placement: "right",
		},
		{
			id: "timeline-bar-first",
			targetSelector: '[data-tutorial-bar="timeline-bar-first"]',
			titleKey: "tutorial_step_bar_title",
			descriptionKey: "tutorial_step_bar_description",
			placement: "right",
		},
		{
			id: "timeline-event-diagnosis",
			targetSelector: '[data-tutorial="timeline-event-diagnosis"]',
			titleKey: "tutorial_step_diagnosis_title",
			descriptionKey: "tutorial_step_diagnosis_description",
			placement: "right",
		},
		{
			id: "timeline-event-surgery",
			targetSelector: '[data-tutorial="timeline-event-surgery"]',
			titleKey: "tutorial_step_surgery_title",
			descriptionKey: "tutorial_step_surgery_description",
			placement: "right",
		},
		{
			id: "timeline-event-radiation",
			targetSelector: '[data-tutorial="timeline-event-radiation"]',
			titleKey: "tutorial_step_radiation_title",
			descriptionKey: "tutorial_step_radiation_description",
			placement: "right",
		},
		{
			id: "timeline-event-systemic-therapy",
			targetSelector: '[data-tutorial="timeline-event-systemic-therapy"]',
			titleKey: "tutorial_step_systemic_therapy_title",
			descriptionKey: "tutorial_step_systemic_therapy_description",
			placement: "right",
		},
		{
			id: "timeline-event-progression",
			targetSelector: '[data-tutorial="timeline-event-progression"]',
			titleKey: "tutorial_step_progression_title",
			descriptionKey: "tutorial_step_progression_description",
			placement: "right",
		},
		{
			id: "timeline-event-tnm",
			targetSelector: '[data-tutorial="timeline-event-tnm"]',
			titleKey: "tutorial_step_tnm_title",
			descriptionKey: "tutorial_step_tnm_description",
			placement: "right",
		},
	],
};
