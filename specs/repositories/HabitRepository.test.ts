import HabitRepository from 'repositories/HabitRepository'
import InMemoryPlatform from 'platform/memory/InMemoryPlatform'
import Entry from 'models/Entry'
import DateValue from 'models/DateValue'
import Schedule from 'models/Schedule'

const LONG_RUN = { path: 'habits/Long run.md', frontmatter: { every: 'week', '2026-10-26': 'completed' } }

function buildPlatform(extraFiles: { path: string, frontmatter?: Record<string, unknown> }[] = []) {
	const notices: string[] = []
	const platform = new InMemoryPlatform({
		folders: ['habits', 'habits/archive'],
		files: [
			{ path: 'habits/Read.md', frontmatter: { '2026-01-01': 'completed', '2026-01-02': 'failed', tags: 'not-an-entry' } },
			{ path: 'habits/Meditate.md', frontmatter: { '2026-01-01': 'skip' } },
			{ path: 'habits/Write.md', frontmatter: { schedule: ['wed'], '2026-01-07': 'completed' } },
			{ path: 'habits/Broken.md', frontmatter: { schedule: 'sometimes' } },
			{ path: 'habits/No frontmatter.md' },
			{ path: 'habits/archive/Old.md', frontmatter: { '2026-01-01': 'completed' } },
			...extraFiles
		],
		notify: (message) => notices.push(message)
	})

	return { platform, notices, repository: new HabitRepository(platform) }
}

async function habitNamed(repository: HabitRepository, name: string) {
	const habits = await repository.allHabits('habits')
	const habit = habits.find(habit => habit.name === name)
	if (habit == undefined) throw new Error(`No habit named ${name}`)

	return habit
}

function entryFor(habitPath: string, date: string, habitId = 'Read') {
	return Entry.empty({ habitId, habitPath, date: new DateValue(date) })
}

/** The details of a form that changes nothing about the habit, but where it goes. */
const same = (habit: { name: string, cadence: 'day' | 'week' | 'month', schedule: Schedule }, position: number, folderPath = 'habits') =>
	({ name: habit.name, folderPath, cadence: habit.cadence, schedule: habit.schedule, position })

