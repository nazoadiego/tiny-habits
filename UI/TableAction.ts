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

	 	const targetEntryDay = this.target.dataset.entryDay;
	 	const targetHabitId = this.target.dataset.habitId;
	 	if (!targetEntryDay || !targetHabitId) return;

	 	const habitIds = habits.map(habit => habit.id);
	 	const dayStrings = dates.map(date => date.toDayString());

	 	const cursor = new Cursor({ 
	 		verticalPosition: habitIds.indexOf(targetHabitId),
	 		horizontalPosition: dayStrings.indexOf(targetEntryDay),
	 		verticalTotal: habitIds.length,
	 		horizontalTotal: dayStrings.length
	 	})

	 	cursor.move(direction)

		const nextTargetDay = dayStrings[cursor.horizontalPosition]
		const nextTargetHabit = habitIds[cursor.verticalPosition]

		const selector = `td[data-entry-day="${nextTargetDay}"][data-habit-id="${nextTargetHabit}"]`
		const cell = document.querySelector(selector)
	 
		if ((cell	instanceof HTMLTableCellElement)) {
		 cell.focus();
	 }
		else {
		 console.warn(`TableAction.navigateToEntry: cell not found for selector "${selector}" (direction: ${direction})`);
	 } 
	}
}
