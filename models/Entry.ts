// Relations
// An Entry belongs to a habit

import type { TEntry, Status } from "types/TEntry";
import type  DateValue from "./DateValue";

class Entry implements TEntry {
	habitId: string;
	status: Status;
	date: DateValue;

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

	constructor(date: DateValue, status: Status) {
		this.status = status;
		this.date = date;
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