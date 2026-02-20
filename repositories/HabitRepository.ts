import { type FileManager, type MetadataCache, Notice, TFile, TFolder, type Vault } from 'obsidian'
import Habit from 'models/Habit'
import Entry, { type Status } from 'models/Entry'

export type THabitRepository = {
	allHabits(path: string, dateFilter?: Set<string>): Promise<Habit[]>
	buildHabit(path: TFile, dateFilter?: Set<string>): Promise<Habit>
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

	async allHabits(folderPath: string, dateFilter?: Set<string>) {
		const folder = this.vault.getFolderByPath(folderPath)

		if (!(folder instanceof TFolder)) {
			new Notice(`Couldn't find the folder "${folderPath}"`)
			return []
		}

		const files = folder.children
			.filter((child): child is TFile => child instanceof TFile)
			.toSorted((firstFile, secondFile) => firstFile.name.localeCompare(secondFile.name))

		return Array.fromAsync(files, (file) => this.buildHabit(file, dateFilter))
	}

	async buildHabit(file: TFile, dateFilter?: Set<string>) {
		try {
			return Habit.fromFile(file, this.metadataCache.getFileCache(file)?.frontmatter, dateFilter)
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
