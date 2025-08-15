type Direction = 'up' | 'down' | 'left' | 'right';

export class Cursor {
	verticalPosition: number
	horizontalPosition: number
	verticalOptions: string[]
	horizontalOptions: string[]

	constructor({ verticalPosition, horizontalPosition, verticalOptions, horizontalOptions }: { 
    verticalPosition: number, 
    horizontalPosition: number, 
    verticalOptions: string[], 
    horizontalOptions: string[]
  }) {
		this.verticalPosition = verticalPosition 
		this.horizontalPosition = horizontalPosition
		this.verticalOptions = verticalOptions
		this.horizontalOptions = horizontalOptions 
	}

	move(direction: Direction) {
		if (direction === 'up') this.up()
		if (direction === 'down') this.down()
		if (direction === 'left') this.left()
		if (direction === 'right') this.right()

		this.focus()
	}

	up() {
		this.verticalPosition = this.getPreviousPosition(this.verticalPosition, this.verticalOptions.length)
	}
	down() {
		this.verticalPosition = this.getNextPosition(this.verticalPosition, this.verticalOptions.length)
	}
	left() {
		this.horizontalPosition = this.getPreviousPosition(this.horizontalPosition, this.horizontalOptions.length)
	}
	right() {
		this.horizontalPosition = this.getNextPosition(this.horizontalPosition, this.horizontalOptions.length)
	}

	focus() {
		const selector = buildSelector(this.horizontalOptions[this.horizontalPosition], this.verticalOptions[this.verticalPosition]);
		const cell = document.querySelector(selector) as HTMLTableCellElement;

		cell.focus();
	}

	// direction: 'down' | 'right'
	getNextPosition(currentIndex: number, total: number): number {
		return (currentIndex + 1 + total) % total;
	}

	//  direction: 'up' | 'left'
	getPreviousPosition(currentIndex: number, total: number): number {
		return (currentIndex - 1 + total) % total;
	}
}

function buildSelector(entryDay: string, habitId: string): string {
	return `td[data-entry-day="${entryDay}"][data-habit-id="${habitId}"]`;
}

type KeyboardMapping = Record<string, Direction>;

export const keyboardMap: KeyboardMapping = {
	'ArrowUp': 'up', 'k': 'up',
	'ArrowDown': 'down', 'j': 'down',
	'ArrowLeft': 'left', 'h': 'left',
	'ArrowRight': 'right', 'l': 'right'
};