import type { CreateHabitFileResult, Frontmatter, FrontmatterUpdate, HabitFile, IconRenderer, ModalRenderer, Platform, RenameHabitFileResult } from 'platform/Platform'

type InMemoryFile = { path: string, frontmatter?: Frontmatter }

type InMemoryPlatformOptions = {
	folders: string[]
	files: InMemoryFile[]
	notify?: (message: string) => void
	openModal?: (title: string, render: ModalRenderer) => void
	insertAtCursor?: (text: string) => boolean
	setIcon?: IconRenderer
}

/**
 @description A Platform backed by plain objects, for the localhost dev page and tests. Nothing is persisted.
 */
export default class InMemoryPlatform implements Platform {
	private readonly folders: Set<string>
	private readonly files: Map<string, Frontmatter | undefined>
	private readonly listeners: ((folderPath: string) => void)[] = []
	private readonly notifyCallback
	private readonly iconRenderer
	private readonly modalOpener
	private readonly inserter

	constructor({ folders, files, notify, openModal, insertAtCursor, setIcon }: InMemoryPlatformOptions) {
		this.folders = new Set(folders)
		this.files = new Map(files.map(file => [file.path, file.frontmatter]))
		this.notifyCallback = notify ?? ((message: string) => console.info(`[notice] ${message}`))
		this.iconRenderer = setIcon ?? (() => {})
		this.modalOpener = openModal ?? (() => {})
		this.inserter = insertAtCursor ?? (() => false)

		for (const path of this.files.keys()) {
			if (!this.folders.has(parentPath(path))) throw new Error(`File "${path}" is outside the declared folders`)
		}
	}

	listHabitFiles(folderPath: string): HabitFile[] | undefined {
		if (!this.folders.has(folderPath)) return undefined

		return [...this.files.entries()]
			.filter(([path]) => parentPath(path) === folderPath)
			.map(([path, frontmatter]) => ({ basename: basename(path), path, frontmatter: frontmatter && { ...frontmatter } }))
			.toSorted((firstFile, secondFile) => fileName(firstFile.path).localeCompare(fileName(secondFile.path)))
	}

	async updateFrontmatter(path: string, values: FrontmatterUpdate): Promise<boolean> {
		if (!this.files.has(path)) return false

		const frontmatter: Frontmatter = { ...this.files.get(path) }

		for (const [key, value] of Object.entries(values)) {
			if (value === undefined) delete frontmatter[key]
			else frontmatter[key] = value
		}

		this.files.set(path, frontmatter)

		// Obsidian fires its vault events after the write, never during it.
		queueMicrotask(() => this.emitFolderChanged(parentPath(path)))

		return true
	}

	onFolderChanged(callback: (folderPath: string) => void): void {
		this.listeners.push(callback)
	}

	async createHabitFile(folderPath: string, name: string): Promise<CreateHabitFileResult> {
		for (let folder = folderPath; folder !== '/'; folder = parentPath(folder)) this.folders.add(folder)

		const path = `${folderPath}/${name}.md`
		if (this.files.has(path)) return 'exists'

		this.files.set(path, undefined)
		queueMicrotask(() => this.emitFolderChanged(folderPath))

		return 'created'
	}

	async renameHabitFile(path: string, newPath: string): Promise<RenameHabitFileResult> {
		if (!this.files.has(path)) return 'missing'
		if (this.files.has(newPath)) return 'exists'

		const oldFolder = parentPath(path)
		const newFolder = parentPath(newPath)
		for (let folder = newFolder; folder !== '/'; folder = parentPath(folder)) this.folders.add(folder)

		this.files.set(newPath, this.files.get(path))
		this.files.delete(path)

		queueMicrotask(() => {
			this.emitFolderChanged(oldFolder)
			if (newFolder !== oldFolder) this.emitFolderChanged(newFolder)
		})

		return 'renamed'
	}

	listFolders(): string[] {
		return [...this.folders].toSorted((first, second) => first.localeCompare(second))
	}

	async createFolder(folderPath: string): Promise<void> {
		for (let folder = folderPath; folder !== '/'; folder = parentPath(folder)) this.folders.add(folder)
	}

	insertAtCursor(text: string): boolean {
		return this.inserter(text)
	}

	openModal(title: string, render: ModalRenderer): void {
		this.modalOpener(title, render)
	}

	notify(message: string): void {
		this.notifyCallback(message)
	}

	setIcon(element: HTMLElement, icon: string): void {
		this.iconRenderer(element, icon)
	}

	frontmatterOf(path: string): Frontmatter | undefined {
		return this.files.get(path)
	}

	private emitFolderChanged(folderPath: string) {
		for (const listener of this.listeners) listener(folderPath)
	}
}

function fileName(path: string) {
	return path.slice(path.lastIndexOf('/') + 1)
}

function parentPath(path: string) {
	const lastSlash = path.lastIndexOf('/')
	return lastSlash === -1 ? '/' : path.slice(0, lastSlash)
}

function basename(path: string) {
	const name = fileName(path)
	const lastDot = name.lastIndexOf('.')
	return lastDot <= 0 ? name : name.slice(0, lastDot)
}
