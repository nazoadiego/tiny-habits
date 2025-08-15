import DateValue from "./DateValue";

export type Status = "unstarted" | "completed" | "failed" | "skip";

type TEntry = {
  habitId: string;
  habitPath: string;
  status: Status;
  date: DateValue;
  isEmpty: boolean;
  frontMatterDate: () => string;
  isComplete: () => boolean;
  isPending: () => boolean;
	nextStatus: () => Status;
};

type EntryInit = {
  habitId: string;
  habitPath: string;
  status: Status;
  date: DateValue;
  isEmpty?: boolean;
};

/**
@class Entry
@description Represents the register of a habit on a particular day.
**/
class Entry implements TEntry {
	habitId: string;
	habitPath: string;
	status: Status;
	date: DateValue;
	isEmpty: boolean;

	/**
		@param habitId - The unique identifier for the habit, it's the name of the file, just the name. Not the complete path.
		@param habitPath - The file path where the habit is stored, it's the absolute path with the extension file format.
		@param date - The date when this entry was recorded.
		@param status - The current status of the entry.
		@param isEmpty - Whether this is an empty placeholder entry, for when there is no entry yet. Null object pattern.
	*/
	constructor({ habitId, habitPath, date, status, isEmpty = false }: EntryInit) {
		this.habitId = habitId;
		this.habitPath = habitPath; // @description the path
		this.status = status;
		this.date = date;
		this.isEmpty = isEmpty
	}

	static readonly STATUS: Record<Status, Status> = {
		unstarted: "unstarted",
		completed: "completed",
		failed: "failed",
		skip: "skip"
	}

	/**
		@description The default order in which an entry changes of status.
	*/
	static readonly STATUS_ORDER: Status[] = [
		Entry.STATUS.unstarted,
		Entry.STATUS.completed,
		Entry.STATUS.failed,
		Entry.STATUS.skip
	]

	/**
 	 @description 
		A constructor method for an empty entry placeholder. 
		Think Null Object pattern. Useful for when there is no entry registered yet.
		Its status is always unstarted.
	*/
	static empty({ habitId, habitPath, date }: { habitId: EntryInit['habitId'], habitPath: EntryInit['habitPath'], date: DateValue }) {
		return new Entry({ habitId, habitPath, date, status: Entry.STATUS.unstarted, isEmpty: true });
	}

	/**
	 @description 
		Gets the next status of an entry from the defined Status Order. 
		If it reaches the end of the order, it starts back at the beginning.
		It does not mutate the status state.
	 @returns
	 	An entry status
	*/
	nextStatus() {
		const STATUS_ORDER = Entry.STATUS_ORDER
		const currentIndex = STATUS_ORDER.indexOf(this.status);
		const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;

		return STATUS_ORDER[nextIndex];
	}

	frontMatterDate() {
		return this.date.toYearMonthDayString()
	}

	isComplete() {
		return this.status === Entry.STATUS.completed
	}

	isSkipped() {
		return this.status === Entry.STATUS.skip
	}

	isPending() {
		if (this.isComplete() || this.isSkipped()) return false

		return true
	}
}
export default Entry