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
	 @description
		Moves and/or renames a note, creating the destination folder first when it doesn't exist.
		Links to the note follow it where the host supports that.
	 @returns 'exists' when the destination is taken, 'missing' when there is no note at `path`.
	 */
	renameHabitFile(path: string, newPath: string): Promise<RenameHabitFileResult>

	/**
	 @returns Every folder path of the vault (without the root), sorted.
	 */
	listFolders(): string[]

	/**
	 @description Creates the folder (and its parents) when it doesn't exist.
	 */
	createFolder(folderPath: string): Promise<void>

	/**
	 @description Inserts the text into the note being edited, at the cursor.
	 @returns false when no note is being edited.
	 */
	insertAtCursor(text: string): boolean

	/**
	 @description
		Opens a modal dialog and calls `render` to fill it. `render` may return a function that tears down what it rendered,
		which the host calls when the modal closes, however it closes.
	 @param title The dialog's heading.
	 @param render Gets the dialog's content element, and a function that closes the dialog.
	 */
	openModal(title: string, render: ModalRenderer): void

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

export type ModalRenderer = (container: HTMLElement, close: () => void) => (() => void) | void

export type CreateHabitFileResult = 'created' | 'exists'

export type RenameHabitFileResult = 'renamed' | 'exists' | 'missing'

export type Frontmatter = Record<string, unknown>

export type FrontmatterUpdate = Record<string, string | number | string[] | undefined>

export type IconRenderer = (element: HTMLElement, icon: string) => void
