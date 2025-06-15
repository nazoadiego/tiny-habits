import { Plugin, TAbstractFile, TFile } from 'obsidian';
import TinyHabitsView from 'views/TinyHabitsView';
import HabitRepository from 'repositories/HabitRepository';
import { habitStore } from 'stores/store';

// * Why onLayoutReady? https://docs.obsidian.md/Plugins/Guides/Optimizing+plugin+load+time 

export default class MyPlugin extends Plugin {
	private habitRepository: HabitRepository
	private settings: { folderPath: string }

	async onload() {
		this.habitRepository = new HabitRepository(this.app.vault, this.app.fileManager)

		this.registerMarkdownCodeBlockProcessor(
			'habits',
			(source, element, context) => {
				this.app.workspace.onLayoutReady(async () => {
					this.settings = JSON.parse(source) // TODO: Should check if they exists
					const folderPath = this.settings.folderPath
					this.registerHabitEvents()
					await this.loadHabits(folderPath)

					new TinyHabitsView(source, element, context, this.app, this.habitRepository, folderPath)
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

	registerHabitEvents() {
		this.registerEvent(
			this.app.vault.on("create", (file) => this.loadHabits(this.getFolderPath(file)))
		);
		this.registerEvent(
			this.app.vault.on("rename", (file) => this.loadHabits(this.getFolderPath(file)))
		);
		this.registerEvent(
			this.app.vault.on("delete", (file) => this.loadHabits(this.getFolderPath(file)))
		);
		this.registerEvent(
			this.app.vault.on("modify", (file) => this.loadHabits(this.getFolderPath(file)))
		);
	}

	getFolderPath(file: TAbstractFile) {
		if (!(file instanceof TFile)) return undefined
		if (file.parent == undefined) return undefined

		return file.parent.path
	}

	onunload() {}
}

