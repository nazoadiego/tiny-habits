import { App, Modal, Plugin, TAbstractFile, TFile  } from 'obsidian';
import { mount, unmount } from 'svelte';
import Counter from 'components/Counter.svelte';
import TinyHabitsView from 'views/TinyHabitsView';
import HabitRepository from 'repositories/HabitRepository';
import { habitStore } from 'stores/store';

export default class MyPlugin extends Plugin {
	private habitRepository: HabitRepository
	private settings: { folderPath: string }

	async onload() {
		this.habitRepository = new HabitRepository(this.app.vault, this.app.fileManager)

		this.mountCommands(this.app, this)


		this.registerMarkdownCodeBlockProcessor(
			'habits',
			(source, element, context) => {
				this.settings = JSON.parse(source)
				const folderPath = this.settings.folderPath
				this.registerHabitEvents()
				this.loadHabits(folderPath)

				new TinyHabitsView(source, element, context, this.app, this.habitRepository, folderPath)
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

	getFolderPath(file: TAbstractFile) {
		if (!(file instanceof TFile)) return undefined
		if (file.parent == undefined) return undefined

		return file.parent.path
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


	onunload() {}

	mountCommands(app: App, plugin: MyPlugin) {
		// This adds a simple command that can be triggered anywhere
		plugin.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(app).open();
			}
		});
	}
}

class SampleModal extends Modal {
	counter: ReturnType<typeof Counter> | undefined;

	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		this.counter = mount(Counter, {
			target: contentEl,
			props: {
				startCount: 5,
			}
		});

		// Since the component instance is typed, the exported `increment` method is known to TypeScript.
		this.counter.increment();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
		if (this.counter) {
			// Remove the Counter from the ItemView.
			unmount(this.counter);
		}
	}
}
