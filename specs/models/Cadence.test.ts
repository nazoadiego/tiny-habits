import { cadenceFromFrontmatter, periodLabel, periodStart, segmentsOf, visibleEntryDates } from 'models/Cadence'
import DateValue from 'models/DateValue'

// 2026-11-02 is a Monday, so 2026-11-01 is a Sunday.
const dates = (...days: string[]) => days.map(day => new DateValue(day))
const window = dates('2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03')

const summary = (cadence: 'day' | 'week' | 'month') => segmentsOf(window, cadence).map(({ start, span }) => [start.toYearMonthDayString(), span])

describe('Cadence', () => {
	describe('cadenceFromFrontmatter', () => {
		it('is daily when the property is missing', () => {
			expect(cadenceFromFrontmatter(undefined)).toEqual({ cadence: 'day', isValid: true })
		})

		it('reads week and month', () => {
			expect(cadenceFromFrontmatter('week')).toEqual({ cadence: 'week', isValid: true })
			expect(cadenceFromFrontmatter('month')).toEqual({ cadence: 'month', isValid: true })
		})

		it('falls back to daily when the value is not a cadence', () => {
			expect(cadenceFromFrontmatter('sometimes')).toEqual({ cadence: 'day', isValid: false })
			expect(cadenceFromFrontmatter(['week'])).toEqual({ cadence: 'day', isValid: false })
		})
	})

	describe('periodStart', () => {
		it('is the date itself for a daily habit', () => {
			expect(periodStart(new DateValue('2026-11-04'), 'day').toYearMonthDayString()).toBe('2026-11-04')
		})

		it('is the Monday of the week for a weekly habit, including on a Sunday', () => {
			expect(periodStart(new DateValue('2026-11-04'), 'week').toYearMonthDayString()).toBe('2026-11-02')
			expect(periodStart(new DateValue('2026-11-01'), 'week').toYearMonthDayString()).toBe('2026-10-26')
			expect(periodStart(new DateValue('2026-11-02'), 'week').toYearMonthDayString()).toBe('2026-11-02')
		})

		it('is the first of the month for a monthly habit', () => {
			expect(periodStart(new DateValue('2026-10-31'), 'month').toYearMonthDayString()).toBe('2026-10-01')
		})
	})

	describe('segmentsOf', () => {
		it('has one cell per day for a daily habit', () => {
			expect(summary('day')).toHaveLength(7)
		})

		it('spans the visible days of each week', () => {
			expect(summary('week')).toEqual([['2026-10-26', 5], ['2026-11-02', 2]])
		})

		it('spans the visible days of each month', () => {
			expect(summary('month')).toEqual([['2026-10-01', 4], ['2026-11-01', 3]])
		})
	})

	describe('periodLabel', () => {
		it('names a week inside one month by its days', () => {
			expect(periodLabel(new DateValue('2026-11-02'), 'week')).toBe('Nov 2 – 8')
		})

		it('names a week across two months by both', () => {
			expect(periodLabel(new DateValue('2026-10-26'), 'week')).toBe('Oct 26 – Nov 1')
		})

		it('names a month', () => {
			expect(periodLabel(new DateValue('2026-10-01'), 'month')).toBe('October')
		})
	})

	describe('visibleEntryDates', () => {
		it('keeps the visible days and the starts of their weeks and months', () => {
			const kept = visibleEntryDates(window)

			expect(kept.has('2026-10-28')).toBe(true)
			expect(kept.has('2026-10-26')).toBe(true)
			expect(kept.has('2026-10-01')).toBe(true)
			expect(kept.has('2026-11-01')).toBe(true)
			expect(kept.has('2026-10-25')).toBe(false)
		})
	})
})
