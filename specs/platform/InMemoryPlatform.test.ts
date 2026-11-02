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
})
