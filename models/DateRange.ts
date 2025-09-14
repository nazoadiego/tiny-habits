import DateValue from './DateValue'

type DateRangeDirection = 'forward' | 'backwards'
class DateRange {
	from: DateValue
	to: DateValue
	length: number
	direction: DateRangeDirection

	constructor(from: DateValue, to: DateValue, length: number, direction: DateRangeDirection) {
		this.from = from
		this.to = to
		this.length = length
		this.direction = direction
	}

	static from(length: number = 7, direction: DateRangeDirection = 'backwards', offset: number = 0): DateRange {
		const today = new Date()
		const endDate = new Date()
		const numberOfDays = length - 1

		today.setDate(today.getDate() + offset)
		endDate.setDate(today.getDate() + (direction === 'backwards' ? -(numberOfDays) : numberOfDays))

		return new DateRange(
			new DateValue(direction === 'backwards' ? endDate.toISOString() : today.toISOString()),
			new DateValue(direction === 'backwards' ? today.toISOString() : endDate.toISOString()),
			length,
			direction
		)
	}

	getDates(): DateValue[] {
		return Array.from(
			{ length: this.length },
			(_element, index) => {
				const baseDate = this.direction === 'backwards'
					? this.to.toDate()
					: this.from.toDate()

				if (!baseDate) {
					throw new Error('Invalid date range')
				}

				const newDate = new Date(baseDate)
				const offset = this.direction === 'backwards' ? -index : index
				newDate.setDate(newDate.getDate() + offset)

				return new DateValue(newDate.toISOString())
			}
		)
	}
}

export default DateRange
