import { FileManager, Notice, TFile, type Vault } from "obsidian";
import type { THabitRepository } from '../types/THabitRepository';
import Habit from "models/Habit";
import Entry from "models/Entry";
import { HabitBuilder }  from "builders/HabitBuilder";

class HabitRepository implements THabitRepository {
	private readonly vault
	private readonly fileManager

	constructor(vault: Vault, fileManager: FileManager) {
		this.vault = vault
		this.fileManager = fileManager
	}

	async allHabits(folderPath: string) {
		const files = await this.allHabitFiles(folderPath)

		const habits = await Array.fromAsync(files, (file) => this.buildHabits(file))

		return habits
	}

	async allHabitFiles(folderPath: string) {
		const folder = this.vault.getFolderByPath(folderPath)

		if (folder == undefined) return []

		const files = folder.children.filter((child): child is TFile => child instanceof TFile)
	
		return files.sort((firstFile, secondFile) => firstFile.name.localeCompare(secondFile.name));
	}

	async buildHabits(file: TFile) {
		try {
			const data = await this.vault.read(file);
			return HabitBuilder.fromFile(file, data);
		}
		catch (error) {
			console.warn(`Failed to build habits for ${file.basename}:`, error);
			return Habit.empty(file)
		}
	}

	updateEntry(habitPath: Habit['path'], entry: Entry) {
		const file = this.vault.getFileByPath(habitPath)

		if (!file || !(file instanceof TFile)) {
			new Notice("Couldn't update the habit entry!")
			return
		}

		this.fileManager.processFrontMatter(file, (frontmatter) => {
			frontmatter[entry.frontMatterDate()] = entry.nextStatus()
		});
	}
}

export default HabitRepository