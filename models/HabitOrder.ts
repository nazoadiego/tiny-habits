import type Habit from './Habit'

export type OrderChange = { habit: Habit, order: number }

/**
 @description
	Habits the user has ordered come first, by `order`; the rest follow in the order they came in (by name).
	Habits with the same `order` also keep the order they came in.
 */
export function sortByOrder(habits: Habit[]): Habit[] {
	const ordered = habits.filter(habit => habit.order != undefined).toSorted((first, second) => (first.order ?? 0) - (second.order ?? 0))
	const unordered = habits.filter(habit => habit.order == undefined)

	return [...ordered, ...unordered]
}

/**
 @description
	Moves the habit at `fromIndex` to `toIndex` and numbers every habit by its new position.
 @param habits The habits as the table shows them.
 @returns The habits whose `order` has to be written, which is none when the move changes nothing.
 */
export function reorder(habits: Habit[], fromIndex: number, toIndex: number): OrderChange[] {
	const isInside = (index: number) => Number.isInteger(index) && index >= 0 && index < habits.length
	if (!isInside(fromIndex) || !isInside(toIndex)) throw new RangeError(`Can't move habit ${fromIndex} to ${toIndex} among ${habits.length}`)

	const moved = habits.toSpliced(fromIndex, 1).toSpliced(toIndex, 0, habits[fromIndex])

	// A habit is written unless its `order` is already its position, so the first move numbers every habit.
	return moved.flatMap((habit, order) => habit.order === order ? [] : [{ habit, order }])
}

/**
 @description The names of the places a habit can take in a table of `total` habits, like "1st of 3" and "3rd of 3 (last)".
 @returns One label per place, first place first.
 */
export function positionLabels(total: number): string[] {
	return Array.from({ length: total }, (_, index) => `${ordinal(index + 1)} of ${total}${index === total - 1 ? ' (last)' : ''}`)
}

function ordinal(number: number) {
	const lastTwoDigits = number % 100
	if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return `${number}th`

	const suffix = ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[number % 10] ?? 'th'
	return `${number}${suffix}`
}
