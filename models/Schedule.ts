import type DateValue from './DateValue'

export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

export type Weekday = typeof WEEKDAYS[number]

export const WEEKDAY_NAMES: Record<Weekday, { short: string, long: string }> = {
	mon: { short: 'Mon', long: 'Monday' },
	tue: { short: 'Tue', long: 'Tuesday' },
	wed: { short: 'Wed', long: 'Wednesday' },
	thu: { short: 'Thu', long: 'Thursday' },
	fri: { short: 'Fri', long: 'Friday' },
	sat: { short: 'Sat', long: 'Saturday' },
	sun: { short: 'Sun', long: 'Sunday' }
}

const WEEKDAY_SET: ReadonlySet<unknown> = new Set(WEEKDAYS)

const isWeekday = (value: unknown): value is Weekday => WEEKDAY_SET.has(value)

/**
 @description
	The weekdays a habit applies on. A habit with no schedule applies every day.
	A schedule always has at least one day: to stop tracking a habit, remove its note.
 */
export default class Schedule {
	readonly days: readonly Weekday[]

	private constructor(days: Weekday[]) {
		this.days = WEEKDAYS.filter(day => days.includes(day))
	}

	static everyDay() {
		return new Schedule([...WEEKDAYS])
	}

	/**
	 @returns The schedule, or undefined when `days` is empty.
	 */
	static of(days: Weekday[]): Schedule | undefined {
		if (days.length === 0) return undefined

		return new Schedule(days)
	}

	/**
	 @description Reads the `schedule` property of a habit note. A missing property means every day.
	 @returns The schedule, and whether the property was valid. An invalid property falls back to every day.
	 */
	static fromFrontmatter(value: unknown): { schedule: Schedule, isValid: boolean } {
		if (value == undefined) return { schedule: Schedule.everyDay(), isValid: true }

		const isListOfWeekdays = Array.isArray(value) && value.length > 0 && value.every(day => isWeekday(day))
		const schedule = isListOfWeekdays ? Schedule.of(value) : undefined

		if (schedule == undefined) return { schedule: Schedule.everyDay(), isValid: false }

		return { schedule, isValid: true }
	}

	get isEveryDay() {
		return this.days.length === WEEKDAYS.length
	}

	includes(day: Weekday) {
		return this.days.includes(day)
	}

	appliesOn(date: DateValue) {
		// `dayOfWeek` counts from Sunday (0), WEEKDAYS from Monday.
		return this.includes(WEEKDAYS[(date.dayOfWeek() + 6) % WEEKDAYS.length])
	}

	/**
	 @returns The schedule with the day added or removed, or undefined when that would leave no days.
	 */
	toggle(day: Weekday): Schedule | undefined {
		const days = this.includes(day) ? this.days.filter(current => current !== day) : [...this.days, day]

		return Schedule.of(days)
	}

	/**
	 @example
		"Every day", "Weekdays", "Mon Wed Fri"
	 */
	summary() {
		if (this.isEveryDay) return 'Every day'
		if (this.days.join(',') === 'mon,tue,wed,thu,fri') return 'Weekdays'

		return this.days.map(day => WEEKDAY_NAMES[day].short).join(' ')
	}

	/**
	 @returns The value of the `schedule` property, or undefined when the property should be absent (every day).
	 */
	toFrontmatter(): Weekday[] | undefined {
		return this.isEveryDay ? undefined : [...this.days]
	}
}
