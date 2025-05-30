// Relations
// An Entry belongs to a habit
// Relations
// A habit has many entries
// A habit belongs to one or more Habit Groups

import type { TDay } from "types/TDay";
import type { TEntry, Status, StatusDisplay } from "types/TEntry";

class Entry implements TEntry {
  id: number;
  habitId: string;
  status: Status;
  day: TDay;

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

  constructor(id: number, habitId: string, status: Status, day: number) {
    this.id = id;
    this.habitId = habitId;
    this.status = status;
    this.day = day;
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