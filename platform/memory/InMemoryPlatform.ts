import type { Frontmatter, HabitFile, IconRenderer, Platform } from 'platform/Platform'

type InMemoryFile = { path: string, frontmatter?: Frontmatter }

type InMemoryPlatformOptions = {
	folders: string[]
	files: InMemoryFile[]
	notify?: (message: string) => void
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

	constructor({ folders, files, notify, setIcon }: InMemoryPlatformOptions) {
		this.folders = new Set(folders)
		this.files = new Map(files.map(file => [file.path, file.frontmatter]))
		this.notifyCallback = notify ?? ((message: string) => console.info(`[notice] ${message}`))
		this.iconRenderer = setIcon ?? (() => {})

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

	async updateFrontmatter(path: string, values: Record<string, string>): Promise<boolean> {
		if (!this.files.has(path)) return false

		this.files.set(path, { ...this.files.get(path), ...values })

		// Obsidian fires its vault events after the write, never during it.
		queueMicrotask(() => this.emitFolderChanged(parentPath(path)))

		return true
	}

	onFolderChanged(callback: (folderPath: string) => void): void {
		this.listeners.push(callback)
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
