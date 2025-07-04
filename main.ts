import { Plugin, TAbstractFile, TFile } from 'obsidian';
import TinyHabitsView from 'views/TinyHabitsView';
import HabitRepository from 'repositories/HabitRepository';
import { habitStore } from 'stores/store';
import { get } from 'svelte/store';

// * Why onLayoutReady? https://docs.obsidian.md/Plugins/Guides/Optimizing+plugin+load+time 

export default class TinyHabitsPlugin extends Plugin {
	private habitRepository: HabitRepository
	private settings: { folderPath: string, displayName: string | undefined }

	async onload() {
		this.habitRepository = new HabitRepository(this.app.vault, this.app.fileManager)

		this.registerMarkdownCodeBlockProcessor(
			'habits',
			(source, element, context) => {
				this.app.workspace.onLayoutReady(async () => {
					this.registerHabitEvents()

					this.settings = JSON.parse(source) // TODO: Should check if they exists, undefined would break here, maybe get some errors to display to the user
					const folderPath = this.settings.folderPath
					const displayName = this.settings.displayName

					await this.loadHabits(folderPath)

					new TinyHabitsView(source, element, context, this.app, this.habitRepository, folderPath, displayName)
				});
			}
		)
	}

	async loadHabits(folderPath: string | undefined) {
		if (folderPath == undefined) return

		const habits = await this.habitRepository.allHabits(folderPath);

		habitStore.update(currentStore => ({
			...currentStore,
			[folderPath]: habits
		}));
	}

	async refreshHabits(folderPath: string | undefined) {
		if (folderPath == undefined) return

		const currentStore = get(habitStore)
		const isHabitFolder = currentStore[folderPath] != undefined

		if (!isHabitFolder) return

		const habits = await this.habitRepository.allHabits(folderPath);

		habitStore.update(currentStore => ({
			...currentStore,
			[folderPath]: habits
		}));
	}

	registerHabitEvents() {
		this.registerEvent(
			this.app.vault.on("create", (file) => this.refreshHabits(this.getFolderPath(file)))
		);
		this.registerEvent(
			this.app.vault.on("rename", (file) => this.refreshHabits(this.getFolderPath(file)))
		);
		this.registerEvent(
			this.app.vault.on("delete", (file) => this.refreshHabits(this.getFolderPath(file)))
		);
		this.registerEvent(
			this.app.vault.on("modify", (file) => this.refreshHabits(this.getFolderPath(file)))
		);
	}

	getFolderPath(file: TAbstractFile) {
		if (!(file instanceof TFile)) return undefined
		if (file.parent == undefined) return undefined

		return file.parent.path
	}

	onunload() {}
}

