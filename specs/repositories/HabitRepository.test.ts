import HabitRepository from 'repositories/HabitRepository'
import InMemoryPlatform from 'platform/memory/InMemoryPlatform'
import Entry from 'models/Entry'
import DateValue from 'models/DateValue'
import Schedule from 'models/Schedule'

function buildPlatform() {
	const notices: string[] = []
	const platform = new InMemoryPlatform({
		folders: ['habits', 'habits/archive'],
		files: [
			{ path: 'habits/Read.md', frontmatter: { '2026-01-01': 'completed', '2026-01-02': 'failed', tags: 'not-an-entry' } },
			{ path: 'habits/Meditate.md', frontmatter: { '2026-01-01': 'skip' } },
			{ path: 'habits/Write.md', frontmatter: { schedule: ['wed'], '2026-01-07': 'completed' } },
			{ path: 'habits/Broken.md', frontmatter: { schedule: 'sometimes' } },
			{ path: 'habits/No frontmatter.md' },
			{ path: 'habits/archive/Old.md', frontmatter: { '2026-01-01': 'completed' } }
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

		it('notifies and returns no habits when the folder does not exist', async () => {
			const { repository, notices } = buildPlatform()

			const habits = await repository.allHabits('missing')

			expect(habits).toEqual([])
			expect(notices).toEqual(['Couldn\'t find the folder "missing"'])
		})
	})

	describe('updateSchedule', () => {
		it('writes the schedule to the habit note, keeping the entries', async () => {
			const { platform, repository } = buildPlatform()
			const meditate = await habitNamed(repository, 'Meditate')

			await repository.updateSchedule(meditate, Schedule.of(['mon', 'wed']))

			expect(platform.frontmatterOf('habits/Meditate.md')).toEqual({ '2026-01-01': 'skip', schedule: ['mon', 'wed'] })
		})

		it('removes the property when no day is chosen', async () => {
			const { platform, repository } = buildPlatform()
			const write = await habitNamed(repository, 'Write')

			await repository.updateSchedule(write, Schedule.unscheduled())

			expect(platform.frontmatterOf('habits/Write.md')).toEqual({ '2026-01-07': 'completed' })
		})

		it('notifies when the note is gone', async () => {
			const { platform, repository, notices } = buildPlatform()
			const meditate = await habitNamed(repository, 'Meditate')
			vi.spyOn(platform, 'updateFrontmatter').mockResolvedValue(false)

			await repository.updateSchedule(meditate, Schedule.of(['mon']))

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
})
