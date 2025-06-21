// Relations
// An Entry belongs to a habit

import type { TEntry, Status } from "types/TEntry";
import  DateValue from "./DateValue";

type EntryInit = {
  habitPath: string;
  status: Status;
  date: DateValue;
  isEmpty?: boolean;
};

class Entry implements TEntry {
	habitPath: string;
	status: Status;
	date: DateValue;
	isEmpty: boolean;

	static readonly STATUS = {
		unstarted: "unstarted",
		completed: "completed",
		failed: "failed",
		skip: "skip"
	} as const;

	static readonly STATUS_ORDER: Status[] = [
		Entry.STATUS.unstarted,
		Entry.STATUS.completed,
		Entry.STATUS.failed,
		Entry.STATUS.skip
	] as const

	constructor({ habitPath, date, status, isEmpty = false }: EntryInit) {
		this.habitPath = habitPath;
		this.status = status;
		this.date = date;
		this.isEmpty = isEmpty
	}

	static empty({ habitPath, date = DateValue.empty() }: { date: DateValue, habitPath: string }): Entry {
		return new Entry({ habitPath, date, status: Entry.STATUS.unstarted, isEmpty: true });
	}

	cycleStatus(): Status {
		const STATUS_ORDER = Entry.STATUS_ORDER

		const currentIndex = STATUS_ORDER.indexOf(this.status);
		const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
		this.status = STATUS_ORDER[nextIndex];
		return this.status
	}
}
export default Entry