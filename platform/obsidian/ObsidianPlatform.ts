import { type App, MarkdownView, Modal, Notice, type Plugin, setIcon, TFile, TFolder, type TAbstractFile } from 'obsidian'
import type { CreateHabitFileResult, FrontmatterUpdate, HabitFile, ModalRenderer, Platform, RenameHabitFileResult } from 'platform/Platform'

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

	async updateFrontmatter(path: string, values: FrontmatterUpdate): Promise<boolean> {
		const file = this.app.vault.getFileByPath(path)

		if (!(file instanceof TFile)) return false

		await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
			for (const [key, value] of Object.entries(values)) {
				if (value === undefined) delete frontmatter[key]
				else frontmatter[key] = value
			}
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

	async createHabitFile(folderPath: string, name: string): Promise<CreateHabitFileResult> {
		await this.ensureFolder(folderPath)

		const path = `${folderPath}/${name}.md`
		if (this.app.vault.getAbstractFileByPath(path) != undefined) return 'exists'

		await this.app.vault.create(path, '')

		return 'created'
	}

	listFolders(): string[] {
		return this.app.vault.getAllFolders(false).map(folder => folder.path).toSorted((first, second) => first.localeCompare(second))
	}

	createFolder(folderPath: string): Promise<void> {
		return this.ensureFolder(folderPath)
	}

	insertAtCursor(text: string): boolean {
		const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor
		if (editor == undefined) return false

		editor.replaceRange(text, editor.getCursor())

		return true
	}

	// Creates each missing level on its own, so it works the same whatever the vault adapter does with nested paths.
	private async ensureFolder(folderPath: string) {
		let path = ''

		for (const segment of folderPath.split('/').filter(Boolean)) {
			path = path === '' ? segment : `${path}/${segment}`

			if (this.app.vault.getAbstractFileByPath(path) == undefined) await this.app.vault.createFolder(path)
		}
	}

	async renameHabitFile(path: string, newPath: string): Promise<RenameHabitFileResult> {
		const file = this.app.vault.getFileByPath(path)
		if (!(file instanceof TFile)) return 'missing'

		if (this.app.vault.getAbstractFileByPath(newPath) != undefined) return 'exists'

		await this.ensureFolder(newPath.slice(0, newPath.lastIndexOf('/')))
		// The file manager, not the vault, so links to the note are updated too.
		await this.app.fileManager.renameFile(file, newPath)

		return 'renamed'
	}

	openModal(title: string, render: ModalRenderer): void {
		const modal = new HabitModal(this.app, title, render)
		modal.open()
	}

	notify(message: string): void {
		new Notice(message)
	}

	setIcon(element: HTMLElement, icon: string): void {
		setIcon(element, icon)
	}
}

class HabitModal extends Modal {
	private teardown: (() => void) | void

	constructor(app: App, private readonly title: string, private readonly render: ModalRenderer) {
		super(app)
	}

	onOpen() {
		this.setTitle(this.title)
		this.modalEl.addClass('tiny-habits-modal')
		this.teardown = this.render(this.contentEl, () => this.close())
	}

	onClose() {
		this.teardown?.()
		this.contentEl.empty()
	}
}
