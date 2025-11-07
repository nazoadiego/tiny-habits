import { type FileManager, type MetadataCache, Notice, TFile, TFolder, type Vault } from 'obsidian'
import Habit from 'models/Habit'
import Entry, { type Status } from 'models/Entry'

export type THabitRepository = {
	allHabits(path: string): Promise<Habit[]>
	buildHabit(path: TFile): Promise<Habit>
	updateEntry(entry: Entry, status: Status): Entry
}

class HabitRepository implements THabitRepository {
	private readonly metadataCache
	private readonly vault
	private readonly fileManager

	constructor(vault: Vault, fileManager: FileManager, metadataCache: MetadataCache) {
		this.vault = vault
		this.fileManager = fileManager
		this.metadataCache = metadataCache
	}

	async allHabits(folderPath: string) {
		const folder = this.vault.getFolderByPath(folderPath)

		if (!(folder instanceof TFolder)) {
			new Notice(`Couldn't find the folder "${folderPath}"`)
			return []
		}

		const files = folder.children
			.filter((child): child is TFile => child instanceof TFile)
			.sort((firstFile, secondFile) => firstFile.name.localeCompare(secondFile.name))

		return Array.fromAsync(files, (file) => this.buildHabit(file))
	}

	async buildHabit(file: TFile) {
		try {
			return Habit.fromFile(file, this.metadataCache.getFileCache(file)?.frontmatter)
		}
		catch (error) {
			console.warn(`Failed to build habits for ${file.basename}:`, error)
			return Habit.empty(file)
		}
	}

	updateEntry(entry: Entry, status: Status) {
		const file = this.vault.getFileByPath(entry.habitPath)

		if (!(file instanceof TFile)) {
			new Notice('Couldn\'t update the habit entry!')
			return entry
		}

		const updatedEntry = new Entry({ ...entry, status })

		this.fileManager.processFrontMatter(file, (frontmatter) => {
			frontmatter[entry.frontMatterDate()] = updatedEntry.status
		})

		return updatedEntry
	}
}

export default HabitRepository
