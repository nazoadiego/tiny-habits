import HabitRepository from 'repositories/HabitRepository'
import InMemoryPlatform from 'platform/memory/InMemoryPlatform'
import Entry from 'models/Entry'
import DateValue from 'models/DateValue'

function buildPlatform() {
	const notices: string[] = []
	const platform = new InMemoryPlatform({
		folders: ['habits', 'habits/archive'],
		files: [
			{ path: 'habits/Read.md', frontmatter: { '2026-01-01': 'completed', '2026-01-02': 'failed', tags: 'not-an-entry' } },
			{ path: 'habits/Meditate.md', frontmatter: { '2026-01-01': 'skip' } },
			{ path: 'habits/No frontmatter.md' },
			{ path: 'habits/archive/Old.md', frontmatter: { '2026-01-01': 'completed' } }
		],
		notify: (message) => notices.push(message)
	})

	return { platform, notices, repository: new HabitRepository(platform) }
}

function entryFor(habitPath: string, date: string, habitId = 'Read') {
	return Entry.empty({ habitId, habitPath, date: new DateValue(date) })
}

describe('HabitRepository', () => {
	describe('allHabits', () => {
		it('builds one habit per file directly in the folder, sorted by name', async () => {
			const { repository } = buildPlatform()

			const habits = await repository.allHabits('habits')

			expect(habits.map(habit => habit.name)).toEqual(['Meditate', 'No frontmatter', 'Read'])
			expect(habits.map(habit => habit.path)).toEqual(['habits/Meditate.md', 'habits/No frontmatter.md', 'habits/Read.md'])
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
			expect(notices).toEqual(['Invalid date format or status for entry in Habit file Read. Date: tags. Status: not-an-entry'])
		})

		it('notifies and returns no habits when the folder does not exist', async () => {
			const { repository, notices } = buildPlatform()

			const habits = await repository.allHabits('missing')

			expect(habits).toEqual([])
			expect(notices).toEqual(['Couldn\'t find the folder "missing"'])
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
