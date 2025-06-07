import { App, Modal, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { mount, unmount } from 'svelte';
import Counter from 'components/Counter.svelte';
import TinyHabitsView from 'views/TinyHabitsView';
import HabitRepository from 'repositories/HabitRepository';
import { habitStore } from 'stores/store';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	private habitRepository: HabitRepository

	async onload() {
		await this.loadSettings();
		this.habitRepository = new HabitRepository(this.app.vault, this.app.fileManager)

		this.mountCommands(this.app, this)
		this.mountSettings(this.app, this)
		this.registerHabitEvents()
		this.loadHabits()

		this.registerMarkdownCodeBlockProcessor(
			'habits',
			(source, element, context) => {
				new TinyHabitsView(source, element, context, this.app, this.habitRepository)
			}
		)
	}

	async loadHabits() {
		const habits = await this.habitRepository.allHabits();
		habitStore.set(habits);
	}

	registerHabitEvents() {
		this.registerEvent(
			this.app.vault.on("create", () => this.loadHabits())
		);
		this.registerEvent(
			this.app.vault.on("rename", () => this.loadHabits())
		);
		this.registerEvent(
			this.app.vault.on("delete", () => this.loadHabits())
		);
		this.registerEvent(
			this.app.vault.on("modify", () => this.loadHabits())
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

	mountSettings(app: App, plugin: MyPlugin): void {
		// This adds a settings tab so the user can configure various aspects of the plugin
		plugin.addSettingTab(new SampleSettingTab(app, plugin));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
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
class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
