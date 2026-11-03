import dayjs, { Dayjs } from 'dayjs'

type TDateValue = {
	validate(): boolean;
	toFullDateWithWeekday(): string;
	toDayString(): string;
	toDate(): Date | undefined;
	toYearMonthDayString(): string;
	toISOString(): string;
	isSameDay(other: DateValue): boolean;
	isBefore(other: DateValue): boolean;
	isAfter(other: DateValue): boolean;
	equals(other: DateValue): boolean;
}

class DateValue implements TDateValue {
	private value: Dayjs | undefined
	isValid: boolean

	constructor(input: string) {
		this.value = dayjs(input)

		this.validate()
	}

	validate() {
		if(this.value && this.value.isValid()) {
			this.isValid = true
			return true
		}

		this.isValid = false
		this.value = undefined

		return false
	}

	toFullDateWithWeekday() {
		return this.value ? this.value.format('dddd, MMMM D, YYYY') : '-'
	}

	// "1", "30"
	toDayString() {
		return this.value ? this.value.format('D') : '-'
	}

	toDayOfTheWeek() {
		return this.value ? this.value.format('ddd') : '-'
	}

	/**
	 @returns The day of the week, from 0 (Sunday) to 6 (Saturday), or NaN for an invalid date.
	 */
	dayOfWeek() {
		return this.value ? this.value.day() : Number.NaN
	}

	// "Oct 26"
	toShortMonthDay() {
		return this.value ? this.value.format('MMM D') : '-'
	}

	// "October"
	toMonthName() {
		return this.value ? this.value.format('MMMM') : '-'
	}

	/**
	 @returns The Monday of this date's week, since weeks start on Monday.
	 */
	startOfWeek(): DateValue {
		if (!this.value) return new DateValue('')

		return this.subtractDays((this.value.day() + 6) % 7)
	}

	/**
	 @returns The first day of this date's month.
	 */
	startOfMonth(): DateValue {
		if (!this.value) return new DateValue('')

		return new DateValue(this.value.startOf('month').toISOString())
	}

	/**
	 @returns The last day of this date's month.
	 */
	endOfMonth(): DateValue {
		if (!this.value) return new DateValue('')

		return new DateValue(this.value.endOf('month').startOf('day').toISOString())
	}

	toDate() {
		return this.value ? this.value.toDate() : undefined
	}

	/**
	 @returns
		A string in "YYYY-MM-DD" format
	*/
	toYearMonthDayString() {
		return this.value ? this.value.format('YYYY-MM-DD') : '-'
	}

	/**
	 @returns
		A string in ISO format
	 @example
		2011-10-05T14:48:00.000Z
	*/
	toISOString() {
		return this.value ? this.value.toISOString() : '-'
	}

	isSameDay(other: DateValue) {
		return !!(this.value && other.value && this.value.isSame(other.value, 'day'))
	}

	isBefore(other: DateValue) {
		return !!(this.value && other.value && this.value.isBefore(other.value, 'day'))
	}

	isAfter(other: DateValue) {
		return !!(this.value && other.value && this.value.isAfter(other.value, 'day'))
	}

	equals(other: DateValue) {
		return !!(this.value && other.value && this.value.isSame(other.value))
	}

	addDays(days: number): DateValue {
		if (!this.value) return new DateValue('')

		return new DateValue(this.value.add(days, 'day').toISOString())
	}

	subtractDays(days: number): DateValue {
		if (!this.value) return new DateValue('')

		return new DateValue(this.value.subtract(days, 'day').toISOString())
	}
}


export default DateValue
