import { Vault, type App, type MarkdownPostProcessorContext } from 'obsidian'
import { mount } from "svelte";
import HabitsTable from 'components/HabitsTable.svelte';
import HabitRepository from 'repositories/HabitRepository';
import type Entry from 'models/Entry';
import type Habit from 'models/Habit';

export default class TinyHabitsView {
	markdownBlockElement: HTMLElement
	habitRepository: HabitRepository
	vault: Vault
	folderPath: string
	displayName: string | undefined

	constructor(
		source: string,
		markdownBlockElement: HTMLElement,
		context: MarkdownPostProcessorContext,
		app: App,
		habitRepository: HabitRepository,
		folderPath: string,
		displayName: string | undefined
	) {
		this.habitRepository = habitRepository
		this.markdownBlockElement = markdownBlockElement
		this.folderPath = folderPath
		this.displayName = displayName
		this.renderView()
	}

	async mountHabits() {
		mount(HabitsTable, {
			target: this.markdownBlockElement,
			props: {
				updateEntry: (habitPath: Habit['path'], entry: Entry) => this.habitRepository.updateEntry(habitPath, entry),
				folderPath: this.folderPath,
				displayName: this.displayName
			}
		});
	}

	async renderView() {
		await this.mountHabits();
	}
}
