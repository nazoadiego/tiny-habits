import { Cursor } from 'UI/Cursor'

describe(('When changing the cursor'), () => {
	// Vertical Movements

	// Direction - Up
	it('when moving up, it changes the vertical position correctly', () => {
		const cursor = new Cursor({ verticalPosition: 1, horizontalPosition: 0, verticalTotal: 3, horizontalTotal: 3 })

		cursor.up()

		expect(cursor.verticalPosition).toBe(0)
	})

	it('when moving up, on the first position, it cycles back to the last position vertically', () => {
		const cursor = new Cursor({ verticalPosition: 0, horizontalPosition: 0, verticalTotal: 3, horizontalTotal: 3 })

		cursor.up()

		expect(cursor.verticalPosition).toBe(2)
	})

	// Direction - Down
	it('when moving down, it changes the vertical position correctly', () => {
		const cursor = new Cursor({ verticalPosition: 1, horizontalPosition: 0, verticalTotal: 3, horizontalTotal: 3 })

		cursor.down()

		expect(cursor.verticalPosition).toBe(2)
	})

	it('when moving down, on the last position, it cycles back to the first position vertically', () => {
		const cursor = new Cursor({ verticalPosition: 2, horizontalPosition: 0, verticalTotal: 3, horizontalTotal: 3 })

		cursor.down()

		expect(cursor.verticalPosition).toBe(0)
	})

	// Horizontal Movements

	// Direction - Left

	it('when moving left, it changes the vertical position correctly', () => {
		const cursor = new Cursor({ verticalPosition: 0, horizontalPosition: 1, verticalTotal: 3, horizontalTotal: 3 })

		cursor.left()

		expect(cursor.horizontalPosition).toBe(0)
	})

	it('when moving left, on the first position, it cycles back to the last position horizontally', () => {
		const cursor = new Cursor({ verticalPosition: 0, horizontalPosition: 0, verticalTotal: 3, horizontalTotal: 3 })

		cursor.left()

		expect(cursor.horizontalPosition).toBe(2)
	})

	// Direction - Right
	it('when moving right, it changes the vertical position correctly', () => {
		const cursor = new Cursor({ verticalPosition: 0, horizontalPosition: 1, verticalTotal: 3, horizontalTotal: 3 })

		cursor.right()

		expect(cursor.horizontalPosition).toBe(2)
	})

	it('when moving right, on the last position, it cycles back to the first position horizontally', () => {
		const cursor = new Cursor({ verticalPosition: 0, horizontalPosition: 2, verticalTotal: 3, horizontalTotal: 3 })

		cursor.right()

		expect(cursor.horizontalPosition).toBe(0)
	})
})
