import type { Direction } from "./Direction"

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

export class Cursor implements TCursor {
	verticalPosition
	horizontalPosition
	verticalTotal
	horizontalTotal

	constructor({ verticalPosition, horizontalPosition, verticalTotal, horizontalTotal }: TCursorInit) {
		this.verticalPosition = verticalPosition 
		this.horizontalPosition = horizontalPosition
		this.verticalTotal = verticalTotal
		this.horizontalTotal = horizontalTotal 
	}

	move(direction: Direction) {
		if (direction === 'up') return this.up()
		if (direction === 'down') return this.down()
		if (direction === 'left') return this.left()
		if (direction === 'right') return this.right()

		console.warn('We are moving in strange directions, partner!')
	}

	up() {
		this.verticalPosition = this.getPreviousPosition(this.verticalPosition, this.verticalTotal)
	}
	down() {
		this.verticalPosition = this.getNextPosition(this.verticalPosition, this.verticalTotal)
	}
	left() {
		this.horizontalPosition = this.getPreviousPosition(this.horizontalPosition, this.horizontalTotal)
	}
	right() {
		this.horizontalPosition = this.getNextPosition(this.horizontalPosition, this.horizontalTotal)
	}

	// direction: 'down' | 'right'
	private getNextPosition(currentIndex: number, total: number): number {
		return (currentIndex + 1 + total) % total;
	}

	//  direction: 'up' | 'left'
	private getPreviousPosition(currentIndex: number, total: number): number {
		return (currentIndex - 1 + total) % total;
	}
}