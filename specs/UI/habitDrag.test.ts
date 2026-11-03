import { destinationOf, dropSlot } from 'UI/habitDrag'

const rows = [{ top: 0, bottom: 60 }, { top: 66, bottom: 126 }, { top: 132, bottom: 192 }]

describe('habitDrag', () => {
	describe('dropSlot', () => {
		it('is 0 above the middle of the first row', () => expect(dropSlot(rows, 10)).toBe(0))
		it('is the row count below the middle of the last row', () => expect(dropSlot(rows, 190)).toBe(3))
		it('counts the rows the pointer is past', () => expect(dropSlot(rows, 100)).toBe(2))
	})

	describe('destinationOf', () => {
		it('moves up to the slot', () => expect(destinationOf(2, 0)).toBe(0))
		it('moves down to the slot before it, since the habit leaves its row', () => expect(destinationOf(0, 3)).toBe(2))
		it('stays when dropped next to itself', () => {
			expect(destinationOf(1, 1)).toBe(1)
			expect(destinationOf(1, 2)).toBe(1)
		})
	})
})
