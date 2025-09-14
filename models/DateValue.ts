
type TDateValue = {
	isValid: boolean;
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
	private value
	readonly isValid

	constructor(input: string) {
		const isYMD = input.length === 10 && input[4] === '-' && input[7] === '-'
		const isUTC = input.includes('T') && input.endsWith('Z')

		if(isUTC) {
			const date = new Date(input)
			this.isValid = DateValue.validate(date)
			this.value = this.isValid ? new Date(date) : undefined
			return
		}
		if(isYMD) {
			const [year, month, day] = input.split('-').map(Number)
			const monthIndex = month - 1
			const date = new Date(year, monthIndex, day) // * We do it like this, because passing the YYYY-MM-DD string here will give you the wrong day, example: 2025-09-01
			this.isValid = DateValue.validate(date)
			this.value = this.isValid ? new Date(date) : undefined
			return
		}

		this.isValid = false
	}

	static validate(date: Date) {
		return date instanceof Date && !Number.isNaN(date.getTime())
	}

	toFullDateWithWeekday() {
		if (!this.value) return '-'
		const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })
		return formatter.format(this.value)
	}

	// "1", "30"
	toDayString() {
		if(!this.value) return '-'

		return this.value.getDate().toString()
	}

	toDayOfTheWeek() {
		if(!this.value) return '-'

		return this.value.toLocaleDateString('en-US', { weekday: 'short' })
	}

	toDate() {
		if (this.value === undefined) return undefined

		return new Date(this.value)
	}

	/**
	 @returns
		A string in "YYYY-MM-DD" format
	*/
	toYearMonthDayString() {
		if (!this.value) return '-'

		const year = this.value.getFullYear()
		const month = String(this.value.getMonth() + 1).padStart(2, '0') // JavaScript months are zero-based index lol, January is 0
		const day = String(this.value.getDate()).padStart(2, '0')

		return `${year}-${month}-${day}`
	}

	/**
	 @returns
		A string in ISO format
	 @example
		2011-10-05T14:48:00.000Z
	*/
	toISOString() {
		return this.value?.toISOString() || '-'
	}

	isSameDay(other: DateValue) {
		if (!this.value || !other.value) return false

		return (
			this.value.getFullYear() === other.value.getFullYear() &&
      this.value.getMonth() === other.value.getMonth() &&
      this.value.getDate() === other.value.getDate()
		)
	}

	isBefore(other: DateValue) {
		if (!this.value || !other.value) return false
		return this.value < other.value
	}

	isAfter(other: DateValue) {
		if (!this.value || !other.value) return false
		return this.value > other.value
	}

	equals(other: DateValue) {
		if (!this.value || !other.value) return false
		return this.value.getTime() === other.value.getTime()
	}
}

export default DateValue
