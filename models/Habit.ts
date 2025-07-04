// Relations
// A habit has many entries
// A habit belongs to one or more Habit Groups

import type { THabit } from "types/THabit";
import type Entry from "./Entry";
import type { TFile } from "obsidian";

class Habit implements THabit {
	id: string;
	name: string;
	path: string
	entries: Entry[]

	constructor({ id, name, path, entries }: THabit) {
		this.id = id
		this.name = name
		this.path = path
		this.entries = entries
	}

	static validate(): boolean { return true }
	 
	static empty(file: TFile): Habit {
		const id = file.basename;
		const name = file.basename;
		const path = file.path;

		return new Habit({ id, name, path, entries: [] });
	}
}

export default Habit