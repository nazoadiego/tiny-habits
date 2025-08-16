// Relations
// A habit has many entries
// A habit belongs to one or more Habit Groups

import type { THabit } from "types/THabit";
import Entry from "./Entry";
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

	// getTodayEntry(): Entry {
	// 	const today = new DateValue(new Date())
	// 	return this.entries?.find(entry =>  today.isSameDay(entry.date)) || Entry.empty({ habitId: this.id, habitPath: this.path, date: DateValue.empty() }) // TODO: This is a bit wrong, DateValue.empty should be DateValue.today(), empty is more like invalid. Notice how we are using "empty" differently in Entry and in DateValue. In one, it is a placeholder and it is valid. In the other, it's an invalid DateValue.
	// }
}

export default Habit