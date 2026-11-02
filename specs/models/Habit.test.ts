import Habit from 'models/Habit'
import Entry from 'models/Entry'
import DateValue from 'models/DateValue'
import Schedule from 'models/Schedule'

const file = { basename: 'Write', path: 'habits/Write.md', frontmatter: undefined }

function entryOn(date: string, status: Entry['status'] = Entry.STATUS.unstarted) {
	return new Entry({ habitId: 'Write', habitPath: file.path, date: new DateValue(date), status })
}

describe('Habit.isOffDay', () => {
	// 2026-11-04 is a Wednesday, 2026-11-03 a Tuesday.
	const habit = new Habit({ id: 'Write', name: 'Write', path: file.path, entries: [], schedule: Schedule.of(['wed']) })

	it('is false on a scheduled day', () => {
		expect(habit.isOffDay(entryOn('2026-11-04'))).toBe(false)
	})

	it('is true for an unmarked entry on a day the schedule skips', () => {
		expect(habit.isOffDay(entryOn('2026-11-03'))).toBe(true)
	})

	it('is false once the entry has been marked, so doing it on an off day counts', () => {
		expect(habit.isOffDay(entryOn('2026-11-03', Entry.STATUS.completed))).toBe(false)
	})

	it('is never true for a habit without a schedule', () => {
		const daily = new Habit({ id: 'Write', name: 'Write', path: file.path, entries: [] })

		expect(daily.isOffDay(entryOn('2026-11-03'))).toBe(false)
	})
})
