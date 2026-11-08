import InMemoryPlatform from 'platform/memory/InMemoryPlatform'

describe('InMemoryPlatform', () => {
	it('reports the parent folder after a frontmatter write', async () => {
		const platform = new InMemoryPlatform({ folders: ['habits'], files: [{ path: 'habits/Read.md' }] })
		const changedFolders: string[] = []
		platform.onFolderChanged(folderPath => changedFolders.push(folderPath))

		await platform.updateFrontmatter('habits/Read.md', { '2026-01-01': 'completed', '2026-01-02': 'skip' })
		await Promise.resolve()

		expect(changedFolders).toEqual(['habits'])
		expect(platform.frontmatterOf('habits/Read.md')).toEqual({ '2026-01-01': 'completed', '2026-01-02': 'skip' })
	})

	it('rejects files outside the declared folders', () => {
		expect(() => new InMemoryPlatform({ folders: ['habits'], files: [{ path: 'other/Read.md' }] })).toThrow()
	})

	it('moves a note to another folder, keeping its frontmatter', async () => {
		const platform = new InMemoryPlatform({ folders: ['habits'], files: [{ path: 'habits/Read.md', frontmatter: { order: 2 } }, { path: 'habits/Run.md' }] })

		expect(await platform.renameHabitFile('habits/Read.md', 'work/Read.md')).toBe('renamed')
		expect(platform.frontmatterOf('work/Read.md')).toEqual({ order: 2 })
		expect(platform.listHabitFiles('habits')?.map(file => file.basename)).toEqual(['Run'])
		expect(await platform.renameHabitFile('habits/Run.md', 'work/Read.md')).toBe('exists')
		expect(await platform.renameHabitFile('habits/Gone.md', 'work/Gone.md')).toBe('missing')
	})
})
