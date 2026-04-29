import type { QuestionnaireItem } from "fhir/r4";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import IntegerQuestion from "./IntegerQuestion.svelte";

const item: QuestionnaireItem = { linkId: "i", type: "integer", text: "Count" };

describe("IntegerQuestion", () => {
	test("renders empty when value undefined", async () => {
		const screen = render(IntegerQuestion, { item, value: undefined, onAnswer: vi.fn() });
		await expect.element(screen.getByRole("spinbutton")).toHaveValue(null);
	});

	test("prefilled integer renders in input", async () => {
		const screen = render(IntegerQuestion, { item, value: 42, onAnswer: vi.fn() });
		await expect.element(screen.getByRole("spinbutton")).toHaveValue(42);
	});

	test("typing calls onAnswer with parsed integer", async () => {
		const onAnswer = vi.fn();
		const screen = render(IntegerQuestion, { item, value: undefined, onAnswer });
		await screen.getByRole("spinbutton").fill("17");
		expect(onAnswer).toHaveBeenLastCalledWith(17);
	});

	test("clearing calls onAnswer with undefined", async () => {
		const onAnswer = vi.fn();
		const screen = render(IntegerQuestion, { item, value: 5, onAnswer });
		await screen.getByRole("spinbutton").fill("");
		expect(onAnswer).toHaveBeenLastCalledWith(undefined);
	});
});
