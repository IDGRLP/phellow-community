import type { QuestionnaireAnswer } from "$lib/stores/questionnaireStore.svelte";
import { CalendarDate } from "@internationalized/date";
import type { Questionnaire } from "fhir/r4";
import { SvelteMap } from "svelte/reactivity";
import { describe, expect, test } from "vitest";
import { createQuestionnaireResponse } from "./createQuestionnaireResponse";

describe("createQuestionnaireResponse", () => {
	test("filters out empty groups", () => {
		const questionnaire: Questionnaire = {
			resourceType: "Questionnaire",
			status: "active",
			title: "Feedback zur Diagnose",
			id: "1_Fd",
			item: [
				{
					linkId: "0_Fd_Diag_ins",
					text: "Stimmen die Diagnosedaten?",
					type: "choice",
					answerOption: [
						{ valueCoding: { code: "yes", display: "Ja" } },
						{ valueCoding: { code: "no", display: "Nein" } },
					],
				},
				{
					linkId: "1_1_1_Fd_Diag_Entitaet_group",
					type: "group",
					text: "Entität",
					item: [
						{
							linkId: "1_1_1_Fd_Diag_Entitaet_f",
							text: "Wenn fehlend, dann Angabe der fehlenden Entität",
							type: "choice",
							answerOption: [
								{ valueCoding: { code: "catalog", display: "Katalog" } },
								{ valueCoding: { code: "other", display: "Sonstiges" } },
							],
						},
					],
				},
				{
					linkId: "1_1_2_Fd_Diag_ICD_group",
					type: "group",
					text: "ICD-10",
					item: [
						{
							linkId: "1_1_2_Fd_Diag_ICD_f",
							text: "Wenn fehlend, dann Angabe der fehlenden ICD-10",
							type: "choice",
							answerOption: [
								{ valueCoding: { code: "catalog", display: "Katalog" } },
								{ valueCoding: { code: "other", display: "Sonstiges" } },
							],
						},
					],
				},
			],
		};

		// Only answer the first question
		const answers = new SvelteMap<string, QuestionnaireAnswer>();
		answers.set("0_Fd_Diag_ins", {
			linkId: "0_Fd_Diag_ins",
			value: { code: "yes", display: "Ja" },
		});

		const response = createQuestionnaireResponse(questionnaire, answers);

		expect(response.resourceType).toBe("QuestionnaireResponse");
		expect(response.status).toBe("completed");
		expect(response.questionnaire).toBe("1_Fd");

		// Should only contain the answered question, no empty groups
		expect(response.item).toHaveLength(1);
		expect(response.item?.[0]?.linkId).toBe("0_Fd_Diag_ins");
		expect(response.item?.[0]?.answer?.[0]?.valueCoding?.code).toBe("yes");

		// Should not contain empty groups
		const groupItems = response.item?.filter(
			(item) =>
				item.linkId === "1_1_1_Fd_Diag_Entitaet_group" || item.linkId === "1_1_2_Fd_Diag_ICD_group"
		);
		expect(groupItems).toHaveLength(0);
	});

	test("includes groups with answered child items", () => {
		const questionnaire: Questionnaire = {
			resourceType: "Questionnaire",
			status: "active",
			title: "Test Questionnaire",
			id: "test",
			item: [
				{
					linkId: "question1",
					text: "First question",
					type: "string",
				},
				{
					linkId: "group1",
					type: "group",
					text: "Test Group",
					item: [
						{
							linkId: "group_child1",
							text: "Child question 1",
							type: "string",
						},
						{
							linkId: "group_child2",
							text: "Child question 2",
							type: "string",
						},
					],
				},
			],
		};

		const answers = new SvelteMap<string, QuestionnaireAnswer>();
		answers.set("question1", { linkId: "question1", value: "Answer 1" });
		answers.set("group_child1", { linkId: "group_child1", value: "Child Answer 1" });

		const response = createQuestionnaireResponse(questionnaire, answers);

		expect(response.item).toHaveLength(2);

		// First item should be the regular question
		expect(response.item?.[0]?.linkId).toBe("question1");
		expect(response.item?.[0]?.answer?.[0]?.valueString).toBe("Answer 1");

		// Second item should be the group with its answered child
		expect(response.item?.[1]?.linkId).toBe("group1");
		expect(response.item?.[1]?.item).toHaveLength(1);
		expect(response.item?.[1]?.item?.[0]?.linkId).toBe("group_child1");
		expect(response.item?.[1]?.item?.[0]?.answer?.[0]?.valueString).toBe("Child Answer 1");

		// group_child2 should not be included since it has no answer
	});

	test("handles nested groups correctly", () => {
		const questionnaire: Questionnaire = {
			resourceType: "Questionnaire",
			status: "active",
			title: "Nested Test",
			id: "nested",
			item: [
				{
					linkId: "parent_group",
					type: "group",
					text: "Parent Group",
					item: [
						{
							linkId: "child_group1",
							type: "group",
							text: "Child Group 1",
							item: [
								{
									linkId: "grandchild1",
									text: "Grandchild 1",
									type: "string",
								},
							],
						},
						{
							linkId: "child_group2",
							type: "group",
							text: "Child Group 2",
							item: [
								{
									linkId: "grandchild2",
									text: "Grandchild 2",
									type: "string",
								},
							],
						},
					],
				},
			],
		};

		const answers = new SvelteMap<string, QuestionnaireAnswer>();
		answers.set("grandchild1", { linkId: "grandchild1", value: "Grandchild Answer" });

		const response = createQuestionnaireResponse(questionnaire, answers);

		expect(response.item).toHaveLength(1);
		expect(response.item?.[0]?.linkId).toBe("parent_group");
		expect(response.item?.[0]?.item).toHaveLength(1);
		expect(response.item?.[0]?.item?.[0]?.linkId).toBe("child_group1");
		expect(response.item?.[0]?.item?.[0]?.item).toHaveLength(1);
		expect(response.item?.[0]?.item?.[0]?.item?.[0]?.linkId).toBe("grandchild1");

		// child_group2 should not be included since it has no answered children
	});

	test("handles partial date values correctly", () => {
		const questionnaire: Questionnaire = {
			resourceType: "Questionnaire",
			status: "active",
			title: "Date Test",
			id: "date_test",
			item: [
				{
					linkId: "date_year_only",
					text: "Year only",
					type: "date",
				},
				{
					linkId: "date_year_month",
					text: "Year and month",
					type: "date",
				},
				{
					linkId: "date_full",
					text: "Full date",
					type: "date",
				},
			],
		};

		const answers = new SvelteMap<string, QuestionnaireAnswer>();
		answers.set("date_year_only", { linkId: "date_year_only", value: "2023" });
		answers.set("date_year_month", { linkId: "date_year_month", value: "2023-06" });
		answers.set("date_full", { linkId: "date_full", value: "2023-06-15" });

		const response = createQuestionnaireResponse(questionnaire, answers);

		expect(response.item).toHaveLength(3);

		// Year only
		expect(response.item?.[0]?.linkId).toBe("date_year_only");
		expect(response.item?.[0]?.answer?.[0]?.valueDate).toBe("2023");

		// Year and month
		expect(response.item?.[1]?.linkId).toBe("date_year_month");
		expect(response.item?.[1]?.answer?.[0]?.valueDate).toBe("2023-06");

		// Full date
		expect(response.item?.[2]?.linkId).toBe("date_full");
		expect(response.item?.[2]?.answer?.[0]?.valueDate).toBe("2023-06-15");
	});

	test("handles FHIR extension for date precision mode", () => {
		const questionnaire: Questionnaire = {
			resourceType: "Questionnaire",
			status: "active",
			title: "Extension Test",
			id: "ext_test",
			item: [
				{
					linkId: "date_year_only",
					text: "Year only date",
					type: "date",
					extension: [
						{
							url: "http://phellowseven.com/fhir/StructureDefinition/date-precision-mode",
							valueCode: "year-only",
						},
					],
				},
				{
					linkId: "date_year_month",
					text: "Year-month date",
					type: "date",
					extension: [
						{
							url: "http://phellowseven.com/fhir/StructureDefinition/date-precision-mode",
							valueCode: "year-month",
						},
					],
				},
				{
					linkId: "date_partial",
					text: "Partial date",
					type: "date",
					extension: [
						{
							url: "http://phellowseven.com/fhir/StructureDefinition/date-precision-mode",
							valueCode: "partial",
						},
					],
				},
				{
					linkId: "date_auto",
					text: "Auto toggle date",
					type: "date",
					extension: [
						{
							url: "http://phellowseven.com/fhir/StructureDefinition/date-precision-mode",
							valueCode: "auto",
						},
					],
				},
				{
					linkId: "date_default",
					text: "Default full date",
					type: "date",
					// No extension - should default to full
				},
			],
		};

		const answers = new SvelteMap<string, QuestionnaireAnswer>();
		answers.set("date_year_only", { linkId: "date_year_only", value: "2023" });
		answers.set("date_year_month", { linkId: "date_year_month", value: "2023-06" });
		answers.set("date_partial", { linkId: "date_partial", value: "2023-06-15" });
		answers.set("date_auto", { linkId: "date_auto", value: "2023" });
		// date_default will use CalendarDate (full date behavior)
		answers.set("date_default", { linkId: "date_default", value: new CalendarDate(2023, 6, 15) });

		const response = createQuestionnaireResponse(questionnaire, answers);

		expect(response.item).toHaveLength(5);

		// Year only
		expect(response.item?.[0]?.answer?.[0]?.valueDate).toBe("2023");

		// Year month
		expect(response.item?.[1]?.answer?.[0]?.valueDate).toBe("2023-06");

		// Partial (allows full dates)
		expect(response.item?.[2]?.answer?.[0]?.valueDate).toBe("2023-06-15");

		// Auto toggle
		expect(response.item?.[3]?.answer?.[0]?.valueDate).toBe("2023");

		// Default full date
		expect(response.item?.[4]?.answer?.[0]?.valueDate).toBe("2023-06-15");
	});

	test("sets subject and source when references are provided", () => {
		const questionnaire: Questionnaire = {
			resourceType: "Questionnaire",
			status: "active",
			title: "Ref Test",
			id: "ref_test",
			item: [{ linkId: "q1", text: "Q", type: "string" }],
		};

		const answers = new SvelteMap<string, QuestionnaireAnswer>();
		answers.set("q1", { linkId: "q1", value: "A" });

		const response = createQuestionnaireResponse(questionnaire, answers, {
			subject: { reference: "Condition/cond-1" },
			source: { reference: "Patient/pat-1" },
		});

		expect(response.subject).toEqual({ reference: "Condition/cond-1" });
		expect(response.source).toEqual({ reference: "Patient/pat-1" });
	});

	test("excludes stale answers from disabled enableWhen branches when enabledItems is provided", () => {
		const questionnaire: Questionnaire = {
			resourceType: "Questionnaire",
			status: "active",
			id: "branch_test",
			item: [
				{
					linkId: "trigger",
					type: "choice",
					text: "Show branch?",
					answerOption: [
						{ valueCoding: { code: "yes", display: "Yes" } },
						{ valueCoding: { code: "no", display: "No" } },
					],
				},
				{
					linkId: "branch_q",
					type: "string",
					text: "Branch question",
					enableWhen: [{ question: "trigger", operator: "=", answerCoding: { code: "yes" } }],
				},
			],
		};

		// User originally answered "yes" and filled in branch_q, then changed
		// trigger to "no". The branch is now disabled but the answer lingers
		// in the answers map.
		const answers = new SvelteMap<string, QuestionnaireAnswer>();
		answers.set("trigger", { linkId: "trigger", value: { code: "no", display: "No" } });
		answers.set("branch_q", { linkId: "branch_q", value: "stale answer" });

		const enabledItems = new Set<string>(["trigger"]); // branch_q is NOT enabled

		const response = createQuestionnaireResponse(questionnaire, answers, undefined, enabledItems);

		expect(response.item).toHaveLength(1);
		expect(response.item?.[0]?.linkId).toBe("trigger");
		// branch_q must NOT appear since it is disabled
		const branchItem = response.item?.find((i) => i.linkId === "branch_q");
		expect(branchItem).toBeUndefined();
	});

	test("excludes a whole disabled subgroup, not just disabled leaves", () => {
		const questionnaire: Questionnaire = {
			resourceType: "Questionnaire",
			status: "active",
			id: "group_branch_test",
			item: [
				{
					linkId: "trigger",
					type: "boolean",
					text: "Has details?",
				},
				{
					linkId: "details_group",
					type: "group",
					text: "Details",
					enableWhen: [{ question: "trigger", operator: "=", answerBoolean: true }],
					item: [
						{ linkId: "detail_a", type: "string", text: "A" },
						{ linkId: "detail_b", type: "string", text: "B" },
					],
				},
			],
		};

		const answers = new SvelteMap<string, QuestionnaireAnswer>();
		answers.set("trigger", { linkId: "trigger", value: false });
		answers.set("detail_a", { linkId: "detail_a", value: "stale a" });
		answers.set("detail_b", { linkId: "detail_b", value: "stale b" });

		// Only trigger is enabled — group + children are disabled.
		const enabledItems = new Set<string>(["trigger"]);

		const response = createQuestionnaireResponse(questionnaire, answers, undefined, enabledItems);

		expect(response.item).toHaveLength(1);
		expect(response.item?.[0]?.linkId).toBe("trigger");
		expect(response.item?.find((i) => i.linkId === "details_group")).toBeUndefined();
	});

	test("includes branch answers when enabledItems contains them", () => {
		const questionnaire: Questionnaire = {
			resourceType: "Questionnaire",
			status: "active",
			id: "branch_enabled_test",
			item: [
				{ linkId: "trigger", type: "boolean", text: "" },
				{
					linkId: "branch_q",
					type: "string",
					text: "",
					enableWhen: [{ question: "trigger", operator: "=", answerBoolean: true }],
				},
			],
		};

		const answers = new SvelteMap<string, QuestionnaireAnswer>();
		answers.set("trigger", { linkId: "trigger", value: true });
		answers.set("branch_q", { linkId: "branch_q", value: "kept" });

		const enabledItems = new Set<string>(["trigger", "branch_q"]);
		const response = createQuestionnaireResponse(questionnaire, answers, undefined, enabledItems);

		expect(response.item).toHaveLength(2);
		expect(response.item?.[1]?.answer?.[0]?.valueString).toBe("kept");
	});

	test("backwards-compat: omitting enabledItems includes all answered items (existing behavior)", () => {
		const questionnaire: Questionnaire = {
			resourceType: "Questionnaire",
			status: "active",
			id: "bc_test",
			item: [
				{ linkId: "a", type: "string", text: "" },
				{ linkId: "b", type: "string", text: "" },
			],
		};

		const answers = new SvelteMap<string, QuestionnaireAnswer>();
		answers.set("a", { linkId: "a", value: "A" });
		answers.set("b", { linkId: "b", value: "B" });

		const response = createQuestionnaireResponse(questionnaire, answers);
		expect(response.item).toHaveLength(2);
	});

	test("omits subject and source when references are not provided", () => {
		const questionnaire: Questionnaire = {
			resourceType: "Questionnaire",
			status: "active",
			title: "No Ref Test",
			id: "no_ref_test",
			item: [{ linkId: "q1", text: "Q", type: "string" }],
		};

		const answers = new SvelteMap<string, QuestionnaireAnswer>();
		answers.set("q1", { linkId: "q1", value: "A" });

		const response = createQuestionnaireResponse(questionnaire, answers);

		expect(response.subject).toBeUndefined();
		expect(response.source).toBeUndefined();
	});
});
