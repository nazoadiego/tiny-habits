// Relations
// An Entry belongs to a habit

import type { TEntry, Status, StatusDisplay } from "types/TEntry";
import type { DateValue } from "./DateValue";

class Entry implements TEntry {
  id: number;
  habitId: string;
  status: Status;
  date: DateValue;

  static readonly STATUS = {
    unstarted: "unstarted",
    completed: "completed",
    failed: "failed",
    skip: "skip",
  } as const;

  static readonly STATUS_DISPLAY: Record<Status, StatusDisplay> = {
    unstarted: "",
    completed: "O",
    failed: "X",
    skip: "-",
  };

  constructor(date: DateValue, status: Status) {
    this.status = status;
    this.date = date;
  }

  cycleStatus(): void {
    const STATUS_ORDER: Status[] = [
      Entry.STATUS.unstarted,
      Entry.STATUS.completed,
      Entry.STATUS.failed,
      Entry.STATUS.skip,
    ];

    const currentIndex = STATUS_ORDER.indexOf(this.status);
    const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
    this.status = STATUS_ORDER[nextIndex];
  }

  display(): StatusDisplay {
    return Entry.STATUS_DISPLAY[this.status];
  }
}
export default Entry