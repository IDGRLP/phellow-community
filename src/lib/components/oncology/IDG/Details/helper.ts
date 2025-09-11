const obdsTherapieEndeCodes: Record<string, string> = {
	E: "reguläres Ende",
	R: "reguläres Ende mit Dosisreduktion",
	W: "reguläres Ende mit Substanzwechsel",
	A: "Abbruch wegen Nebenwirkungen",
	P: "Abbruch wegen Progress",
	S: "Abbruch aus sonstigen Gründen",
	V: "Patient verweigert weitere Therapie",
	T: "Patient verstorben",
	F: "Zieldosis erreicht mit Unterbrechung > 3 Kalendertage",
	U: "unbekannt",
};

export { obdsTherapieEndeCodes };
