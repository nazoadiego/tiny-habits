
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

// Type assertion at the end of the file to ensure static implementation
class DateValue implements TDateValue {
	private value
	readonly isValid;
	
	constructor(input: Date | string) {
		this.isValid = DateValue.validate(input);
		this.value = this.isValid ? new Date(input) : undefined;
	}

	// TODO: Verify that is either a isoDate string or a string in "YYYY-MM-DD" format, otherwise new Date will give invalid date
	static validate(input: Date | string) {
		if (typeof input === "string") {
			input = new Date(input);
		}
	
		return input instanceof Date
	}

	toFullDateWithWeekday() {
		if (!this.value) return "-";
		const formatter = new Intl.DateTimeFormat("en-US", { dateStyle: "full" });
		return formatter.format(this.value);
	}

	// "1", "30"
	toDayString() {
		if(!this.value) return "-"
    
		return this.value.getDate().toString()
	}

	toDate() {
		if (this.value === undefined) return undefined

		return new Date(this.value);
	}

	/**
	 @description
		A string in "YYYY-MM-DD" format
	*/
	toYearMonthDayString() {
		if (!this.value) return "-";

		const year = this.value.getFullYear();
		const month = String(this.value.getMonth() + 1).padStart(2, '0'); // JavaScript months are zero-based index lol, January is 0
		const day = String(this.value.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	}

	toISOString() {
		return this.value?.toISOString() || "-";
	}


	isSameDay(other: DateValue) {
		if (!this.value || !other.value) return false;

		return (
			this.value.getFullYear() === other.value.getFullYear() &&
      this.value.getMonth() === other.value.getMonth() &&
      this.value.getDate() === other.value.getDate()
		);
	}

	isBefore(other: DateValue) {
		if (!this.value || !other.value) return false;
		return this.value < other.value;
	}

	isAfter(other: DateValue) {
		if (!this.value || !other.value) return false;
		return this.value > other.value;
	}

	equals(other: DateValue) {
		if (!this.value || !other.value) return false;
		return this.value.getTime() === other.value.getTime();
	}
}

export default DateValue