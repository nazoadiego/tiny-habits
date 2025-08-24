import type { Direction } from './Direction'

type TCursor = {
	verticalPosition: number
	horizontalPosition: number
	verticalTotal: number
	horizontalTotal: number
	move(direction: Direction): void
	up(): void
	down(): void
	left(): void
	right(): void
}

type TCursorInit = Pick<TCursor, 'verticalPosition' | 'horizontalPosition' | 'verticalTotal' | 'horizontalTotal'>

/**
 * @class Cursor
 * @description
 * Represents a movable position in a habits tracking table.
 * Used for keyboard navigation between habit entries.
 *
 * The cursor maintains its position and can move in 4 directions:
 * - Up/Down: Moves between different habits
 * - Left/Right: Moves between different dates
 *
 * All movements are circular - moving past the last position wraps to the first,
 * and moving before the first position wraps to the last.
 *
 * @example
 * const cursor = new Cursor({
 *   verticalPosition: 0,   // First habit
 *   horizontalPosition: 0, // First date
 *   verticalTotal: 3,      // Three habits in table
 *   horizontalTotal: 7     // Seven days shown
 * });
 *
 * cursor.right();  // Move to next day
 * cursor.down();   // Move to next habit
 */

export class Cursor implements TCursor {
	verticalPosition
	horizontalPosition
	verticalTotal
	horizontalTotal

	/**
	 * @param verticalPosition - Index based number with the current cursor position vertically. Is always between 0 and verticalTotal - 1
	 * @param horizontalPosition - Index based number with the current cursor position vertically. Is always between 0 and horizontalTotal - 1
	 * @param verticalTotal - The total number of positions vertically, it maps to the number of total habits in the table. Always a positive integer.
	 * @param horizontalTotal - The total number of positions horizontally, it maps to the number of total entry days in the table. Always a positive integer.
	 */
	constructor({ verticalPosition, horizontalPosition, verticalTotal, horizontalTotal }: TCursorInit) {
		this.verticalPosition = verticalPosition
		this.horizontalPosition = horizontalPosition
		this.verticalTotal = verticalTotal
		this.horizontalTotal = horizontalTotal

		this.validate()
	}

	private validate(): void {
		if (!Number.isInteger(this.verticalTotal) || this.verticalTotal <= 0)
			throw new Error('Vertical total must be a positive integer')

		if (!Number.isInteger(this.horizontalTotal) || this.horizontalTotal <= 0)
			throw new Error('Horizontal total must be a positive integer')

		if (this.verticalPosition < 0 || this.verticalPosition >= this.verticalTotal)
			throw new Error('Vertical position must be within bounds')

		if (this.horizontalPosition < 0 || this.horizontalPosition >= this.horizontalTotal)
			throw new Error('Horizontal position must be within bounds')
	}

	/**
	 * @description Moves the cursor in the specified direction
	 * @param direction - The direction to move: 'up', 'down', 'left', 'right'
	 *
	 * Movement is always circular:
	 * - Moving up from the first habit jumps to the last habit
	 * - Moving right from the last date jumps to the first date
	 * - etc.

	 *
	 * @case If there is a position available in that direction, the cursor changes position there
	 * @example
	 * cursor.verticalTotal // 3
	 * cursor.verticalPosition // 1
	 * cursor.up()
	 * cursor.verticalPosition // 0
	 *
	 * @case If there are no more positions available, it cycles back to the last or first one, depending on the direction.
	 * @example
	 * cursor.verticalTotal // 3
	 * cursor.verticalPosition // 0
	 * cursor.up()
	 * cursor.verticalPosition // 2
	 *
	*/
	move(direction: Direction): void {
		switch(direction) {
			case 'up': return this.up()
			case 'down': return this.down()
			case 'left': return this.left()
			case 'right': return this.right()
			default:
				throw new Error(`We are moving in strange ways, partner. Navigation with invalid direction: ${direction}`)
		}
	}

	/**
	 * @description Moves the cursor up to the previous habit
	 * If at first habit, wraps to the last habit
	*/
	up() {
		this.verticalPosition = this.getPreviousPosition(this.verticalPosition, this.verticalTotal)
	}

	/**
	 * @description Moves the cursor down to the previous habit
	 * If at last habit, wraps to the first habit
	*/
	down() {
		this.verticalPosition = this.getNextPosition(this.verticalPosition, this.verticalTotal)
	}

	/**
	 * @description Moves the cursor left to the previous entry day
	 * If at first entry day, wraps to the last entry day
	*/
	left() {
		this.horizontalPosition = this.getPreviousPosition(this.horizontalPosition, this.horizontalTotal)
	}

	/**
	 * @description Moves the cursor right to the next entry day
	 * If at last entry day, wraps to the first entry day
	*/
	right() {
		this.horizontalPosition = this.getNextPosition(this.horizontalPosition, this.horizontalTotal)
	}

	/**
	 * @description Calculate the next position when moving forward, for directions down and right
	 * @param currentIndex - Current position (0-based)
	 * @param total - Total number of positions
	 * @returns New position, wrapping to 0 if exceeding total
	 * @private
	*/
	private getNextPosition(currentIndex: number, total: number): number {
		return (currentIndex + 1 + total) % total
	}

	/**
	 * @description Calculate the previous position when moving backwards, for directions up and left
	 * @param currentIndex - Current position (0-based)
	 * @param total - Total number of positions
	 * @returns New position, wrapping to 0 if exceeding total
	 * @private
	*/
	private getPreviousPosition(currentIndex: number, total: number): number {
		return (currentIndex - 1 + total) % total
	}
}
