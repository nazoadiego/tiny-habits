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
	 @description
		Writes every key in `values` to the file's frontmatter in a single write.
		A key whose value is undefined is removed from the frontmatter.
	 @returns false when the file doesn't exist.
	 */
	updateFrontmatter(path: string, values: FrontmatterUpdate): Promise<boolean>

	/**
	 @description Calls back with the parent folder path whenever a file is created, renamed, deleted or modified.
	 */
	onFolderChanged(callback: (folderPath: string) => void): void

	/**
	 @description
		Creates an empty note named `<name>.md` in the folder, creating the folder (and its parents) first when it doesn't exist.
	 @returns 'exists' when the folder already has a note with that name.
	 */
	createHabitFile(folderPath: string, name: string): Promise<CreateHabitFileResult>

	/**
	 @description Asks the user for a line of text.
	 @returns undefined when the user cancels.
	 */
	askText(question: string, placeholder?: string): Promise<string | undefined>

	/**
	 @description Asks the user to pick one of the choices.
	 @returns undefined when the user cancels.
	 */
	askChoice(question: string, choices: string[]): Promise<string | undefined>

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

export type CreateHabitFileResult = 'created' | 'exists'

export type Frontmatter = Record<string, unknown>

export type FrontmatterUpdate = Record<string, string | string[] | undefined>

export type IconRenderer = (element: HTMLElement, icon: string) => void
