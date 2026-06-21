import DateValue from './DateValue'

class DateRange {
	constructor(
		public from: DateValue,
		public to: DateValue,
		public length: number
	) {}

	static fromToday(numberOfDays: number = 7, offset: number = 0): DateRange {
		const today = new DateValue(new Date().toISOString()).addDays(offset)
		return new DateRange(today.subtractDays(numberOfDays), today, numberOfDays)
	}

	getDates(): DateValue[] {
		if (!this.from.isValid || !this.to.isValid) throw new Error('Invalid date range')

		return Array.from({ length: this.length }, (_element, index) => this.to.subtractDays(index))
	}
}

export default DateRange
