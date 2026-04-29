import type { QuestionnaireItem } from "fhir/r4";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import ChoiceQuestion from "./ChoiceQuestion.svelte";

const codingItem: QuestionnaireItem = {
	linkId: "c",
	type: "choice",
	text: "Choose one",
	answerOption: [
		{ valueCoding: { code: "yes", display: "Yes", system: "http://example.com" } },
		{ valueCoding: { code: "no", display: "No", system: "http://example.com" } },
	],
};

const stringItem: QuestionnaireItem = {
	linkId: "c",
	type: "choice",
	text: "Choose one",
	answerOption: [{ valueString: "alpha" }, { valueString: "beta" }],
};

describe("ChoiceQuestion (Coding)", () => {
	test("renders all options unselected when no value", async () => {
		const screen = render(ChoiceQuestion, {
			item: codingItem,
			value: undefined,
			onAnswer: vi.fn(),
		});

		const yes = screen.getByTestId("choice-option-yes");
		const no = screen.getByTestId("choice-option-no");
		await expect.element(yes).toHaveAttribute("data-selected", "false");
		await expect.element(no).toHaveAttribute("data-selected", "false");
	});

	test("marks option selected when value is a Coding with matching code (regression: prefilled value)", async () => {
		// Simulates a value from parseQuestionnaireResponse: a freshly-built
		// {code, display} that is NOT reference-equal to the questionnaire's
		// answerOption.valueCoding (which carries `system` too).
		const screen = render(ChoiceQuestion, {
			item: codingItem,
			value: { code: "yes", display: "Yes" },
			onAnswer: vi.fn(),
		});

		const yes = screen.getByTestId("choice-option-yes");
		const no = screen.getByTestId("choice-option-no");
		await expect.element(yes).toHaveAttribute("data-selected", "true");
		await expect.element(no).toHaveAttribute("data-selected", "false");
	});

	test("clicking an option calls onAnswer with that option's Coding", async () => {
		const onAnswer = vi.fn();
		const screen = render(ChoiceQuestion, {
			item: codingItem,
			value: undefined,
			onAnswer,
		});

		await screen.getByTestId("choice-option-no").click();
		expect(onAnswer).toHaveBeenCalledTimes(1);
		expect(onAnswer.mock.calls[0]?.[0]).toMatchObject({ code: "no", display: "No" });
	});

	test("multi-select with repeats: marks all matching codings selected", async () => {
		const screen = render(ChoiceQuestion, {
			item: { ...codingItem, repeats: true },
			value: [
				{ code: "yes", display: "Yes" },
				{ code: "no", display: "No" },
			],
			onAnswer: vi.fn(),
		});

		await expect
			.element(screen.getByTestId("choice-option-yes"))
			.toHaveAttribute("data-selected", "true");
		await expect
			.element(screen.getByTestId("choice-option-no"))
			.toHaveAttribute("data-selected", "true");
	});

	test("multi-select toggles selection on click", async () => {
		const onAnswer = vi.fn();
		const screen = render(ChoiceQuestion, {
			item: { ...codingItem, repeats: true },
			value: [{ code: "yes", display: "Yes" }],
			onAnswer,
		});

		await screen.getByTestId("choice-option-no").click();
		expect(onAnswer).toHaveBeenCalledTimes(1);
		const lastCall = onAnswer.mock.calls[0]?.[0];
		expect(lastCall).toHaveLength(2);
		expect(lastCall).toContainEqual({ code: "yes", display: "Yes" });
		expect(lastCall).toContainEqual(expect.objectContaining({ code: "no" }));
	});
});

describe("ChoiceQuestion (string options)", () => {
	test("marks string option selected when value matches", async () => {
		const screen = render(ChoiceQuestion, {
			item: stringItem,
			value: "alpha",
			onAnswer: vi.fn(),
		});

		await expect
			.element(screen.getByTestId("choice-option-alpha"))
			.toHaveAttribute("data-selected", "true");
		await expect
			.element(screen.getByTestId("choice-option-beta"))
			.toHaveAttribute("data-selected", "false");
	});

	test("clicking string option calls onAnswer with that string", async () => {
		const onAnswer = vi.fn();
		const screen = render(ChoiceQuestion, {
			item: stringItem,
			value: undefined,
			onAnswer,
		});

		await screen.getByTestId("choice-option-beta").click();
		expect(onAnswer).toHaveBeenCalledWith("beta");
	});
});
