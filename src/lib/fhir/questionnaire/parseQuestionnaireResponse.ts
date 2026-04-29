import type { QuestionnaireAnswer } from "$lib/stores/questionnaireStore.svelte";
import { CalendarDate, CalendarDateTime, Time } from "@internationalized/date";
import type {
	Coding,
	Questionnaire,
	QuestionnaireItem,
	QuestionnaireResponse,
	QuestionnaireResponseItem,
	QuestionnaireResponseItemAnswer,
} from "fhir/r4";

export const CUSTOM_OPEN_CHOICE_CODE_PREFIX = "phellow-community:customOpenChoice";

/**
 * Inverse of createQuestionnaireResponse: walks a FHIR QuestionnaireResponse
 * and produces a Map<linkId, QuestionnaireAnswer> matching the internal
 * value shapes used by the question components.
 */
export function parseQuestionnaireResponse(
	questionnaire: Questionnaire,
	response: QuestionnaireResponse
): Map<string, QuestionnaireAnswer> {
	const itemsByLinkId = indexQuestionnaireItems(questionnaire.item ?? []);
	const answers = new Map<string, QuestionnaireAnswer>();
	walkResponseItems(response.item ?? [], itemsByLinkId, answers);
	return answers;
}

function indexQuestionnaireItems(
	items: QuestionnaireItem[],
	out: Map<string, QuestionnaireItem> = new Map()
): Map<string, QuestionnaireItem> {
	for (const item of items) {
		out.set(item.linkId, item);
		if (item.item?.length) {
			indexQuestionnaireItems(item.item, out);
		}
	}
	return out;
}

function walkResponseItems(
	items: QuestionnaireResponseItem[],
	itemsByLinkId: Map<string, QuestionnaireItem>,
	out: Map<string, QuestionnaireAnswer>
) {
	for (const responseItem of items) {
		const qItem = itemsByLinkId.get(responseItem.linkId);
		if (qItem && responseItem.answer && responseItem.answer.length > 0) {
			const value = parseAnswers(qItem, responseItem.answer);
			if (value !== undefined) {
				out.set(responseItem.linkId, { linkId: responseItem.linkId, value });
			}
		}
		if (responseItem.item && responseItem.item.length > 0) {
			walkResponseItems(responseItem.item, itemsByLinkId, out);
		}
	}
}

function parseAnswers(
	item: QuestionnaireItem,
	answers: QuestionnaireResponseItemAnswer[]
): unknown {
	const type = item.type;

	if (type === "choice") {
		const values = answers.map((a) => parseChoiceAnswer(a)).filter((v) => v !== undefined);
		if (values.length === 0) return undefined;
		if (item.repeats) return values;
		return values[0];
	}

	const first = answers[0];
	if (!first) return undefined;
	return parseSingleAnswer(type, first);
}

function parseChoiceAnswer(answer: QuestionnaireResponseItemAnswer): string | Coding | undefined {
	if (answer.valueCoding) {
		const { code, display } = answer.valueCoding;
		return { code, display } as Coding;
	}
	if (answer.valueString !== undefined) return answer.valueString;
	return undefined;
}

function parseSingleAnswer(
	type: string | undefined,
	answer: QuestionnaireResponseItemAnswer
): unknown {
	switch (type) {
		case "boolean":
			return answer.valueBoolean;

		case "decimal":
			return answer.valueDecimal;

		case "integer":
			return answer.valueInteger;

		case "date":
			return parseDateValue(answer.valueDate);

		case "dateTime":
			return parseDateTimeValue(answer.valueDateTime);

		case "time":
			return parseTimeValue(answer.valueTime);

		case "string":
		case "text":
			return answer.valueString;

		case "url":
			return answer.valueUri;

		case "open-choice":
			return parseOpenChoiceAnswer(answer);

		case "quantity":
			return answer.valueQuantity;

		default:
			return answer.valueString ?? undefined;
	}
}

function parseDateValue(value: string | undefined): CalendarDate | string | undefined {
	if (!value) return undefined;
	const fullMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (fullMatch) {
		const [, y, m, d] = fullMatch;
		return new CalendarDate(parseInt(y), parseInt(m), parseInt(d));
	}
	if (/^\d{4}(-\d{2})?$/.test(value)) return value;
	return value;
}

function parseDateTimeValue(value: string | undefined): CalendarDateTime | undefined {
	if (!value) return undefined;
	const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(value);
	if (!match) return undefined;
	const [, y, mo, d, h, mi, s] = match;
	return new CalendarDateTime(
		parseInt(y),
		parseInt(mo),
		parseInt(d),
		h ? parseInt(h) : 0,
		mi ? parseInt(mi) : 0,
		s ? parseInt(s) : 0
	);
}

function parseTimeValue(value: string | undefined): Time | undefined {
	if (!value) return undefined;
	const [h, m, s] = value.split(":");
	return new Time(parseInt(h ?? "0"), parseInt(m ?? "0"), s ? parseInt(s) : 0);
}

function parseOpenChoiceAnswer(
	answer: QuestionnaireResponseItemAnswer
): { code: string; text: string } | undefined {
	if (answer.valueCoding) {
		const { code, display } = answer.valueCoding;
		return { code: code ?? "", text: display ?? code ?? "" };
	}
	if (answer.valueString !== undefined) {
		return { code: CUSTOM_OPEN_CHOICE_CODE_PREFIX, text: answer.valueString };
	}
	return undefined;
}
