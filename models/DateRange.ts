import { DateValue } from "./DateValue";

type DateRangeDirection = "forward" | "backwards"

export class DateRange {
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

  static from(length: number = 7, direction: DateRangeDirection = 'backwards'): DateRange {
    const today = new Date();
    const endDate = new Date();

    if (direction === 'backwards') {
      endDate.setDate(today.getDate() - (length - 1));
      return new DateRange(
        new DateValue(endDate),
        new DateValue(today),
        length,
        direction
      );
    } else {
      endDate.setDate(today.getDate() + (length - 1));
      return new DateRange(
        new DateValue(today),
        new DateValue(endDate),
        length,
        direction
      );
    }
  }

  getDates(): DateValue[] {
    return Array.from(
      { length: this.length },
      (_element, index) => {
        const date = new Date();
        const offset = this.direction === 'backwards' ? -index : index;
        date.setDate(date.getDate() + offset);
        return new DateValue(date);
      }
    );
  }
}