describe('HabitRepository', () => {
	describe('allHabits', () => {
		it('builds one habit per file directly in the folder, sorted by name', async () => {
			const { repository } = buildPlatform()

			const habits = await repository.allHabits('habits')

			expect(habits.map(habit => habit.name)).toEqual(['Broken', 'Meditate', 'No frontmatter', 'Read', 'Write'])
			expect(habits.map(habit => habit.path)).toEqual(['habits/Broken.md', 'habits/Meditate.md', 'habits/No frontmatter.md', 'habits/Read.md', 'habits/Write.md'])
		})

		it('keeps only the dates in the filter', async () => {
			const { repository } = buildPlatform()

			const habits = await repository.allHabits('habits', new Set(['2026-01-02']))
			const read = habits.find(habit => habit.name === 'Read')

			expect(read?.entries.map(entry => [entry.frontMatterDate(), entry.status])).toEqual([['2026-01-02', 'failed']])
		})

		it('gives a habit without frontmatter no entries', async () => {
			const { repository } = buildPlatform()

			const habits = await repository.allHabits('habits')

			expect(habits.find(habit => habit.name === 'No frontmatter')?.entries).toEqual([])
		})

		it('skips invalid frontmatter entries and notifies about each', async () => {
			const { repository, notices } = buildPlatform()

			const habits = await repository.allHabits('habits')

			expect(habits.find(habit => habit.name === 'Read')?.entries).toHaveLength(2)
			expect(notices.filter(notice => notice.startsWith('Invalid date format'))).toEqual(['Invalid date format or status for entry in Habit file Read. Date: tags. Status: not-an-entry'])
		})

		it('reads the schedule property and never as an entry', async () => {
			const { repository, notices } = buildPlatform()

			const habits = await repository.allHabits('habits')
			const write = habits.find(habit => habit.name === 'Write')

			expect(write?.schedule.days).toEqual(['wed'])
			expect(write?.entries.map(entry => entry.frontMatterDate())).toEqual(['2026-01-07'])
			expect(notices).not.toContain(expect.stringContaining('Write'))
		})

		it('schedules every day when there is no schedule property', async () => {
			const { repository } = buildPlatform()

			const habits = await repository.allHabits('habits')

			expect(habits.find(habit => habit.name === 'Read')?.schedule.isUnscheduled).toBe(true)
		})

		it('notifies about an invalid schedule and applies every day', async () => {
			const { repository, notices } = buildPlatform()

			const habits = await repository.allHabits('habits')

			expect(habits.find(habit => habit.name === 'Broken')?.schedule.isUnscheduled).toBe(true)
			expect(notices).toContain('Invalid schedule in Habit file Broken. Use a list of weekdays, like [mon, wed, fri]. It applies every day for now')
		})

		it('reads the every property and never as an entry', async () => {
			const { repository, notices } = buildPlatform([LONG_RUN])

			const habits = await repository.allHabits('habits')
			const longRun = habits.find(habit => habit.name === 'Long run')

			expect(longRun?.cadence).toBe('week')
			expect(longRun?.entries.map(entry => entry.frontMatterDate())).toEqual(['2026-10-26'])
			expect(notices.filter(notice => notice.includes('Long run'))).toEqual([])
		})

		it('makes a habit daily when there is no every property', async () => {
			const { repository } = buildPlatform()

			const habits = await repository.allHabits('habits')

			expect(habits.find(habit => habit.name === 'Read')?.cadence).toBe('day')
		})

		it('notifies about an invalid every property and makes the habit daily', async () => {
			const { repository, notices } = buildPlatform([{ path: 'habits/Odd.md', frontmatter: { every: 'sometimes' } }])

			const habits = await repository.allHabits('habits')

			expect(habits.find(habit => habit.name === 'Odd')?.cadence).toBe('day')
			expect(notices).toContain('Invalid every in Habit file Odd. Use week or month. It is daily for now')
		})

		it('notifies and returns no habits when the folder does not exist', async () => {
			const { repository, notices } = buildPlatform()

			const habits = await repository.allHabits('missing')

			expect(habits).toEqual([])
			expect(notices).toEqual(['Couldn\'t find the folder "missing"'])
		})
	})

	describe('createHabit', () => {
		it('creates the note with a plain habit and leaves the other habits alone', async () => {
			const { platform, repository } = buildPlatform()
			const habits = await repository.allHabits('habits')

			const wasCreated = await repository.createHabit({ name: 'Run', folderPath: 'habits', cadence: 'day', schedule: Schedule.unscheduled(), position: undefined }, habits)

			expect(wasCreated).toBe(true)
			expect(platform.frontmatterOf('habits/Run.md')).toBeUndefined()
			expect(platform.frontmatterOf('habits/Read.md')?.order).toBeUndefined()
		})

		it('saves the cadence and the weekdays in the new note', async () => {
			const { platform, repository } = buildPlatform()
			const habits = await repository.allHabits('habits')

			await repository.createHabit({ name: 'Swim', folderPath: 'habits', cadence: 'day', schedule: Schedule.of(['mon', 'fri']), position: undefined }, habits)
			await repository.createHabit({ name: 'Plan', folderPath: 'habits', cadence: 'week', schedule: Schedule.unscheduled(), position: undefined }, habits)

			expect(platform.frontmatterOf('habits/Swim.md')).toEqual({ schedule: ['mon', 'fri'] })
			expect(platform.frontmatterOf('habits/Plan.md')).toEqual({ every: 'week' })
		})

		it('puts the habit at the chosen position', async () => {
			const { repository } = buildPlatform()
			const habits = await repository.allHabits('habits')

			await repository.createHabit({ name: 'Run', folderPath: 'habits', cadence: 'day', schedule: Schedule.unscheduled(), position: 0 }, habits)

			const reloaded = await repository.allHabits('habits')
			expect(reloaded.map(habit => habit.name)).toEqual(['Run', 'Broken', 'Meditate', 'No frontmatter', 'Read', 'Write'])
		})

		it('creates the table folder when it is new', async () => {
			const { platform, repository } = buildPlatform()

			await repository.createHabit({ name: 'Run', folderPath: 'fitness', cadence: 'day', schedule: Schedule.unscheduled(), position: 0 }, [])

			expect(platform.listHabitFiles('fitness')?.map(file => file.basename)).toEqual(['Run'])
		})

		it('tells the user when the habit already exists, and writes nothing', async () => {
			const { platform, repository, notices } = buildPlatform()
			const habits = await repository.allHabits('habits')

			const wasCreated = await repository.createHabit({ name: 'Read', folderPath: 'habits', cadence: 'week', schedule: Schedule.unscheduled(), position: 0 }, habits)

			expect(wasCreated).toBe(false)
			expect(notices).toContain('"Read" already exists in habits')
			expect(platform.frontmatterOf('habits/Read.md')?.every).toBeUndefined()
		})
	})

	describe('updateHabit', () => {
		it('writes the cadence and the weekdays to the habit note, keeping the entries', async () => {
			const { platform, repository } = buildPlatform()
			const habits = await repository.allHabits('habits')
			const meditate = await habitNamed(repository, 'Meditate')
			const siblings = habits.filter(habit => habit.path !== meditate.path)

			await repository.updateHabit(meditate, { ...same(meditate, 1), cadence: 'week' }, siblings)
			await repository.updateHabit(meditate, { ...same(meditate, 1), schedule: Schedule.of(['mon', 'wed']) }, siblings)

			expect(platform.frontmatterOf('habits/Meditate.md')).toEqual({ '2026-01-01': 'skip', every: 'week', schedule: ['mon', 'wed'] })
		})

		it('removes the properties when the habit is back to every day', async () => {
			const { platform, repository } = buildPlatform([{ path: 'habits/Long run.md', frontmatter: { every: 'week', schedule: ['mon'], '2026-10-26': 'completed' } }])
			const habits = await repository.allHabits('habits')
			const longRun = await habitNamed(repository, 'Long run')

			await repository.updateHabit(longRun, { ...same(longRun, habits.findIndex(habit => habit.path === longRun.path)), cadence: 'day', schedule: Schedule.unscheduled() }, habits.filter(habit => habit.path !== longRun.path))

			expect(platform.frontmatterOf('habits/Long run.md')).toEqual({ '2026-10-26': 'completed' })
		})

		it('writes nothing when nothing changed', async () => {
			const { platform, repository } = buildPlatform()
			const habits = await repository.allHabits('habits')
			const write = habits.find(habit => habit.name === 'Write')!
			const updateFrontmatter = vi.spyOn(platform, 'updateFrontmatter')

			await repository.updateHabit(write, same(write, habits.findIndex(habit => habit.path === write.path)), habits.filter(habit => habit.path !== write.path))

			expect(updateFrontmatter).not.toHaveBeenCalled()
		})

		it('renames the note, keeping its entries', async () => {
			const { platform, repository } = buildPlatform()
			const habits = await repository.allHabits('habits')
			const read = await habitNamed(repository, 'Read')

			const wasUpdated = await repository.updateHabit(read, { ...same(read, habits.findIndex(habit => habit.path === read.path)), name: 'Read a book' }, habits.filter(habit => habit.path !== read.path))

			expect(wasUpdated).toBe(true)
			expect(platform.frontmatterOf('habits/Read.md')).toBeUndefined()
			expect(platform.frontmatterOf('habits/Read a book.md')).toEqual({ '2026-01-01': 'completed', '2026-01-02': 'failed', tags: 'not-an-entry' })
		})

		it('moves the note to another table at the chosen position', async () => {
			const { platform, repository } = buildPlatform()
			const read = await habitNamed(repository, 'Read')
			const archived = await repository.allHabits('habits/archive')

			await repository.updateHabit(read, same(read, 0, 'habits/archive'), archived)

			expect(platform.frontmatterOf('habits/Read.md')).toBeUndefined()
			const reloaded = await repository.allHabits('habits/archive')
			expect(reloaded.map(habit => habit.name)).toEqual(['Read', 'Old'])
		})

		it('moves the habit to the chosen position among the table', async () => {
			const { repository } = buildPlatform()
			const habits = await repository.allHabits('habits')
			const write = habits.find(habit => habit.name === 'Write')!

			await repository.updateHabit(write, same(write, 0), habits.filter(habit => habit.path !== write.path))

			const reloaded = await repository.allHabits('habits')
			expect(reloaded.map(habit => habit.name)).toEqual(['Write', 'Broken', 'Meditate', 'No frontmatter', 'Read'])
		})

		it('changes nothing and says why when the new name is taken', async () => {
			const { platform, repository, notices } = buildPlatform()
			const habits = await repository.allHabits('habits')
			const read = await habitNamed(repository, 'Read')

			const wasUpdated = await repository.updateHabit(read, { ...same(read, 0), name: 'Write', cadence: 'month' }, habits.filter(habit => habit.path !== read.path))

			expect(wasUpdated).toBe(false)
			expect(notices).toContain('"Write" already exists in habits')
			expect(platform.frontmatterOf('habits/Read.md')?.every).toBeUndefined()
		})

		it('notifies when the note is gone', async () => {
			const { platform, repository, notices } = buildPlatform()
			const habits = await repository.allHabits('habits')
			const meditate = await habitNamed(repository, 'Meditate')
			vi.spyOn(platform, 'updateFrontmatter').mockResolvedValue(false)

			await repository.updateHabit(meditate, { ...same(meditate, 1), cadence: 'week' }, habits.filter(habit => habit.path !== meditate.path))

			expect(notices).toContain('Couldn\'t update Meditate')
		})
	})

	describe('updateEntries', () => {
		it('writes the status to every entry, keeping the rest of the frontmatter', async () => {
			const { platform, repository } = buildPlatform()

			await repository.updateEntries([
				entryFor('habits/Read.md', '2026-01-03'),
				entryFor('habits/Read.md', '2026-01-04'),
				entryFor('habits/Meditate.md', '2026-01-03', 'Meditate')
			], Entry.STATUS.completed)

			expect(platform.frontmatterOf('habits/Read.md')).toEqual({
				'2026-01-01': 'completed', '2026-01-02': 'failed', tags: 'not-an-entry', '2026-01-03': 'completed', '2026-01-04': 'completed'
			})
			expect(platform.frontmatterOf('habits/Meditate.md')).toEqual({ '2026-01-01': 'skip', '2026-01-03': 'completed' })
		})

		it('writes each habit file once', async () => {
			const { platform, repository } = buildPlatform()
			const updateFrontmatter = vi.spyOn(platform, 'updateFrontmatter')

			await repository.updateEntries([
				entryFor('habits/Read.md', '2026-01-03'),
				entryFor('habits/Read.md', '2026-01-04')
			], Entry.STATUS.skip)

			expect(updateFrontmatter).toHaveBeenCalledExactlyOnceWith('habits/Read.md', { '2026-01-03': 'skip', '2026-01-04': 'skip' })
		})

		it('updates the other habits and names the failed ones in one notice', async () => {
			const { platform, repository, notices } = buildPlatform()
			const updateFrontmatter = platform.updateFrontmatter.bind(platform)
			vi.spyOn(platform, 'updateFrontmatter').mockImplementation(async (path, values) => {
				if (path === 'habits/Meditate.md') throw new Error('disk full')
				return updateFrontmatter(path, values)
			})
			vi.spyOn(console, 'error').mockImplementation(() => {})

			await repository.updateEntries([
				entryFor('habits/Gone.md', '2026-01-03', 'Gone'),
				entryFor('habits/Meditate.md', '2026-01-03', 'Meditate'),
				entryFor('habits/Read.md', '2026-01-03')
			], Entry.STATUS.failed)

			expect(platform.frontmatterOf('habits/Read.md')?.['2026-01-03']).toBe('failed')
			expect(notices).toEqual(['Couldn\'t update Gone, Meditate'])
		})

		it('does nothing for no entries', async () => {
			const { platform, repository, notices } = buildPlatform()
			const updateFrontmatter = vi.spyOn(platform, 'updateFrontmatter')

			await repository.updateEntries([], Entry.STATUS.completed)

			expect(updateFrontmatter).not.toHaveBeenCalled()
			expect(notices).toEqual([])
		})
	})

	describe('ordering', () => {
		it('lists ordered habits first, then the rest by name', async () => {
			const { platform, repository } = buildPlatform()
			await platform.updateFrontmatter('habits/Write.md', { order: 0 })
			await platform.updateFrontmatter('habits/Read.md', { order: 1 })

			const habits = await repository.allHabits('habits')

			expect(habits.map(habit => habit.name)).toEqual(['Write', 'Read', 'Broken', 'Meditate', 'No frontmatter'])
		})

		it('never reads the order as an entry', async () => {
			const { platform, repository } = buildPlatform()
			await platform.updateFrontmatter('habits/Read.md', { order: 3 })

			const read = await habitNamed(repository, 'Read')

			expect(read.order).toBe(3)
			expect(read.entries.map(entry => entry.frontMatterDate())).toEqual(['2026-01-01', '2026-01-02'])
		})

		it('treats an order that is not a number as no order', async () => {
			const { platform, repository } = buildPlatform()
			await platform.updateFrontmatter('habits/Read.md', { order: 'first' })

			const read = await habitNamed(repository, 'Read')

			expect(read.order).toBeUndefined()
		})

		it('saves a move as the order of each habit, and the move shows on the next load', async () => {
			const { platform, repository } = buildPlatform()
			const habits = await repository.allHabits('habits')
			const lastIndex = habits.length - 1

			await repository.moveHabit(habits, lastIndex, 0)

			expect(platform.frontmatterOf('habits/Write.md')?.order).toBe(0)
			expect(platform.frontmatterOf('habits/Broken.md')?.order).toBe(1)
			const reloaded = await repository.allHabits('habits')

			expect(reloaded.map(habit => habit.name)).toEqual(['Write', 'Broken', 'Meditate', 'No frontmatter', 'Read'])
		})

		it('tells the user which habits it could not reorder', async () => {
			const { platform, notices, repository } = buildPlatform()
			const habits = await repository.allHabits('habits')
			vi.spyOn(platform, 'updateFrontmatter').mockImplementation(async path => path !== 'habits/Broken.md')

			notices.length = 0

			await repository.moveHabit(habits, 1, 0)

			expect(notices).toEqual(['Couldn\'t reorder Broken'])
		})
	})
})
