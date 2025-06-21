import { Vault, type App, type MarkdownPostProcessorContext } from 'obsidian'
import { mount } from "svelte";
import HabitsTable from 'components/HabitsTable.svelte';
import HabitRepository from 'repositories/HabitRepository';

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
				habitRepository: this.habitRepository,
				folderPath: this.folderPath,
				displayName: this.displayName
			}
		});
	}

	async renderView() {
		await this.mountHabits();
	}
}
