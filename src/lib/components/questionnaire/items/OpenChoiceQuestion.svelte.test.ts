import { CUSTOM_OPEN_CHOICE_CODE_PREFIX } from "$lib/fhir/questionnaire/parseQuestionnaireResponse";
import type { QuestionnaireItem } from "fhir/r4";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import OpenChoiceQuestion from "./OpenChoiceQuestion.svelte";

const item: QuestionnaireItem = {
	linkId: "oc",
	type: "open-choice",
	text: "Pick one",
	answerOption: [
		{ valueCoding: { code: "a", display: "Alpha" } },
		{ valueCoding: { code: "b", display: "Bravo" } },
	],
};

describe("OpenChoiceQuestion", () => {
	test("no option selected when value undefined; add-custom button is shown", async () => {
		const screen = render(OpenChoiceQuestion, { item, value: undefined, onAnswer: vi.fn() });
		await expect
			.element(screen.getByTestId("openchoice-option-a"))
			.toHaveAttribute("data-selected", "false");
		await expect
			.element(screen.getByTestId("openchoice-option-b"))
			.toHaveAttribute("data-selected", "false");
	});

	test("prefilled coded value highlights matching option", async () => {
		const screen = render(OpenChoiceQuestion, {
			item,
			value: { code: "a", text: "Alpha" },
			onAnswer: vi.fn(),
		});
		await expect
			.element(screen.getByTestId("openchoice-option-a"))
			.toHaveAttribute("data-selected", "true");
		await expect
			.element(screen.getByTestId("openchoice-option-b"))
			.toHaveAttribute("data-selected", "false");
	});

	test("prefilled custom value shows the custom input populated (regression: prefilled freeform)", async () => {
		const screen = render(OpenChoiceQuestion, {
			item,
			value: { code: CUSTOM_OPEN_CHOICE_CODE_PREFIX, text: "freeform answer" },
			onAnswer: vi.fn(),
		});
		await expect
			.element(screen.getByTestId("openchoice-custom-input"))
			.toHaveValue("freeform answer");
		// Neither preset option should be highlighted
		await expect
			.element(screen.getByTestId("openchoice-option-a"))
			.toHaveAttribute("data-selected", "false");
	});

	test("clicking an option calls onAnswer with {code, text}", async () => {
		const onAnswer = vi.fn();
		const screen = render(OpenChoiceQuestion, { item, value: undefined, onAnswer });
		await screen.getByTestId("openchoice-option-b").click();
		expect(onAnswer).toHaveBeenLastCalledWith({ code: "b", text: "Bravo" });
	});

	test("typing in custom input emits onAnswer with custom prefix", async () => {
		const onAnswer = vi.fn();
		const screen = render(OpenChoiceQuestion, { item, value: undefined, onAnswer });

		await screen.getByTestId("openchoice-add-custom").click();
		await screen.getByTestId("openchoice-custom-input").fill("my own");

		const last = onAnswer.mock.calls.at(-1)?.[0];
		expect(last).toEqual({ code: CUSTOM_OPEN_CHOICE_CODE_PREFIX, text: "my own" });
	});
});
