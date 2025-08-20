import Habit from "models/Habit";
import Entry, { type Status } from "models/Entry";
import DateValue from "models/DateValue";
import { TFile, type FrontMatterCache } from "obsidian";

// * haha get it? habit builder, cool!
export const HabitBuilder = {
	fromFile(file: TFile, frontmatter: FrontMatterCache | undefined): Habit {
		const habitId = file.basename;
		const name = file.basename.replaceAll('-', " ");
		const habitPath = file.path;

		// If the Habit file has no frontmatter, return empty Entries array 
		if (!frontmatter) return new Habit({ id: habitId, name, path: habitPath, entries: [] })

		const entries = Array.from(
			Object.entries(frontmatter),
			([date, status]) =>
				DateValue.validate(date)
					? new Entry({ habitId, habitPath, date: new DateValue(date), status: status as Status })
					: undefined // TODO: return an invalid (not empty) Entry instead? that way don't need to filter after.
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