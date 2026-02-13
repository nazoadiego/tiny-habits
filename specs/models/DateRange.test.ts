import DateValue from '../../models/DateValue'
import DateRange from '../../models/DateRange'

describe('DateRange', () => {
	it('creates a range backwards from today', () => {
		const range = DateRange.fromToday(3, 'backwards')
		expect(range.length).toBe(3)
		expect(range.direction).toBe('backwards')
		expect(range.from.isValid).toBe(true)
		expect(range.to.isValid).toBe(true)
		const dates = range.getDates()
		expect(dates.length).toBe(3)
		expect(dates[0].isValid).toBe(true)
		expect(dates[1].isValid).toBe(true)
		expect(dates[2].isValid).toBe(true)
	})

	it('creates a range forward from today', () => {
		const range = DateRange.fromToday(3, 'forward')
		expect(range.length).toBe(3)
		expect(range.direction).toBe('forward')
		expect(range.from.isValid).toBe(true)
		expect(range.to.isValid).toBe(true)
		const dates = range.getDates()
		expect(dates.length).toBe(3)
		expect(dates[0].isValid).toBe(true)
		expect(dates[1].isValid).toBe(true)
		expect(dates[2].isValid).toBe(true)
	})

	it('throws error for invalid date range', () => {
		const invalidFrom = new DateValue('not-a-date')
		const invalidTo = new DateValue('not-a-date')
		const range = new DateRange(invalidFrom, invalidTo, 2, 'backwards')
		expect(() => range.getDates()).toThrow('Invalid date range')
	})
})
