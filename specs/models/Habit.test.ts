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

describe('Habit.parseName', () => {
	it('trims the name', () => {
		expect(Habit.parseName('  Read  ')).toEqual({ name: 'Read' })
	})

	it('asks for a name when it is blank', () => {
		expect(Habit.parseName('   ').message).toBe('Give the habit a name')
	})

	it.each(['a/b', String.raw`a\b`, 'a:b', 'a*b', 'a?b', 'a"b', 'a<b', 'a>b', 'a|b', 'a#b', 'a^b', 'a[b', 'a]b'])('rejects %s', (input) => {
		expect(Habit.parseName(input).name).toBeUndefined()
	})

	it('rejects a leading dot, which would hide the note', () => {
		expect(Habit.parseName('.secret').name).toBeUndefined()
	})

	it('allows spaces, accents and dots inside', () => {
		expect(Habit.parseName('Café 2.0 walk').name).toBe('Café 2.0 walk')
	})
})

const habitFile = (frontmatter: Record<string, unknown>) => ({ basename: 'Long run', path: 'habits/Long run.md', frontmatter })

describe('Habit cadence', () => {
	it('has no off days when it is weekly, whatever its schedule says', () => {
		const { habit } = Habit.fromFile(habitFile({ every: 'week', schedule: ['mon'] }))
		const entry = Entry.empty({ habitId: habit.id, habitPath: habit.path, date: new DateValue('2026-11-04') })

		expect(habit.isOffDay(entry)).toBe(false)
	})

	it('stores a weekly entry under the Monday and a monthly one under the first', () => {
		const week = Habit.fromFile(habitFile({ every: 'week' })).habit
		const month = Habit.fromFile(habitFile({ every: 'month' })).habit
		const date = new DateValue('2026-11-04')

		expect(week.entryDate(date).toYearMonthDayString()).toBe('2026-11-02')
		expect(month.entryDate(date).toYearMonthDayString()).toBe('2026-11-01')
	})
})
