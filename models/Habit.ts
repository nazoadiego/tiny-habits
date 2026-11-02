/*
 Relations
   A habit has many entries
   A habit belongs to one or more Habit Groups
*/

import Entry, { type Status } from './Entry'
import type { HabitFile } from 'platform/Platform'
import DateValue from './DateValue'

type THabit = {
	id: string,
	name: string,
	path: string,
	entries: Entry[]
}

export type InvalidEntry = { date: string, status: unknown }

class Habit implements THabit {
	id
	name
	path
	entries

	constructor({ id, name, path, entries }: THabit) {
		this.id = id
		this.name = name
		this.path = path
		this.entries = entries
	}

	private static parseFile(file: HabitFile) {
		return { id: file.basename, name: file.basename, path: file.path }
	}

	static empty(file: HabitFile): Habit {
		const { id, name, path } = this.parseFile(file)
		return new Habit({ id, name, path, entries: [] })
	}

	/**
	 @description Builds a habit from its file's frontmatter, keeping only the dates in `dateFilter` when given.
	 @returns The habit, plus the frontmatter entries that aren't a valid date and status, so the caller can report them.
	 */
	static fromFile(file: HabitFile, dateFilter?: Set<string>): { habit: Habit, invalidEntries: InvalidEntry[] } {
		const { frontmatter } = file

		if (!frontmatter) return { habit: this.empty(file), invalidEntries: [] }

		const { id: habitId, name, path: habitPath } = this.parseFile(file)
		const invalidEntries: InvalidEntry[] = []

		const entries = Object.entries(frontmatter).flatMap(([date, status]) => {
			if (dateFilter && !dateFilter.has(date)) return []

			if (!Entry.validateFrontmatter({ YMDDate: date, status })) {
				invalidEntries.push({ date, status })
				return []
			}

			return new Entry({ habitId, habitPath, date: new DateValue(date), status: status as Status })
		})

		return { habit: new Habit({ id: habitId, name, path: habitPath, entries }), invalidEntries }
	}

	/* getTodayEntry(): Entry {
	   	const today = new DateValue(new Date())
	   	return this.entries?.find(entry =>  today.isSameDay(entry.date)) || Entry.empty({ habitId: this.id, habitPath: this.path, date: DateValue.empty() }) // TODO: This is a bit wrong, DateValue.empty should be DateValue.today(), empty is more like invalid. Notice how we are using "empty" differently in Entry and in DateValue. In one, it is a placeholder and it is valid. In the other, it's an invalid DateValue.
	   } */
}

export default Habit
