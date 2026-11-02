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
	The weekdays a habit applies on. A schedule with no days is no schedule at all: the habit applies every day.
 */
export default class Schedule {
	readonly days: readonly Weekday[]

	private constructor(days: Weekday[]) {
		this.days = WEEKDAYS.filter(day => days.includes(day))
	}

	/**
	 @description The schedule of a habit nobody has scheduled. It applies every day.
	 */
	static unscheduled() {
		return new Schedule([])
	}

	static of(days: Weekday[]) {
		return new Schedule(days)
	}

	/**
	 @description Reads the `schedule` property of a habit note. A missing or empty property means no schedule.
	 @returns The schedule, and whether the property was valid. An invalid property falls back to no schedule.
	 */
	static fromFrontmatter(value: unknown): { schedule: Schedule, isValid: boolean } {
		if (value == undefined) return { schedule: Schedule.unscheduled(), isValid: true }

		if (!Array.isArray(value) || !value.every(day => isWeekday(day))) return { schedule: Schedule.unscheduled(), isValid: false }

		return { schedule: Schedule.of(value), isValid: true }
	}

	/** True when no day is chosen, which is how a habit without a schedule looks. */
	get isUnscheduled() {
		return this.days.length === 0
	}

	/** True when the habit applies every day, whether or not every weekday was chosen. */
	get isEveryDay() {
		return this.isUnscheduled || this.days.length === WEEKDAYS.length
	}

	includes(day: Weekday) {
		return this.days.includes(day)
	}

	appliesOn(date: DateValue) {
		// `dayOfWeek` counts from Sunday (0), WEEKDAYS from Monday.
		return this.isEveryDay || this.includes(WEEKDAYS[(date.dayOfWeek() + 6) % WEEKDAYS.length])
	}

	/**
	 @returns The schedule with the day added or removed. Removing the last day leaves the habit unscheduled.
	 */
	toggle(day: Weekday) {
		const days = this.includes(day) ? this.days.filter(current => current !== day) : [...this.days, day]

		return Schedule.of(days)
	}

	/**
	 @returns The value of the `schedule` property, or undefined when the property should be absent (no schedule).
	 */
	toFrontmatter(): Weekday[] | undefined {
		return this.isUnscheduled ? undefined : [...this.days]
	}
}
