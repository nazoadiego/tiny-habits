import { type FileManager, type MetadataCache, Notice, TFile, TFolder, type Vault } from 'obsidian'
import Habit from 'models/Habit'
import Entry from 'models/Entry'

type THabitRepository = {
	allHabits(path: string): Promise<Habit[]>
	buildHabit(path: TFile): Promise<Habit>
	updateEntry(habitPath: Habit['path'], entry: Entry): void
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

	updateEntry(habitPath: Habit['path'], entry: Entry) {
		const file = this.vault.getFileByPath(habitPath)

		if (!(file instanceof TFile)) {
			new Notice('Couldn\'t update the habit entry!')
			return
		}

		this.fileManager.processFrontMatter(file, (frontmatter) => {
			frontmatter[entry.frontMatterDate()] = entry.nextStatus()
		})
	}
}

export default HabitRepository
