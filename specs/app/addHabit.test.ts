import addHabit from 'app/addHabit'
import InMemoryPlatform from 'platform/memory/InMemoryPlatform'

function setup() {
	const notices: string[] = []
	const platform = new InMemoryPlatform({ folders: ['habits'], files: [], notify: (message) => notices.push(message) })
	const opened: string[] = []

	return { notices, opened, run: (folders: string[]) => addHabit(platform, folders, (folderPath) => opened.push(folderPath)) }
}

describe('addHabit', () => {
	it('tells the user to open a table first when none is known', () => {
		const { run, notices, opened } = setup()

		run([])

		expect(notices).toEqual(['Open a note with a habits table first, then add a habit'])
		expect(opened).toEqual([])
	})

	it('opens the form right away on the first table, even when there are several', () => {
		const { run, notices, opened } = setup()

		run(['habits', 'work'])

		expect(opened).toEqual(['habits'])
		expect(notices).toEqual([])
	})
})
