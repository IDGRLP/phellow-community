import type { Questionnaire } from "fhir/r4";

export default {
	resourceType: "Questionnaire",
	status: "active",
	title: "Feedback zum Verlauf",
	id: "6_Fd",
	item: [
		{
			linkId: "6_Fd_Ver_ins",
			text: "Sind die Angaben zum Verlauf korrekt?",
			required: true,
			type: "choice",
			answerOption: [
				{
					valueCoding: {
						code: "correctAndComplete",
						display:
							"Ja, die angezeigten Informationen sind korrekt und vollständig (richtig und vollständig)",
					},
				},
				{
					valueCoding: {
						code: "correctButIncomplete",
						display:
							"Ja, die angezeigten Informationen sind korrekt, aber es fehlt etwas (richtig, aber unvollständig)",
					},
				},
				{
					valueCoding: {
						code: "incorrectButComplete",
						display:
							"Nein, die angezeigten Informationen sind (teilweise) fehlerhaft, aber an sich vollständig (falsch, aber vollständig)",
					},
				},
				{
					valueCoding: {
						code: "incorrectAndIncomplete",
						display:
							"Nein, die angezeigten Informationen sind (teilweise) fehlerhaft und unvollständig (falsch und unvollständig)",
					},
				},
				{
					valueCoding: {
						code: "correctButUnclearIfComplete",
						display:
							"Die angezeigten Informationen sind korrekt, aber ich weiß nicht, ob noch etwas fehlt (richtig, aber unklar, ob vollständig)",
					},
				},
				{
					valueCoding: {
						code: "unknown",
						display:
							"Ich weiß nicht, ob die anzeigten Informationen korrekt sind und ob noch Informationen fehlen (Richtigkeit und Vollständigkeit unklar)",
					},
				},
				{
					valueCoding: {
						code: "na",
						display: "Hierzu möchte ich keine Angabe machen",
					},
				},
			],
		},
		{
			linkId: "6_1_Fd_Ver_datum",
			type: "group",
			enableBehavior: "any",
			enableWhen: [
				{
					question: "6_Fd_Ver_ins",
					operator: "=",
					answerCoding: { code: "correctButIncomplete" },
				},
				{
					question: "6_Fd_Ver_ins",
					operator: "=",
					answerCoding: { code: "incorrectButComplete" },
				},
				{
					question: "6_Fd_Ver_ins",
					operator: "=",
					answerCoding: { code: "incorrectAndIncomplete" },
				},
			],
			item: [
				{
					linkId: "6_1_Fd_Ver_datum_choice",
					text: "Stimmt das Datum der Verlaufsmeldung?",
					required: true,
					type: "choice",
					answerOption: [
						{ valueCoding: { code: "yes", display: "Ja" } },
						{ valueCoding: { code: "no", display: "Nein, die Information stimmt nicht" } },
						{ valueCoding: { code: "noMissing", display: "Nein, es fehlt etwas" } },
						{ valueCoding: { code: "unknown", display: "Ich weiß nicht" } },
						{ valueCoding: { code: "na", display: "Hierzu möchte ich keine Angabe machen" } },
					],
				},
				{
					linkId: "6_1_Fd_Ver_datum_text",
					text: "Welche Information beim Datum der Verlaufsmeldung stimmt nicht bzw. fehlt? Seien Sie bitte möglichst präzise.",
					type: "text",
					required: true,
					enableBehavior: "any",
					enableWhen: [
						{
							question: "6_1_Fd_Ver_datum_choice",
							operator: "=",
							answerCoding: { code: "no" },
						},
						{
							question: "6_1_Fd_Ver_datum_choice",
							operator: "=",
							answerCoding: { code: "noMissing" },
						},
					],
				},
			],
		},
		{
			linkId: "6_2_Fd_Ver_target",
			type: "group",
			enableBehavior: "any",
			enableWhen: [
				{
					question: "6_Fd_Ver_ins",
					operator: "=",
					answerCoding: { code: "correctButIncomplete" },
				},
				{
					question: "6_Fd_Ver_ins",
					operator: "=",
					answerCoding: { code: "incorrectButComplete" },
				},
				{
					question: "6_Fd_Ver_ins",
					operator: "=",
					answerCoding: { code: "incorrectAndIncomplete" },
				},
			],
			item: [
				{
					linkId: "6_2_Fd_Ver_target_choice",
					text: "Ist die Angabe zur Gesamtbeurteilung korrekt?",
					required: true,
					type: "choice",
					answerOption: [
						{ valueCoding: { code: "yes", display: "Ja" } },
						{ valueCoding: { code: "no", display: "Nein, die Information stimmt nicht" } },
						{ valueCoding: { code: "noMissing", display: "Nein, es fehlt etwas" } },
						{ valueCoding: { code: "unknown", display: "Ich weiß nicht" } },
						{ valueCoding: { code: "na", display: "Hierzu möchte ich keine Angabe machen" } },
					],
				},
				{
					linkId: "6_2_Fd_Ver_target_text",
					text: "Welche Information zur Gesamtbeurteilung stimmt nicht bzw. fehlt? Seien Sie bitte möglichst präzise.",
					type: "text",
					required: true,
					enableBehavior: "any",
					enableWhen: [
						{
							question: "6_2_Fd_Ver_target_choice",
							operator: "=",
							answerCoding: { code: "no" },
						},
						{
							question: "6_2_Fd_Ver_target_choice",
							operator: "=",
							answerCoding: { code: "noMissing" },
						},
					],
				},
			],
		},
		{
			linkId: "6_3_Fd_Ver_Freitext_k",
			text: "Angabe sonstiger Informationen",
			type: "text",
			required: false,
		},
	],
} satisfies Questionnaire;
