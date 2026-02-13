import DateValue from './DateValue'

type DateRangeDirection = 'forward' | 'backwards'
class DateRange {
	from: DateValue
	to: DateValue
	length: number
	direction: DateRangeDirection

	constructor(
		from: DateValue,
		to: DateValue,
		length: number,
		direction: DateRangeDirection
	) {
		this.from = from
		this.to = to
		this.length = length
		this.direction = direction
	}

	static fromToday(numberOfDays: number = 7, direction: DateRangeDirection = 'backwards', offset: number = 0): DateRange {
		const today = new DateValue(new Date().toISOString()).addDays(offset)

		if (direction === 'backwards') {
			const endDate = today.subtractDays(numberOfDays)

			return new DateRange(endDate, today, numberOfDays, direction)
		}

		if (direction === 'forward') {
			const endDate = today.addDays(numberOfDays)

			return new DateRange(today, endDate, numberOfDays, direction)
		}

		console.warn('DateRange direction is neither forward or backwards')
		return new DateRange(today, today, numberOfDays, direction)
	}

	getDates(): DateValue[] {
		return Array.from({ length: this.length }, (_element, index) => {
			const baseDateValue =
				this.direction === 'backwards' ? this.to : this.from
			if (!baseDateValue.isValid) {
				throw new Error('Invalid date range')
			}
			const offset = this.direction === 'backwards' ? -index : index
			return baseDateValue.addDays(offset)
		})
	}
}

export default DateRange
