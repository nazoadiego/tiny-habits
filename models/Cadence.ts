import DateValue from './DateValue'

export const CADENCES = ['day', 'week', 'month'] as const

/** How often a habit comes around: every day, once a week (weeks start on Monday), or once a month. */
export type Cadence = typeof CADENCES[number]

export const CADENCE_NAMES: Record<Cadence, string> = {
	day: 'Daily',
	week: 'Weekly',
	month: 'Monthly'
}

const isCadence = (value: unknown): value is Cadence => CADENCES.includes(value as Cadence)

/**
 @description Reads the `every` property of a habit note. A missing property means every day.
 @returns The cadence, and whether the property was valid. An invalid property falls back to every day.
 */
export function cadenceFromFrontmatter(value: unknown): { cadence: Cadence, isValid: boolean } {
	if (value == undefined) return { cadence: 'day', isValid: true }

	if (isCadence(value)) return { cadence: value, isValid: true }

	return { cadence: 'day', isValid: false }
}

/** The value of the `every` property, or undefined when the property should be absent (every day). */
export function cadenceToFrontmatter(cadence: Cadence): Cadence | undefined {
	return cadence === 'day' ? undefined : cadence
}

/**
 @description
	The first day of the period the date falls in: the date itself for a daily habit, its Monday for a weekly one,
	the first of its month for a monthly one. A weekly or monthly habit keeps one entry per period, under this day.
 */
export function periodStart(date: DateValue, cadence: Cadence): DateValue {
	if (cadence === 'week') return date.startOfWeek()
	if (cadence === 'month') return date.startOfMonth()

	return date
}

/**
 @description A short name for the period that starts on `start`: "Oct 26 – Nov 1", "Nov 2 – 8" or "October".
 */
export function periodLabel(start: DateValue, cadence: Cadence): string {
	if (cadence === 'month') return start.toMonthName()
	if (cadence === 'day') return start.toShortMonthDay()

	const end = start.addDays(6)
	const endLabel = start.startOfMonth().isSameDay(end.startOfMonth()) ? end.toDayString() : end.toShortMonthDay()

	return `${start.toShortMonthDay()} – ${endLabel}`
}

export type PeriodSegment = {
	/** The first day of the period, which is the date the entry is stored under. */
	start: DateValue,
	/** How many of the visible dates fall in this period. */
	span: number
}

/**
 @description Groups consecutive visible dates by the period they fall in. A period the window cuts shows only its visible part.
 */
export function segmentsOf(dates: DateValue[], cadence: Cadence): PeriodSegment[] {
	const segments: PeriodSegment[] = []

	for (const date of dates) {
		const start = periodStart(date, cadence)
		const last = segments.at(-1)

		if (last?.start.isSameDay(start)) last.span += 1
		else segments.push({ start, span: 1 })
	}

	return segments
}

/**
 @description
	The dates a table keeps from each habit note: the visible days, plus the start of the week and the month each one falls in,
	which is where weekly and monthly habits store their entries.
 */
export function visibleEntryDates(dates: DateValue[]): Set<string> {
	return new Set(dates.flatMap(date => [date, date.startOfWeek(), date.startOfMonth()].map(day => day.toYearMonthDayString())))
}
