import DateValue from './DateValue'

export const CADENCES = ['day', 'week', 'month'] as const

/** How often a habit comes around: every day, once a week (weeks start on Monday), or once a month. */
export type Cadence = typeof CADENCES[number]

export const CADENCE_NAMES: Record<Cadence, string> = {
	day: 'Daily',
	week: 'Weekly',
	month: 'Monthly'
}

export const isCadence = (value: unknown): value is Cadence => CADENCES.includes(value as Cadence)

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

/** How many columns a table shows: a week of days, or half a year of weeks or months. */
export const VISIBLE_PERIODS: Record<Cadence, number> = { day: 7, week: 6, month: 6 }

/** What one step back or forward moves a table by. */
export const PERIOD_NAMES: Record<Cadence, string> = { day: 'day', week: 'week', month: 'month' }

/** The start of the period `count` periods after the one starting on `start` (before it when negative). */
export function shiftPeriod(start: DateValue, cadence: Cadence, count: number): DateValue {
	if (cadence === 'week') return start.addDays(7 * count)
	if (cadence === 'month') return start.addMonths(count)

	return start.addDays(count)
}

/**
 @description
	The columns of a table, oldest first: the days, weeks or months up to the current one, moved by `offset` periods.
	Each is the first day of its period, which is the date a habit's entry is stored under.
 */
export function visibleDates(cadence: Cadence, offset: number = 0, today: DateValue = new DateValue(new Date().toISOString())): DateValue[] {
	const last = shiftPeriod(periodStart(today, cadence), cadence, offset)
	const length = VISIBLE_PERIODS[cadence]

	return Array.from({ length }, (_element, index) => shiftPeriod(last, cadence, index + 1 - length))
}

/** The entry dates a table keeps from each habit note. */
export function entryDatesOf(dates: DateValue[]): Set<string> {
	return new Set(dates.map(date => date.toYearMonthDayString()))
}

/** What a column header says: two short lines, like "Mon" over "2", "Nov 2" over "– 8" or "Nov" over "2026". */
export function columnLabel(start: DateValue, cadence: Cadence): { top: string, bottom: string } {
	if (cadence === 'day') return { top: start.toDayOfTheWeek(), bottom: start.toDayString() }
	if (cadence === 'month') return { top: start.toShortMonthName(), bottom: start.toYearString() }

	const end = start.addDays(6)
	const isSameMonth = start.startOfMonth().isSameDay(end.startOfMonth())

	return { top: start.toShortMonthDay(), bottom: `– ${isSameMonth ? end.toDayString() : end.toShortMonthDay()}` }
}
