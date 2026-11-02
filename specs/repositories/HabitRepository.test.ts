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

function entryFor(habitPath: string) {
	return Entry.empty({ habitId: 'Read', habitPath, date: new DateValue('2026-01-03') })
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

	describe('updateEntry', () => {
		it('writes the status to the frontmatter and returns the updated entry', async () => {
			const { platform, repository } = buildPlatform()

			const updatedEntry = repository.updateEntry(entryFor('habits/Read.md'), Entry.STATUS.completed)
			await vi.waitFor(() => expect(platform.frontmatterOf('habits/Read.md')?.['2026-01-03']).toBe('completed'))

			expect(updatedEntry.status).toBe('completed')
			expect(platform.frontmatterOf('habits/Read.md')?.['2026-01-01']).toBe('completed')
		})

		it('notifies when the habit file does not exist', async () => {
			const { repository, notices } = buildPlatform()

			repository.updateEntry(entryFor('habits/Gone.md'), Entry.STATUS.completed)

			await vi.waitFor(() => expect(notices).toEqual(['Couldn\'t update the habit entry!']))
		})
	})
})
