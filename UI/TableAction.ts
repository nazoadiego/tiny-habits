import { Cursor } from "./Cursor";
import type DateValue from "models/DateValue";
import type Habit from "models/Habit";
import type { Direction } from "./Direction";

export const NAVIGATION_MAP: Record<string, Direction> = {
	'ArrowUp': 'up', 'k': 'up',
	'ArrowDown': 'down', 'j': 'down',
	'ArrowLeft': 'left', 'h': 'left',
	'ArrowRight': 'right', 'l': 'right'
};

export class TableAction {
	private event
	private target
	private key

	constructor(event: KeyboardEvent) {
		this.event = event
		this.target = event.target
		this.key = event.key
	}

	call(habits: Habit[], dates: DateValue[], updateEntry: () => void) {
		if(!this.isValid()) return

		this.event.preventDefault()

		if(this.isToggleKey()) {
			updateEntry();
			return
		}

		if(this.isNavigationKey()) {
			this.navigateToEntry(habits, dates);
			return
		}
	}

	private isValid() {
		return this.isToggleKey() || this.isNavigationKey()
	}

	private isToggleKey() {
		return this.key === 'Enter' || this.key === ' '
	}

	private isNavigationKey() {
		return !!NAVIGATION_MAP[this.key]
	}

	private navigateToEntry(habits: Habit[], dates: DateValue[]) {
	 	const direction = NAVIGATION_MAP[this.key];
	 	if (!direction) return;

		if (!(this.target instanceof HTMLTableCellElement)) return

	 	const entryDay = this.target.dataset.entryDay;
	 	const currentHabitId = this.target.dataset.habitId;
	 	if (!entryDay || !currentHabitId) return;

	 	const habitIds = habits.map(habit => habit.id);
	 	const dayStrings = dates.map(date => date.toDayString());

	 	const cursor = new Cursor({ 
	 		verticalPosition: habitIds.indexOf(currentHabitId),
	 		horizontalPosition: dayStrings.indexOf(entryDay),
	 		verticalTotal: habitIds.length,
	 		horizontalTotal: dayStrings.length
	 	})

	 	cursor.move(direction)

		const targetDay = dayStrings[cursor.horizontalPosition]
		const targetHabit = habitIds[cursor.verticalPosition]

		const selector = `td[data-entry-day="${targetDay}"][data-habit-id="${targetHabit}"]`
		const cell = document.querySelector(selector)
	 
		if ((cell	instanceof HTMLTableCellElement)) {
		 cell.focus();
	 }
		else {
		 console.warn(`TableAction.navigateToEntry: cell not found for selector "${selector}" (direction: ${direction})`);
	 } 
	}
}
