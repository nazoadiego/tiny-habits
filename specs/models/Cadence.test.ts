import { columnLabel, entryDatesOf, periodLabel, periodStart, shiftPeriod, visibleDates } from 'models/Cadence'
import DateValue from 'models/DateValue'

// 2026-11-02 is a Monday, so 2026-11-01 is a Sunday.
const day = (value: string) => new DateValue(value)
const ymd = (dates: DateValue[]) => dates.map(date => date.toYearMonthDayString())

describe('Cadence', () => {
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

	describe('shiftPeriod', () => {
		it('moves by days, weeks or months', () => {
			expect(shiftPeriod(day('2026-11-02'), 'day', -1).toYearMonthDayString()).toBe('2026-11-01')
			expect(shiftPeriod(day('2026-11-02'), 'week', -2).toYearMonthDayString()).toBe('2026-10-19')
			expect(shiftPeriod(day('2026-11-01'), 'month', -2).toYearMonthDayString()).toBe('2026-09-01')
			expect(shiftPeriod(day('2026-11-01'), 'month', 3).toYearMonthDayString()).toBe('2027-02-01')
		})
	})

	describe('visibleDates', () => {
		const today = day('2026-11-04')

		it('is the last 7 days for a daily table, ending today', () => {
			const dates = ymd(visibleDates('day', 0, today))

			expect(dates).toHaveLength(7)
			expect(dates.at(0)).toBe('2026-10-29')
			expect(dates.at(-1)).toBe('2026-11-04')
		})

		it('is the last 6 weeks, each by its Monday, ending with the current week', () => {
			expect(ymd(visibleDates('week', 0, today))).toEqual(['2026-09-28', '2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26', '2026-11-02'])
		})

		it('is the last 6 months, each by its first day, ending with the current month', () => {
			expect(ymd(visibleDates('month', 0, today))).toEqual(['2026-06-01', '2026-07-01', '2026-08-01', '2026-09-01', '2026-10-01', '2026-11-01'])
		})

		it('moves by whole periods with the offset', () => {
			expect(ymd(visibleDates('month', -1, today)).at(-1)).toBe('2026-10-01')
			expect(ymd(visibleDates('week', 1, today)).at(-1)).toBe('2026-11-09')
			expect(ymd(visibleDates('month', 2, today)).at(-1)).toBe('2027-01-01')
		})
	})

	describe('entryDatesOf', () => {
		it('keeps exactly the visible columns', () => {
			const kept = entryDatesOf(visibleDates('month', 0, day('2026-11-04')))

			expect(kept.has('2026-11-01')).toBe(true)
			expect(kept.has('2026-06-01')).toBe(true)
			expect(kept.has('2026-05-01')).toBe(false)
			expect(kept.has('2026-11-04')).toBe(false)
		})
	})

	describe('columnLabel', () => {
		it('says the weekday over the day of the month for a day', () => {
			expect(columnLabel(day('2026-11-04'), 'day')).toEqual({ top: 'Wed', bottom: '4' })
		})

		it('says the first day over the last for a week, with the month when it changes', () => {
			expect(columnLabel(day('2026-11-02'), 'week')).toEqual({ top: 'Nov 2', bottom: '– 8' })
			expect(columnLabel(day('2026-10-26'), 'week')).toEqual({ top: 'Oct 26', bottom: '– Nov 1' })
		})

		it('says the month over the year for a month', () => {
			expect(columnLabel(day('2026-11-01'), 'month')).toEqual({ top: 'Nov', bottom: '2026' })
		})
	})
})
