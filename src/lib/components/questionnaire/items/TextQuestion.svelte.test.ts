import type { QuestionnaireItem } from "fhir/r4";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import TextQuestion from "./TextQuestion.svelte";

const stringItem: QuestionnaireItem = { linkId: "s", type: "string", text: "Name" };
const textItem: QuestionnaireItem = { linkId: "t", type: "text", text: "Notes" };
const urlItem: QuestionnaireItem = { linkId: "u", type: "url", text: "Homepage" };

describe("TextQuestion", () => {
	test("string: prefilled value renders in input", async () => {
		const screen = render(TextQuestion, {
			item: stringItem,
			value: "hello",
			onAnswer: vi.fn(),
		});
		await expect.element(screen.getByRole("textbox")).toHaveValue("hello");
	});

	test("text: prefilled value renders in textarea", async () => {
		const screen = render(TextQuestion, {
			item: textItem,
			value: "longer text",
			onAnswer: vi.fn(),
		});
		await expect.element(screen.getByRole("textbox")).toHaveValue("longer text");
	});

	test("url: prefilled value renders in url input", async () => {
		const screen = render(TextQuestion, {
			item: urlItem,
			value: "https://x.test",
			onAnswer: vi.fn(),
		});
		await expect.element(screen.getByRole("textbox")).toHaveValue("https://x.test");
	});

	test("typing calls onAnswer with the new value", async () => {
		const onAnswer = vi.fn();
		const screen = render(TextQuestion, {
			item: stringItem,
			value: "",
			onAnswer,
		});
		await screen.getByRole("textbox").fill("new");
		expect(onAnswer).toHaveBeenLastCalledWith("new");
	});

	test("respects maxLength: rejects input over limit", async () => {
		const onAnswer = vi.fn();
		const screen = render(TextQuestion, {
			item: { ...stringItem, maxLength: 3 },
			value: "",
			onAnswer,
		});
		await screen.getByRole("textbox").fill("abcd");
		// last accepted call must be at most 3 chars
		const lastCall = onAnswer.mock.calls.at(-1)?.[0] as string | undefined;
		if (lastCall !== undefined) {
			expect(lastCall.length).toBeLessThanOrEqual(3);
		}
	});
});
