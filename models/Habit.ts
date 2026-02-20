/*
 Relations
   A habit has many entries
   A habit belongs to one or more Habit Groups
*/

import Entry from './Entry'
import { Notice, type FrontMatterCache, type TFile } from 'obsidian'
import DateValue from './DateValue'

type THabit = {
	id: string,
	name: string,
	path: string,
	entries: Entry[]
}

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

	private static parseFile(file: TFile) {
		return { id: file.basename, name: file.basename, path: file.path }
	}

	static empty(file: TFile): Habit {
		const { id, name, path } = this.parseFile(file)
		return new Habit({ id, name, path, entries: [] })
	}

	static fromFile(file: TFile, frontmatter: FrontMatterCache | undefined, dateFilter?: Set<string>): Habit {
		if (!frontmatter) return this.empty(file)

		const { id: habitId, name, path: habitPath } = this.parseFile(file)

		const entries = Object.entries(frontmatter).flatMap(([date, status]) => {
			if (dateFilter && !dateFilter.has(date)) return []

			if (!Entry.validateFrontmatter({ YMDDate: date, status })) {
				new Notice(`Invalid date format or status for entry in Habit file ${file.basename}. Date: ${date}. Status: ${status}`)
				return []
			}

			return new Entry({ habitId, habitPath, date: new DateValue(date), status })
		})

		return new Habit({ id: habitId, name, path: habitPath, entries })
	}

	/* getTodayEntry(): Entry {
	   	const today = new DateValue(new Date())
	   	return this.entries?.find(entry =>  today.isSameDay(entry.date)) || Entry.empty({ habitId: this.id, habitPath: this.path, date: DateValue.empty() }) // TODO: This is a bit wrong, DateValue.empty should be DateValue.today(), empty is more like invalid. Notice how we are using "empty" differently in Entry and in DateValue. In one, it is a placeholder and it is valid. In the other, it's an invalid DateValue.
	   } */
}

export default Habit
