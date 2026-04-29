import type { QuestionnaireAnswer } from "$lib/stores/questionnaireStore.svelte";
import { CalendarDate, Time } from "@internationalized/date";
import type {
	Questionnaire,
	QuestionnaireResponse,
	QuestionnaireResponseItem,
	QuestionnaireResponseItemAnswer,
	Reference,
} from "fhir/r4";

export interface QuestionnaireResponseReferences {
	subject?: Reference;
	source?: Reference;
}

/**
 * Creates a FHIR QuestionnaireResponse from the given questionnaire and answers.
 *
 * If `enabledItems` is provided, items whose linkId is not in the set are
 * excluded from the response. This prevents stale answers from disabled
 * enableWhen branches from leaking into the output when a user edits an
 * existing response and toggles a conditional branch off.
 */
export function createQuestionnaireResponse(
	questionnaire: Questionnaire,
	answers: Map<string, QuestionnaireAnswer>,
	references?: QuestionnaireResponseReferences,
	enabledItems?: ReadonlySet<string>
): QuestionnaireResponse {
	const now = new Date().toISOString();

	// Create the base QuestionnaireResponse structure
	const response: QuestionnaireResponse = {
		resourceType: "QuestionnaireResponse",
		status: "completed",
		questionnaire: questionnaire.url ?? questionnaire.id ?? "",
		authored: now,
		item: mapAnswersToResponseItems(questionnaire.item ?? [], answers, enabledItems),
	};

	// Add metadata
	if (questionnaire.id) {
		response.questionnaire = questionnaire.id;
	}

	if (references?.subject) {
		response.subject = references.subject;
	}
	if (references?.source) {
		response.source = references.source;
	}

	return response;
}

/**
 * Maps questionnaire items and their answers to QuestionnaireResponse items
 */
function mapAnswersToResponseItems(
	items: Questionnaire["item"],
	answers: Map<string, QuestionnaireAnswer>,
	enabledItems?: ReadonlySet<string>
): QuestionnaireResponse["item"] {
	if (!items) return [];

	return items
		.map((item) => {
			const isEnabled = enabledItems ? enabledItems.has(item.linkId) : true;
			const answer = isEnabled ? answers.get(item.linkId) : undefined;

			const responseItem: QuestionnaireResponseItem = {
				linkId: item.linkId,
				text: item.text,
			};

			// Add answer if exists and the item is enabled
			if (answer) {
				responseItem.answer = mapValueToResponseAnswer(item.type, answer.value);
			}

			// Add child items if they exist
			if (item.item && item.item.length > 0) {
				const childItems = mapAnswersToResponseItems(item.item, answers, enabledItems);
				if (childItems && childItems.length > 0) {
					responseItem.item = childItems;
				}
			}

			return responseItem;
		})
		.filter((responseItem) => {
			// Include items that either have an answer or have non-empty child items
			return (
				(responseItem.answer && responseItem.answer.length > 0) ||
				(responseItem.item && responseItem.item.length > 0)
			);
		});
}

/**
 * Maps a value to the appropriate QuestionnaireResponse answer format
 * based on the item type
 */
function mapValueToResponseAnswer(
	type: string | undefined,
	value: any
): QuestionnaireResponseItemAnswer[] {
	if (value === undefined || value === null) {
		return [{}]; // Empty answer
	}

	switch (type) {
		case "boolean":
			return [{ valueBoolean: value }];

		case "decimal":
			return [{ valueDecimal: value }];

		case "integer":
			return [{ valueInteger: value }];

		case "date":
			// Handle CalendarDate from @internationalized/date
			if (value instanceof CalendarDate) {
				return [
					{
						valueDate: `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`,
					},
				];
			}
			// Handle partial date strings (year, year-month, year-month-day)
			if (typeof value === "string" && /^\d{4}(-\d{2})?(-\d{2})?$/.test(value)) {
				return [{ valueDate: value }];
			}
			return [{ valueDate: value }];

		case "dateTime":
			// Handle DateValue from @internationalized/date
			if (value && typeof value === "object" && "year" in value) {
				const month = String(value.month).padStart(2, "0");
				const day = String(value.day).padStart(2, "0");
				let dateTimeStr = `${value.year}-${month}-${day}`;

				// Add time if available
				if ("hour" in value) {
					const hour = String(value.hour).padStart(2, "0");
					const minute = String(value.minute || 0).padStart(2, "0");
					const second = String(value.second || 0).padStart(2, "0");
					dateTimeStr += `T${hour}:${minute}:${second}`;
				}

				return [{ valueDateTime: dateTimeStr }];
			}
			return [{ valueDateTime: value }];

		case "time":
			// Handle Time from @internationalized/date
			if (value instanceof Time) {
				return [
					{
						valueTime: `${String(value.hour).padStart(2, "0")}:${String(value.minute).padStart(2, "0")}:${String(value.second || 0).padStart(2, "0")}`,
					},
				];
			}
			return [{ valueTime: value }];

		case "string":
		case "text":
			return [{ valueString: value }];

		case "url":
			return [{ valueUri: value }];
		case "choice":
			// Handle choice selections
			if (typeof value === "string") {
				return [{ valueString: value }];
			} else if (typeof value === "object" && value.code && value.display) {
				return [{ valueCoding: { code: value.code, display: value.display } }];
			} else if (Array.isArray(value)) {
				if (typeof value[0] === "string") {
					return value.map((v) => ({ valueString: v }));
				} else if (typeof value[0] === "object" && value[0].code && value[0].display) {
					return value.map((v) => ({ valueCoding: { code: v.code, display: v.display } }));
				}
			}
			return [{ valueCoding: { code: value, display: value } }];

		case "open-choice":
			// Handle open choice selections which return { code, text }
			if (typeof value === "object" && value.code && value.text) {
				if (value.code.startsWith("phellow-community:customOpenChoice")) {
					return [{ valueString: value.text }];
				}
				return [{ valueCoding: { code: value.code, display: value.text } }];
			}
			return [{ valueString: value }];

		case "quantity":
			// Handle FHIR Quantity objects
			if (typeof value === "object" && value.value !== undefined) {
				return [{ valueQuantity: value }];
			}
			return [{}];

		default:
			// Default to string for unknown types
			return [{ valueString: String(value) }];
	}
}
