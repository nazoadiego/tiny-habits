// Relations
// An Entry belongs to a habit

import type { TEntry, Status } from "types/TEntry";
import  DateValue from "./DateValue";

type EntryInit = {
  habitId: string;
  habitPath: string;
  status: Status;
  date: DateValue;
  isEmpty?: boolean;
};

class Entry implements TEntry {
	habitId: string;
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

	constructor({ habitId, habitPath, date, status, isEmpty = false }: EntryInit) {
		this.habitId = habitId;
		this.habitPath = habitPath;
		this.status = status;
		this.date = date;
		this.isEmpty = isEmpty
	}

	static empty({ habitId, habitPath, date = DateValue.empty() }: { date?: DateValue, habitPath: string, habitId: string }): Entry {
		return new Entry({ habitId, habitPath, date, status: Entry.STATUS.unstarted, isEmpty: true });
	}

	nextStatus(): Status {
		const STATUS_ORDER = Entry.STATUS_ORDER
		const currentIndex = STATUS_ORDER.indexOf(this.status);
		const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;

		return STATUS_ORDER[nextIndex];
	}

	cycleStatus(): Status {
		this.status = this.nextStatus()
		return this.status
	}

	isCompleted(): boolean {
		return this.status === Entry.STATUS.completed
	}

	isPending(): boolean {
		return this.status !== Entry.STATUS.completed && this.status !== Entry.STATUS.skip
	}
}
export default Entry