export class DateValue {
  private value: Date | null;
  isValid: boolean;

  constructor(input: Date | string) {
    if (!DateValue.validate(input)) {
      return DateValue.empty();
    }
    this.value = new Date(input);
    this.isValid = true;
  }

  // TODO: Verify that is either a isoDate string or a string in "YYYY-MM-DD" format, otherwise new Date will give invalid date
  // TODO: I already know the object would be invalid yeah, but wouldnt hurt to have some better error feedback: expect x format got y
  static validate(input: Date | string): boolean {
    if (typeof input === "string") {
      input = new Date(input);
    }
    return input instanceof Date && !isNaN(input.getTime());
  }

  static from(input: Date | string): DateValue {
    return new DateValue(input);
  }

  static empty(): DateValue {
    const obj = new DateValue(new Date());
    obj.value = null;
    obj.isValid = false;
    return obj;
  }

  format(): string {
    if (!this.value) return "-";
    const formatter = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    return formatter.format(this.value);
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