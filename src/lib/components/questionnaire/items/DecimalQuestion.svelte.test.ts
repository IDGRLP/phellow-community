import type { QuestionnaireItem } from "fhir/r4";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import DecimalQuestion from "./DecimalQuestion.svelte";

const item: QuestionnaireItem = { linkId: "d", type: "decimal", text: "Weight" };

describe("DecimalQuestion", () => {
	test("prefilled decimal renders in input", async () => {
		const screen = render(DecimalQuestion, { item, value: 3.14, onAnswer: vi.fn() });
		await expect.element(screen.getByRole("spinbutton")).toHaveValue(3.14);
	});

	test("typing decimal calls onAnswer with parsed number", async () => {
		const onAnswer = vi.fn();
		const screen = render(DecimalQuestion, { item, value: undefined, onAnswer });
		await screen.getByRole("spinbutton").fill("2.5");
		expect(onAnswer).toHaveBeenLastCalledWith(2.5);
	});

	test("clearing calls onAnswer with undefined", async () => {
		const onAnswer = vi.fn();
		const screen = render(DecimalQuestion, { item, value: 1.0, onAnswer });
		await screen.getByRole("spinbutton").fill("");
		expect(onAnswer).toHaveBeenLastCalledWith(undefined);
	});
});
