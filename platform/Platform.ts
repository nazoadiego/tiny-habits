/**
 @description
	Everything Tiny Habits needs from its host (Obsidian, the localhost dev page, tests).
	Code outside `platform/` depends on this interface, never on the host's own API.
 */
export type Platform = {
	/**
	 @returns The files directly inside the folder, sorted by name, or undefined when the folder doesn't exist.
	 */
	listHabitFiles(folderPath: string): HabitFile[] | undefined

	/**
	 @description Writes every key in `values` to the file's frontmatter in a single write.
	 @returns false when the file doesn't exist.
	 */
	updateFrontmatter(path: string, values: Record<string, string>): Promise<boolean>

	/**
	 @description Calls back with the parent folder path whenever a file is created, renamed, deleted or modified.
	 */
	onFolderChanged(callback: (folderPath: string) => void): void

	notify(message: string): void

	setIcon: IconRenderer
}

export type HabitFile = {
	/** File name without its extension. */
	basename: string
	/** Full path from the vault root, with the extension. */
	path: string
	frontmatter: Frontmatter | undefined
}

export type Frontmatter = Record<string, unknown>

export type IconRenderer = (element: HTMLElement, icon: string) => void
