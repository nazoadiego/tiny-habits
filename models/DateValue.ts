export class DateValue {
  private value: Date | undefined;
  isValid: boolean;

  constructor(input: Date | string) {
    if (!DateValue.validate(input)) {
      return DateValue.empty();
    }
    this.value = new Date(input);
    this.isValid = true;
  }

  // TODO: Verify that is either a isoDate string or a string in "YYYY-MM-DD" format, otherwise new Date will give invalid date
  // TODO: I already know the object would be invalid yeah, but wouldn't hurt to have some better error feedback: expect x format got y
  static validate(input: Date | string): boolean {
    if (typeof input === "string") {
      input = new Date(input);
    }
    return input instanceof Date && !Number.isNaN(input.getTime());
  }

  static from(input: Date | string): DateValue {
    return new DateValue(input);
  }

  static empty(): DateValue {
    const valueObject = new DateValue(new Date());
    valueObject.value = undefined;
    valueObject.isValid = false;
    return valueObject;
  }

  // TODO: Change this to only show day and month, or make a separate method
  format(): string {
    if (!this.value) return "-";
    const formatter = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    return formatter.format(this.value);
  }

  toDayString(): string {
    if(!this.value) return "-"
    
    return this.value.getDate().toString()
  }

  // * YYYY-MM-DD, otherwise obsidian gets a bit weird about it.
  toFrontmatterProperty() {
    if (!this.value) return "-";

    const year = this.value.getFullYear();
    const month = String(this.value.getMonth() + 1).padStart(2, '0'); // JavaScript months are zero-based index lol, January is 0
    const day = String(this.value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  toString(): string {
    return this.value?.toISOString() || "-";
  }

  isSameDay(other: DateValue): boolean {
    if (!this.value || !other.value) return false;

    return (
      this.value.getFullYear() === other.value.getFullYear() &&
      this.value.getMonth() === other.value.getMonth() &&
      this.value.getDate() === other.value.getDate()
    );
  }

  isBefore(other: DateValue): boolean {
    if (!this.value || !other.value) return false;
    return this.value < other.value;
  }

  isAfter(other: DateValue): boolean {
    if (!this.value || !other.value) return false;
    return this.value > other.value;
  }

  equals(other: DateValue): boolean {
    if (!this.value || !other.value) return false;
    return this.value.getTime() === other.value.getTime();
  }
}