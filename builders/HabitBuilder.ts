import Habit from "models/Habit";
import Entry from "models/Entry";
import DateValue from "models/DateValue";
import type { Status } from "types/TEntry";
import { parseYaml, TFile } from "obsidian";

// * haha get it? habit builder, cool!
export const HabitBuilder = {
	fromFile(file: TFile, data: string): Habit {
		// Extract Frontmatter to a Value Object
		const frontmatter = data.split('---')[1];

		const habitId = file.basename;
		const name = file.basename.replaceAll('-', " ");
		const habitPath = file.path;

		// If the Habit file has no frontmatter, return empty Entries array 
		if (!frontmatter) return new Habit({ id: habitId, name, path: habitPath, entries: [] })

		// TODO: Handle parsing yaml errors
		const rawEntryData = parseYaml(frontmatter);

		const entries = Array.from(
			Object.entries(rawEntryData),
			([date, status]) =>
				DateValue.validate(date)
					? new Entry({ habitId, habitPath, date: new DateValue(date), status: status as Status })
					: undefined
		)
		
		const validEntries = entries.filter((entry): entry is Entry => {
			if (!entry) {
				console.warn(`Invalid date format for habit ${file.basename}`);
				return false;
			}

			return true;
		});

		return new Habit({ id: habitId, name, path: habitPath, entries: validEntries })
	}
};