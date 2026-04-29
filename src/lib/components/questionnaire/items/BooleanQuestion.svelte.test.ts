import type { QuestionnaireItem } from "fhir/r4";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import BooleanQuestion from "./BooleanQuestion.svelte";

const item: QuestionnaireItem = { linkId: "b", type: "boolean", text: "Confirm?" };

describe("BooleanQuestion", () => {
	test("neither button selected when value is undefined", async () => {
		const screen = render(BooleanQuestion, { item, value: undefined, onAnswer: vi.fn() });
		await expect
			.element(screen.getByTestId("boolean-yes"))
			.toHaveAttribute("data-selected", "false");
		await expect
			.element(screen.getByTestId("boolean-no"))
			.toHaveAttribute("data-selected", "false");
	});

	test("prefilled true highlights yes", async () => {
		const screen = render(BooleanQuestion, { item, value: true, onAnswer: vi.fn() });
		await expect
			.element(screen.getByTestId("boolean-yes"))
			.toHaveAttribute("data-selected", "true");
		await expect
			.element(screen.getByTestId("boolean-no"))
			.toHaveAttribute("data-selected", "false");
	});

	test("prefilled false highlights no (regression: don't confuse with undefined)", async () => {
		const screen = render(BooleanQuestion, { item, value: false, onAnswer: vi.fn() });
		await expect
			.element(screen.getByTestId("boolean-yes"))
			.toHaveAttribute("data-selected", "false");
		await expect.element(screen.getByTestId("boolean-no")).toHaveAttribute("data-selected", "true");
	});

	test("clicking yes calls onAnswer(true), no calls onAnswer(false)", async () => {
		const onAnswer = vi.fn();
		const screen = render(BooleanQuestion, { item, value: undefined, onAnswer });
		await screen.getByTestId("boolean-yes").click();
		expect(onAnswer).toHaveBeenLastCalledWith(true);
		await screen.getByTestId("boolean-no").click();
		expect(onAnswer).toHaveBeenLastCalledWith(false);
	});
});
