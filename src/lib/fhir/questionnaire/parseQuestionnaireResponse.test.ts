import type { QuestionnaireAnswer } from "$lib/stores/questionnaireStore.svelte";
import { CalendarDate, CalendarDateTime, Time } from "@internationalized/date";
import type { Questionnaire, QuestionnaireResponse } from "fhir/r4";
import { SvelteMap } from "svelte/reactivity";
import { describe, expect, test } from "vitest";
import { createQuestionnaireResponse } from "./createQuestionnaireResponse";
import {
	CUSTOM_OPEN_CHOICE_CODE_PREFIX,
	parseQuestionnaireResponse,
} from "./parseQuestionnaireResponse";

const baseQ = (item: Questionnaire["item"]): Questionnaire => ({
	resourceType: "Questionnaire",
	status: "active",
	id: "q",
	item,
});

const baseR = (item: QuestionnaireResponse["item"]): QuestionnaireResponse => ({
	resourceType: "QuestionnaireResponse",
	status: "completed",
	questionnaire: "q",
	item,
});

describe("parseQuestionnaireResponse", () => {
	test("boolean", () => {
		const q = baseQ([{ linkId: "b", type: "boolean", text: "B" }]);
		const r = baseR([{ linkId: "b", answer: [{ valueBoolean: true }] }]);
		const m = parseQuestionnaireResponse(q, r);
		expect(m.get("b")?.value).toBe(true);
	});

	test("decimal and integer", () => {
		const q = baseQ([
			{ linkId: "d", type: "decimal", text: "" },
			{ linkId: "i", type: "integer", text: "" },
		]);
		const r = baseR([
			{ linkId: "d", answer: [{ valueDecimal: 1.5 }] },
			{ linkId: "i", answer: [{ valueInteger: 7 }] },
		]);
		const m = parseQuestionnaireResponse(q, r);
		expect(m.get("d")?.value).toBe(1.5);
		expect(m.get("i")?.value).toBe(7);
	});

	test("date full → CalendarDate", () => {
		const q = baseQ([{ linkId: "dt", type: "date", text: "" }]);
		const r = baseR([{ linkId: "dt", answer: [{ valueDate: "2024-06-15" }] }]);
		const m = parseQuestionnaireResponse(q, r);
		const v = m.get("dt")?.value;
		expect(v).toBeInstanceOf(CalendarDate);
		expect(v.year).toBe(2024);
		expect(v.month).toBe(6);
		expect(v.day).toBe(15);
	});

	test("date partial year", () => {
		const q = baseQ([{ linkId: "y", type: "date", text: "" }]);
		const r = baseR([{ linkId: "y", answer: [{ valueDate: "2024" }] }]);
		expect(parseQuestionnaireResponse(q, r).get("y")?.value).toBe("2024");
	});

	test("date partial year-month", () => {
		const q = baseQ([{ linkId: "ym", type: "date", text: "" }]);
		const r = baseR([{ linkId: "ym", answer: [{ valueDate: "2024-05" }] }]);
		expect(parseQuestionnaireResponse(q, r).get("ym")?.value).toBe("2024-05");
	});

	test("dateTime → CalendarDateTime", () => {
		const q = baseQ([{ linkId: "dtt", type: "dateTime", text: "" }]);
		const r = baseR([{ linkId: "dtt", answer: [{ valueDateTime: "2024-06-15T10:30:45" }] }]);
		const v = parseQuestionnaireResponse(q, r).get("dtt")?.value;
		expect(v).toBeInstanceOf(CalendarDateTime);
		expect(v.year).toBe(2024);
		expect(v.hour).toBe(10);
		expect(v.minute).toBe(30);
		expect(v.second).toBe(45);
	});

	test("time → Time", () => {
		const q = baseQ([{ linkId: "t", type: "time", text: "" }]);
		const r = baseR([{ linkId: "t", answer: [{ valueTime: "14:25:30" }] }]);
		const v = parseQuestionnaireResponse(q, r).get("t")?.value;
		expect(v).toBeInstanceOf(Time);
		expect(v.hour).toBe(14);
		expect(v.minute).toBe(25);
		expect(v.second).toBe(30);
	});

	test("string and text", () => {
		const q = baseQ([
			{ linkId: "s", type: "string", text: "" },
			{ linkId: "tx", type: "text", text: "" },
		]);
		const r = baseR([
			{ linkId: "s", answer: [{ valueString: "hi" }] },
			{ linkId: "tx", answer: [{ valueString: "long text" }] },
		]);
		const m = parseQuestionnaireResponse(q, r);
		expect(m.get("s")?.value).toBe("hi");
		expect(m.get("tx")?.value).toBe("long text");
	});

	test("url → valueUri", () => {
		const q = baseQ([{ linkId: "u", type: "url", text: "" }]);
		const r = baseR([{ linkId: "u", answer: [{ valueUri: "https://example.com" }] }]);
		expect(parseQuestionnaireResponse(q, r).get("u")?.value).toBe("https://example.com");
	});

	test("choice single Coding", () => {
		const q = baseQ([{ linkId: "c", type: "choice", text: "" }]);
		const r = baseR([{ linkId: "c", answer: [{ valueCoding: { code: "yes", display: "Yes" } }] }]);
		expect(parseQuestionnaireResponse(q, r).get("c")?.value).toEqual({
			code: "yes",
			display: "Yes",
		});
	});

	test("choice single string", () => {
		const q = baseQ([{ linkId: "c", type: "choice", text: "" }]);
		const r = baseR([{ linkId: "c", answer: [{ valueString: "raw" }] }]);
		expect(parseQuestionnaireResponse(q, r).get("c")?.value).toBe("raw");
	});

	test("choice multi (repeats)", () => {
		const q = baseQ([{ linkId: "cm", type: "choice", text: "", repeats: true }]);
		const r = baseR([
			{
				linkId: "cm",
				answer: [
					{ valueCoding: { code: "a", display: "A" } },
					{ valueCoding: { code: "b", display: "B" } },
				],
			},
		]);
		expect(parseQuestionnaireResponse(q, r).get("cm")?.value).toEqual([
			{ code: "a", display: "A" },
			{ code: "b", display: "B" },
		]);
	});

	test("open-choice with custom valueString", () => {
		const q = baseQ([{ linkId: "oc", type: "open-choice", text: "" }]);
		const r = baseR([{ linkId: "oc", answer: [{ valueString: "my custom" }] }]);
		expect(parseQuestionnaireResponse(q, r).get("oc")?.value).toEqual({
			code: CUSTOM_OPEN_CHOICE_CODE_PREFIX,
			text: "my custom",
		});
	});

	test("open-choice with regular Coding", () => {
		const q = baseQ([{ linkId: "oc", type: "open-choice", text: "" }]);
		const r = baseR([
			{ linkId: "oc", answer: [{ valueCoding: { code: "x", display: "X label" } }] },
		]);
		expect(parseQuestionnaireResponse(q, r).get("oc")?.value).toEqual({
			code: "x",
			text: "X label",
		});
	});

	test("quantity passthrough", () => {
		const q = baseQ([{ linkId: "qt", type: "quantity", text: "" }]);
		const quantity = { value: 5, unit: "kg", system: "http://unitsofmeasure.org", code: "kg" };
		const r = baseR([{ linkId: "qt", answer: [{ valueQuantity: quantity }] }]);
		expect(parseQuestionnaireResponse(q, r).get("qt")?.value).toEqual(quantity);
	});

	test("missing answers excluded from map", () => {
		const q = baseQ([
			{ linkId: "a", type: "string", text: "" },
			{ linkId: "b", type: "string", text: "" },
		]);
		const r = baseR([{ linkId: "a", answer: [{ valueString: "x" }] }]);
		const m = parseQuestionnaireResponse(q, r);
		expect(m.has("a")).toBe(true);
		expect(m.has("b")).toBe(false);
	});

	test("unknown linkId in response is ignored", () => {
		const q = baseQ([{ linkId: "a", type: "string", text: "" }]);
		const r = baseR([
			{ linkId: "a", answer: [{ valueString: "x" }] },
			{ linkId: "ghost", answer: [{ valueString: "y" }] },
		]);
		const m = parseQuestionnaireResponse(q, r);
		expect(m.size).toBe(1);
		expect(m.has("ghost")).toBe(false);
	});

	test("recurses into nested groups", () => {
		const q = baseQ([
			{
				linkId: "g",
				type: "group",
				text: "",
				item: [
					{
						linkId: "g2",
						type: "group",
						text: "",
						item: [{ linkId: "leaf", type: "string", text: "" }],
					},
				],
			},
		]);
		const r = baseR([
			{
				linkId: "g",
				item: [
					{
						linkId: "g2",
						item: [{ linkId: "leaf", answer: [{ valueString: "deep" }] }],
					},
				],
			},
		]);
		expect(parseQuestionnaireResponse(q, r).get("leaf")?.value).toBe("deep");
	});
});

