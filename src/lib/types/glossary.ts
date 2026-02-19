export type GlossaryTerm = {
	term: string;
	definition: string;
	alternativeTerms?: string[];
	keywords?: string[];
	parentCategory?: string;
};

export type LetterGroup = {
	letter: string;
	terms: GlossaryTerm[];
};

const collator = new Intl.Collator("de");

function normalizeFirstLetter(term: string): string {
	return term
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.charAt(0)
		.toUpperCase();
}

export function groupTermsByLetter(terms: GlossaryTerm[]): LetterGroup[] {
	const grouped = new Map<string, GlossaryTerm[]>();

	for (const entry of terms) {
		const letter = normalizeFirstLetter(entry.term);
		const group = grouped.get(letter);
		if (group) {
			group.push(entry);
		} else {
			grouped.set(letter, [entry]);
		}
	}

	return Array.from(grouped.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([letter, groupTerms]) => ({
			letter,
			terms: groupTerms.sort((a, b) => collator.compare(a.term, b.term)),
		}));
}
