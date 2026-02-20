import { Editor, Plugin, TAbstractFile } from 'obsidian'
import HabitRepository from 'repositories/HabitRepository'
import { habitStore } from 'stores/store'
import { get } from 'svelte/store'
import HabitsTable from 'components/HabitsTable.svelte'
import { mount } from 'svelte'
import SourceSettings from 'models/SourceSettings'
import SomethingWentWrongMessage from 'components/SomethingWentWrongMessage.svelte'
import type { Status } from 'models/Entry'
import type Entry from 'models/Entry'

// * Why onLayoutReady? https://docs.obsidian.md/Plugins/Guides/Optimizing+plugin+load+time

export default class TinyHabitsPlugin extends Plugin {
	private habitRepository: HabitRepository
	private dateFilters: Map<string, Set<string>> = new Map()

	async onload() {
		this.habitRepository = new HabitRepository(this.app.vault, this.app.fileManager, this.app.metadataCache)

		this.registerCommands()

		this.registerMarkdownCodeBlockProcessor('habits', (source, element) => {
			this.app.workspace.onLayoutReady(async () => {
				this.registerHabitEvents()

				const settings = SourceSettings.fromSource(source)

				if (settings == undefined) return mount(SomethingWentWrongMessage, { target: element })

				await this.loadHabitStore(settings.folderPath)

				mount(HabitsTable, {
					target: element,
					props: {
						updateEntry: (entry: Entry, status: Status) => this.habitRepository.updateEntry(entry, status),
						loadHabits: (folderPath: string, dateFilter: Set<string>) => this.loadHabitStore(folderPath, dateFilter),
						settings
					}
				})
			})
		})
	}

	async loadHabitStore(folderPath: string | undefined, dateFilter?: Set<string>) {
		if (folderPath == undefined) return

		if (dateFilter) this.dateFilters.set(folderPath, dateFilter)

		const filter = dateFilter ?? this.dateFilters.get(folderPath)
		const habits = await this.habitRepository.allHabits(folderPath, filter)

		habitStore.update(currentStore => ({ ...currentStore, [folderPath]: habits }))
	}

	async refreshHabitStore(file: TAbstractFile) {
		const folderPath = file.parent?.path
		if (folderPath == undefined) return

		const storeValue = get(habitStore)
		const isHabitFolder = storeValue[folderPath] != undefined

		// This is a guard clause because we only want to react to events on our habit files, not every file.
		if (!isHabitFolder) return

		this.loadHabitStore(folderPath)
	}

	registerHabitEvents() {
		this.registerEvent(this.app.vault.on('create', (file) => this.refreshHabitStore(file)))
		this.registerEvent(this.app.vault.on('rename', (file) => this.refreshHabitStore(file)))
		this.registerEvent(this.app.vault.on('delete', (file) => this.refreshHabitStore(file)))
		this.registerEvent(this.app.vault.on('modify', (file) => this.refreshHabitStore(file)))
		this.registerEvent(this.app.metadataCache.on('changed', (file) => this.refreshHabitStore(file)))
	}

	registerCommands() {
		this.addCommand({
			id: 'tiny-habits-add-table',
			name: 'Add Table',
			editorCallback: (editor: Editor) => {
				const newTableBlock = '```habits\n{\n\t"folderPath": "habits",\n\t"displayName": "My Habits"\n}\n```'

				editor.replaceRange(newTableBlock, editor.getCursor())
			}
		})
	}

	onunload() {}
}

