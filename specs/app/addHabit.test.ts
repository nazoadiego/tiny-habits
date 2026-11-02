import addHabit from 'app/addHabit'
import HabitRepository from 'repositories/HabitRepository'
import InMemoryPlatform from 'platform/memory/InMemoryPlatform'

function setup({ answers, choice }: { answers: (string | undefined)[], choice?: string }) {
	const notices: string[] = []
	const questions: string[] = []
	const platform = new InMemoryPlatform({
		folders: ['habits', 'work'],
		files: [{ path: 'habits/Read.md' }],
		notify: (message) => notices.push(message),
		askText: (question) => {
			questions.push(question)
			return Promise.resolve(answers.shift())
		},
		askChoice: () => Promise.resolve(choice)
	})

	const repository = new HabitRepository(platform)

	return { platform, notices, questions, run: (folders: string[]) => addHabit(platform, repository, folders) }
}

describe('addHabit', () => {
	it('tells the user to open a table first when none is known', async () => {
		const { run, notices } = setup({ answers: ['Run'] })

		await run([])

		expect(notices).toEqual(['Open a note with a habits table first, then add a habit'])
	})

	it('adds the habit to the only table', async () => {
		const { run, platform, notices } = setup({ answers: ['  Run '] })

		await run(['habits'])

		expect(platform.listHabitFiles('habits')?.map(file => file.basename)).toEqual(['Read', 'Run'])
		expect(notices).toEqual(['Added Run to habits'])
	})

	it('lets the user pick the table when there are several', async () => {
		const { run, platform } = setup({ answers: ['Run'], choice: 'work' })

		await run(['habits', 'work'])

		expect(platform.listHabitFiles('work')?.map(file => file.basename)).toEqual(['Run'])
	})

	it('creates nothing when the user cancels', async () => {
		const { run, platform } = setup({ answers: [undefined] })

		await run(['habits'])

		expect(platform.listHabitFiles('habits')).toHaveLength(1)
	})

	it('asks again with the reason when the name is invalid', async () => {
		const { run, platform, questions } = setup({ answers: ['a/b', 'Run'] })

		await run(['habits'])

		expect(questions[1]).toBe('A habit name can\'t contain "/"')
		expect(platform.listHabitFiles('habits')?.map(file => file.basename)).toContain('Run')
	})

	it('tells the user when the habit already exists', async () => {
		const { run, notices } = setup({ answers: ['Read'] })

		await run(['habits'])

		expect(notices).toEqual(['"Read" already exists in habits'])
	})

	it('creates the folder when the table points at one that does not exist yet', async () => {
		const { run, platform, notices } = setup({ answers: ['Run'] })

		await run(['new/nested'])

		expect(platform.listHabitFiles('new/nested')?.map(file => file.path)).toEqual(['new/nested/Run.md'])
		expect(notices).toEqual(['Added Run to new/nested'])
	})
})