describe("round-trip createQuestionnaireResponse → parseQuestionnaireResponse", () => {
	test("preserves all primitive types", () => {
		const q = baseQ([
			{ linkId: "b", type: "boolean", text: "" },
			{ linkId: "d", type: "decimal", text: "" },
			{ linkId: "i", type: "integer", text: "" },
			{ linkId: "s", type: "string", text: "" },
			{ linkId: "u", type: "url", text: "" },
			{ linkId: "y", type: "date", text: "" },
			{ linkId: "ym", type: "date", text: "" },
			{ linkId: "dt", type: "date", text: "" },
		]);
		const original = new SvelteMap<string, QuestionnaireAnswer>();
		original.set("b", { linkId: "b", value: false });
		original.set("d", { linkId: "d", value: 3.14 });
		original.set("i", { linkId: "i", value: 42 });
		original.set("s", { linkId: "s", value: "hello" });
		original.set("u", { linkId: "u", value: "https://x.test" });
		original.set("y", { linkId: "y", value: "2020" });
		original.set("ym", { linkId: "ym", value: "2020-04" });
		original.set("dt", { linkId: "dt", value: new CalendarDate(2020, 4, 9) });

		const response = createQuestionnaireResponse(q, original);
		const parsed = parseQuestionnaireResponse(q, response);

		expect(parsed.get("b")?.value).toBe(false);
		expect(parsed.get("d")?.value).toBe(3.14);
		expect(parsed.get("i")?.value).toBe(42);
		expect(parsed.get("s")?.value).toBe("hello");
		expect(parsed.get("u")?.value).toBe("https://x.test");
		expect(parsed.get("y")?.value).toBe("2020");
		expect(parsed.get("ym")?.value).toBe("2020-04");
		const dtVal = parsed.get("dt")?.value as CalendarDate;
		expect(dtVal).toBeInstanceOf(CalendarDate);
		expect({ y: dtVal.year, m: dtVal.month, d: dtVal.day }).toEqual({ y: 2020, m: 4, d: 9 });
	});

	test("preserves single Coding choice", () => {
		const q = baseQ([{ linkId: "c", type: "choice", text: "" }]);
		const original = new SvelteMap<string, QuestionnaireAnswer>();
		original.set("c", { linkId: "c", value: { code: "yes", display: "Ja" } });

		const parsed = parseQuestionnaireResponse(q, createQuestionnaireResponse(q, original));
		expect(parsed.get("c")?.value).toEqual({ code: "yes", display: "Ja" });
	});

	test("preserves multi-choice arrays", () => {
		const q = baseQ([{ linkId: "cm", type: "choice", text: "", repeats: true }]);
		const original = new SvelteMap<string, QuestionnaireAnswer>();
		original.set("cm", {
			linkId: "cm",
			value: [
				{ code: "a", display: "A" },
				{ code: "b", display: "B" },
			],
		});

		const parsed = parseQuestionnaireResponse(q, createQuestionnaireResponse(q, original));
		expect(parsed.get("cm")?.value).toEqual([
			{ code: "a", display: "A" },
			{ code: "b", display: "B" },
		]);
	});

	test("preserves open-choice custom value", () => {
		const q = baseQ([{ linkId: "oc", type: "open-choice", text: "" }]);
		const original = new SvelteMap<string, QuestionnaireAnswer>();
		original.set("oc", {
			linkId: "oc",
			value: { code: CUSTOM_OPEN_CHOICE_CODE_PREFIX, text: "freeform" },
		});

		const parsed = parseQuestionnaireResponse(q, createQuestionnaireResponse(q, original));
		expect(parsed.get("oc")?.value).toEqual({
			code: CUSTOM_OPEN_CHOICE_CODE_PREFIX,
			text: "freeform",
		});
	});

	test("preserves open-choice coded value", () => {
		const q = baseQ([{ linkId: "oc", type: "open-choice", text: "" }]);
		const original = new SvelteMap<string, QuestionnaireAnswer>();
		original.set("oc", { linkId: "oc", value: { code: "x", text: "X label" } });

		const parsed = parseQuestionnaireResponse(q, createQuestionnaireResponse(q, original));
		expect(parsed.get("oc")?.value).toEqual({ code: "x", text: "X label" });
	});

	test("preserves quantity", () => {
		const q = baseQ([{ linkId: "qt", type: "quantity", text: "" }]);
		const original = new SvelteMap<string, QuestionnaireAnswer>();
		original.set("qt", {
			linkId: "qt",
			value: { value: 12, unit: "mg", system: "http://unitsofmeasure.org", code: "mg" },
		});

		const parsed = parseQuestionnaireResponse(q, createQuestionnaireResponse(q, original));
		expect(parsed.get("qt")?.value).toEqual({
			value: 12,
			unit: "mg",
			system: "http://unitsofmeasure.org",
			code: "mg",
		});
	});

	test("preserves Time", () => {
		const q = baseQ([{ linkId: "t", type: "time", text: "" }]);
		const original = new SvelteMap<string, QuestionnaireAnswer>();
		original.set("t", { linkId: "t", value: new Time(9, 5, 0) });

		const parsed = parseQuestionnaireResponse(q, createQuestionnaireResponse(q, original));
		const v = parsed.get("t")?.value as Time;
		expect(v).toBeInstanceOf(Time);
		expect({ h: v.hour, m: v.minute, s: v.second }).toEqual({ h: 9, m: 5, s: 0 });
	});
});
