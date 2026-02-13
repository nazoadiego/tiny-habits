import DateValue from '../../models/DateValue'

describe('DateValue', () => {
	it('parses YYYY-MM-DD correctly', () => {
		const dateValue = new DateValue('2025-09-01')
		expect(dateValue.isValid).toBe(true)
		expect(dateValue.toYearMonthDayString()).toBe('2025-09-01')
	})

	it('parses ISO string correctly', () => {
		const dateValue = new DateValue('2011-10-05T14:48:00.000Z')
		expect(dateValue.isValid).toBe(true)
		expect(dateValue.toISOString()).toBe('2011-10-05T14:48:00.000Z')
	})

	it('returns \'-\' for invalid date', () => {
		const dateValue = new DateValue('not-a-date')
		expect(dateValue.isValid).toBe(false)
		expect(dateValue.toYearMonthDayString()).toBe('-')
	})

	it('compares days correctly', () => {
		const firstOfSeptember = new DateValue('2025-09-01')
		const alsoFirstOfSeptember = new DateValue('2025-09-01')
		const secondOfSeptember = new DateValue('2025-09-02')
		expect(firstOfSeptember.isSameDay(alsoFirstOfSeptember)).toBe(true)
		expect(firstOfSeptember.isSameDay(secondOfSeptember)).toBe(false)
		expect(firstOfSeptember.isBefore(secondOfSeptember)).toBe(true)
		expect(secondOfSeptember.isAfter(firstOfSeptember)).toBe(true)
		expect(firstOfSeptember.equals(alsoFirstOfSeptember)).toBe(true)
		expect(firstOfSeptember.equals(secondOfSeptember)).toBe(false)
	})
})
