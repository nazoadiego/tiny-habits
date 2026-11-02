import { Notice, type Plugin, setIcon, TFile, TFolder, type TAbstractFile } from 'obsidian'
import type { HabitFile, Platform } from 'platform/Platform'

export default class ObsidianPlatform implements Platform {
	private readonly plugin

	constructor(plugin: Plugin) {
		this.plugin = plugin
	}

	private get app() {
		return this.plugin.app
	}

	listHabitFiles(folderPath: string): HabitFile[] | undefined {
		const folder = this.app.vault.getFolderByPath(folderPath)

		if (!(folder instanceof TFolder)) return undefined

		return folder.children
			.filter((child): child is TFile => child instanceof TFile)
			.toSorted((firstFile, secondFile) => firstFile.name.localeCompare(secondFile.name))
			.map(file => ({
				basename: file.basename,
				path: file.path,
				frontmatter: this.app.metadataCache.getFileCache(file)?.frontmatter
			}))
	}

	async updateFrontmatter(path: string, values: Record<string, string>): Promise<boolean> {
		const file = this.app.vault.getFileByPath(path)

		if (!(file instanceof TFile)) return false

		await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
			Object.assign(frontmatter, values)
		})

		return true
	}

	onFolderChanged(callback: (folderPath: string) => void): void {
		const notify = (file: TAbstractFile) => {
			const folderPath = file.parent?.path
			if (folderPath != undefined) callback(folderPath)
		}

		const { vault, metadataCache } = this.app

		this.plugin.registerEvent(vault.on('create', notify))
		this.plugin.registerEvent(vault.on('rename', notify))
		this.plugin.registerEvent(vault.on('delete', notify))
		this.plugin.registerEvent(vault.on('modify', notify))
		this.plugin.registerEvent(metadataCache.on('changed', notify))
	}

	notify(message: string): void {
		new Notice(message)
	}

	setIcon(element: HTMLElement, icon: string): void {
		setIcon(element, icon)
	}
}
