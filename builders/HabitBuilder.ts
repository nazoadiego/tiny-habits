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

		const id = file.basename;
		const name = file.basename.replaceAll('-', " ");
		const path = file.path;

		// If the Habit file has no frontmatter, return empty Entries array 
		if (!frontmatter) return new Habit({ id, name, path, entries: [] })

		// TODO: Handle parsing yaml errors
		const rawEntryData = parseYaml(frontmatter);

		const entries = Array.from(
			Object.entries(rawEntryData),
			([date, status]) =>
				DateValue.validate(date)
					? new Entry(new DateValue(date), status as Status)
					: undefined
		)
		
		const validEntries = entries.filter((entry): entry is Entry => {
			if (!entry) {
				console.warn(`Invalid date format for habit ${file.basename}`);
				return false;
			}

			return true;
		});

		return new Habit({ id, name, path, entries: validEntries })
	}
};