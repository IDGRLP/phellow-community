import type { QuestionnaireItem } from "fhir/r4";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import QuantityQuestion from "./QuantityQuestion.svelte";

const fixedUnitItem: QuestionnaireItem = {
	linkId: "qt",
	type: "quantity",
	text: "Dose",
	extension: [
		{
			url: "http://hl7.org/fhir/StructureDefinition/questionnaire-unit",
			valueCoding: { code: "mg", display: "mg", system: "http://unitsofmeasure.org" },
		},
	],
};

describe("QuantityQuestion", () => {
	test("prefilled value renders in numeric input (regression: prefill quantity)", async () => {
		const screen = render(QuantityQuestion, {
			item: fixedUnitItem,
			value: { value: 12, unit: "mg", system: "http://unitsofmeasure.org", code: "mg" },
			onAnswer: vi.fn(),
		});
		await expect.element(screen.getByTestId("quantity-value")).toHaveValue(12);
	});

	test("displays the fixed unit label when only one option is available", async () => {
		const screen = render(QuantityQuestion, {
			item: fixedUnitItem,
			value: undefined,
			onAnswer: vi.fn(),
		});
		await expect.element(screen.getByTestId("quantity-unit-fixed")).toHaveTextContent("mg");
	});

	test("typing emits Quantity with value+unit", async () => {
		const onAnswer = vi.fn();
		const screen = render(QuantityQuestion, {
			item: fixedUnitItem,
			value: undefined,
			onAnswer,
		});
		await screen.getByTestId("quantity-value").fill("5");
		const last = onAnswer.mock.calls.at(-1)?.[0];
		expect(last).toMatchObject({ value: 5, unit: "mg" });
	});
});
