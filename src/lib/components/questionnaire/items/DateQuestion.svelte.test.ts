import { CalendarDate } from "@internationalized/date";
import type { QuestionnaireItem } from "fhir/r4";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import DateQuestion from "./DateQuestion.svelte";

const partialItem: QuestionnaireItem = {
	linkId: "d",
	type: "date",
	text: "Date",
	extension: [
		{
			url: "http://phellowseven.com/fhir/StructureDefinition/date-precision-mode",
			valueCode: "partial",
		},
	],
};

const yearOnlyItem: QuestionnaireItem = {
	linkId: "d",
	type: "date",
	text: "Date",
	extension: [
		{
			url: "http://phellowseven.com/fhir/StructureDefinition/date-precision-mode",
			valueCode: "year-only",
		},
	],
};

const fullItem: QuestionnaireItem = {
	linkId: "d",
	type: "date",
	text: "Date",
};

describe("DateQuestion (partial mode)", () => {
	test("prefilled YYYY-MM-DD populates all three inputs (regression: prefill partial date)", async () => {
		const screen = render(DateQuestion, {
			item: partialItem,
			value: "2024-06-15",
			onAnswer: vi.fn(),
		});
		await expect.element(screen.getByTestId("date-year")).toHaveValue(2024);
		await expect.element(screen.getByTestId("date-month")).toHaveValue(6);
		await expect.element(screen.getByTestId("date-day")).toHaveValue(15);
	});

	test("prefilled year-only populates only year", async () => {
		const screen = render(DateQuestion, {
			item: partialItem,
			value: "2024",
			onAnswer: vi.fn(),
		});
		await expect.element(screen.getByTestId("date-year")).toHaveValue(2024);
		await expect.element(screen.getByTestId("date-month")).toHaveValue(null);
		await expect.element(screen.getByTestId("date-day")).toHaveValue(null);
	});

	test("typing year emits the partial date string", async () => {
		const onAnswer = vi.fn();
		const screen = render(DateQuestion, {
			item: partialItem,
			value: undefined,
			onAnswer,
		});
		await screen.getByTestId("date-year").fill("2020");
		expect(onAnswer).toHaveBeenLastCalledWith("2020");
	});

	test("year-only mode hides month and day", async () => {
		const screen = render(DateQuestion, {
			item: yearOnlyItem,
			value: "2024",
			onAnswer: vi.fn(),
		});
		await expect.element(screen.getByTestId("date-year")).toHaveValue(2024);
		// Month/day inputs should not be in the DOM
		expect(document.querySelector('[data-testid="date-month"]')).toBeNull();
		expect(document.querySelector('[data-testid="date-day"]')).toBeNull();
	});
});

describe("DateQuestion (full mode)", () => {
	test("renders without crashing when prefilled with a CalendarDate", async () => {
		const screen = render(DateQuestion, {
			item: fullItem,
			value: new CalendarDate(2024, 6, 15),
			onAnswer: vi.fn(),
		});
		// The trigger button should exist; we don't open the calendar (popover) here.
		await expect.element(screen.getByRole("button")).toBeInTheDocument();
	});
});
