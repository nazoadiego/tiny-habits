/*
 Relations
   A habit has many entries
   A habit belongs to one or more Habit Groups
*/

import Entry, { type Status } from './Entry'
import type { HabitFile } from 'platform/Platform'
import DateValue from './DateValue'
import Schedule from './Schedule'
import type { Cadence } from './Cadence'

type THabit = {
	id: string,
	name: string,
	path: string,
	entries: Entry[],
	schedule?: Schedule,
	cadence?: Cadence,
	order?: number
}

export type InvalidEntry = { date: string, status: unknown }

export type HabitNameResult =
	| { name: string, message?: undefined }
	| { name?: undefined, message: string }

// Characters Obsidian refuses in file names (\ / : * ? " < > |), plus the ones its links can't hold (# ^ [ ]).
const FORBIDDEN_NAME_CHARACTERS = /[\\/:*?"<>|#^[\]]/

class Habit implements THabit {
	id
	name
	path
	entries
	schedule
	cadence
	/** Where the user put the habit in the table. Undefined until they reorder. */
	order

	/** The frontmatter property that holds the schedule. It is not a date, so it is never read as an entry. */
	static readonly SCHEDULE_KEY = 'schedule'

	/** The frontmatter property that holds the habit's position in the table. Not a date, so it is never read as an entry. */
	static readonly ORDER_KEY = 'order'

	constructor({ id, name, path, entries, schedule = Schedule.unscheduled(), cadence = 'day', order }: THabit) {
		this.id = id
		this.name = name
		this.path = path
		this.entries = entries
		this.schedule = schedule
		this.cadence = cadence
		this.order = order
	}

	/**
	 @description A habit's name is its note's name, so it must be a valid file name in Obsidian.
	 @param input What the user typed.
	 @returns The trimmed name, or a message saying what to fix.
	 */
	static parseName(input: string): HabitNameResult {
		const name = input.trim()

		if (name === '') return { message: 'Give the habit a name' }

		const forbidden = FORBIDDEN_NAME_CHARACTERS.exec(name)?.[0]
		if (forbidden != undefined) return { message: `A habit name can't contain "${forbidden}"` }

		if (name.startsWith('.')) return { message: 'A habit name can\'t start with "."' }

		return { name }
	}

	/** An order that isn't a number counts as no order, so the habit sorts after the ordered ones. */
	private static parseOrder(value: unknown) {
		return typeof value === 'number' && Number.isFinite(value) ? value : undefined
	}

	private static parseFile(file: HabitFile) {
		return { id: file.basename, name: file.basename, path: file.path }
	}

	static empty(file: HabitFile, cadence: Cadence = 'day'): Habit {
		const { id, name, path } = this.parseFile(file)
		return new Habit({ id, name, path, entries: [], cadence })
	}

	/**
	 @description Builds a habit from its file's frontmatter, keeping only the dates in `dateFilter` when given.
		The habit's cadence is `cadence`, the one of the table it is in.
	 @returns
		The habit, plus what the caller should report: the frontmatter entries that aren't a valid date and status,
		and whether the `schedule` property was invalid (the habit then applies every day).
	 */
	static fromFile(file: HabitFile, dateFilter?: Set<string>, cadence: Cadence = 'day'): { habit: Habit, invalidEntries: InvalidEntry[], hasInvalidSchedule: boolean } {
		const { frontmatter } = file

		if (!frontmatter) return { habit: this.empty(file, cadence), invalidEntries: [], hasInvalidSchedule: false }

		const { id: habitId, name, path: habitPath } = this.parseFile(file)
		const invalidEntries: InvalidEntry[] = []

		const { schedule, isValid: isScheduleValid } = Schedule.fromFrontmatter(frontmatter[Habit.SCHEDULE_KEY])

		const order = this.parseOrder(frontmatter[Habit.ORDER_KEY])

		const entries = Object.entries(frontmatter).flatMap(([date, status]) => {
			if (date === Habit.SCHEDULE_KEY || date === Habit.ORDER_KEY) return []

			if (dateFilter && !dateFilter.has(date)) return []

			if (!Entry.validateFrontmatter({ YMDDate: date, status })) {
				invalidEntries.push({ date, status })
				return []
			}

			return new Entry({ habitId, habitPath, date: new DateValue(date), status: status as Status })
		})

		return { habit: new Habit({ id: habitId, name, path: habitPath, entries, schedule, cadence, order }), invalidEntries, hasInvalidSchedule: !isScheduleValid }
	}

	/**
	 @description
		Whether the entry is on a day the schedule skips and nobody has marked it.
		Such an entry shows as skipped, but nothing is written for it: marking it works like any other entry.
	 */
	isOffDay(entry: Entry) {
		return this.cadence === 'day' && entry.status === Entry.STATUS.unstarted && !this.schedule.appliesOn(entry.date)
	}

	/* getTodayEntry(): Entry {
	   	const today = new DateValue(new Date())
	   	return this.entries?.find(entry =>  today.isSameDay(entry.date)) || Entry.empty({ habitId: this.id, habitPath: this.path, date: DateValue.empty() }) // TODO: This is a bit wrong, DateValue.empty should be DateValue.today(), empty is more like invalid. Notice how we are using "empty" differently in Entry and in DateValue. In one, it is a placeholder and it is valid. In the other, it's an invalid DateValue.
	   } */
}

export default Habit
