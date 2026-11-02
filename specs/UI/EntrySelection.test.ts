import { EntrySelection, type EntryKey } from 'UI/EntrySelection'
import Entry from 'models/Entry'
import DateValue from 'models/DateValue'

const READ_MONDAY: EntryKey = 'Read|2026-01-05'
const READ_TUESDAY: EntryKey = 'Read|2026-01-06'
const RUN_MONDAY: EntryKey = 'Run|2026-01-05'

describe('EntrySelection', () => {
	it('keys an entry by its habit and date', () => {
		const entry = Entry.empty({ habitId: 'Read', habitPath: 'habits/Read.md', date: new DateValue('2026-01-05') })

		expect(EntrySelection.keyOf(entry)).toBe(READ_MONDAY)
	})

	it('toggles cells in and out without changing the original', () => {
		const empty = EntrySelection.empty()
		const selected = empty.toggle(READ_MONDAY).toggle(RUN_MONDAY)

		expect(empty.isEmpty).toBe(true)
		expect(selected.size).toBe(2)
		expect(selected.toggle(READ_MONDAY).has(READ_MONDAY)).toBe(false)
	})

	it('ignores adding a cell twice', () => {
		const selection = EntrySelection.empty().add(READ_MONDAY).add(READ_MONDAY)

		expect(selection.size).toBe(1)
	})

	describe('paint', () => {
		it('adds when the drag starts on an unselected cell', () => {
			const selection = EntrySelection.empty().add(READ_TUESDAY)
			const mode = selection.paintModeFor(READ_MONDAY)

			const painted = selection.paint(READ_MONDAY, mode).paint(RUN_MONDAY, mode).paint(READ_TUESDAY, mode)

			expect(mode).toBe('add')
			expect(painted.targets(READ_MONDAY)).toEqual([READ_TUESDAY, READ_MONDAY, RUN_MONDAY])
		})

		it('removes when the drag starts on a selected cell', () => {
			const selection = EntrySelection.empty().add(READ_MONDAY).add(RUN_MONDAY).add(READ_TUESDAY)
			const mode = selection.paintModeFor(READ_MONDAY)

			const painted = selection.paint(READ_MONDAY, mode).paint(RUN_MONDAY, mode)

			expect(mode).toBe('remove')
			expect(painted.targets(READ_TUESDAY)).toEqual([READ_TUESDAY])
		})
	})

	describe('targets', () => {
		it('is the focused cell when nothing is selected', () => {
			expect(EntrySelection.empty().targets(READ_MONDAY)).toEqual([READ_MONDAY])
		})

		it('is the whole selection, even when focus is elsewhere', () => {
			const selection = EntrySelection.empty().add(READ_MONDAY).add(RUN_MONDAY)

			expect(selection.targets(READ_TUESDAY)).toEqual([READ_MONDAY, RUN_MONDAY])
		})
	})

	describe('anchor', () => {
		it('is the focused cell when it is selected', () => {
			const selection = EntrySelection.empty().add(READ_MONDAY).add(RUN_MONDAY)

			expect(selection.anchor(READ_MONDAY)).toBe(READ_MONDAY)
		})

		it('is the last selected cell when focus is outside the selection', () => {
			const selection = EntrySelection.empty().add(READ_MONDAY).add(RUN_MONDAY)

			expect(selection.anchor(READ_TUESDAY)).toBe(RUN_MONDAY)
		})

		it('is the focused cell when nothing is selected', () => {
			expect(EntrySelection.empty().anchor(READ_TUESDAY)).toBe(READ_TUESDAY)
		})
	})
})
