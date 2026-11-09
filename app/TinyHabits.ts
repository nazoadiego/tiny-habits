import { mount, unmount } from 'svelte'
import { get } from 'svelte/store'
import HabitRepository, { type HabitDetails } from 'repositories/HabitRepository'
import { habitStore } from 'stores/store'
import HabitsTable from 'components/HabitsTable.svelte'
import HabitForm from 'components/HabitForm.svelte'
import TableForm from 'components/TableForm.svelte'
import { tableBlock, type TableDetails } from 'models/TableBlock'
import SomethingWentWrongMessage from 'components/SomethingWentWrongMessage.svelte'
import addHabit from 'app/addHabit'
import SourceSettings from 'models/SourceSettings'
import type { Status } from 'models/Entry'
import type Entry from 'models/Entry'
import type Habit from 'models/Habit'
import { CADENCE_NAMES, type Cadence } from 'models/Cadence'
import type { Platform } from 'platform/Platform'
import { iconContext } from 'platform/iconContext'

/**
 @description
	Renders habit tables and keeps them in sync with the habit files.
	Host-agnostic: the Obsidian plugin and the localhost dev page both drive it through a Platform.
 */
export default class TinyHabits {
	private readonly platform
	private readonly habitRepository
	private readonly dateFilters: Map<string, Set<string>> = new Map()
	/** What one column is in each table, by folder. */
	private readonly cadences: Map<string, Cadence> = new Map()
	/** The tables on screen, by the element they were rendered into. */
	private readonly tables: Map<HTMLElement, { folderPath: string, cadence: Cadence }> = new Map()

	constructor(platform: Platform) {
		this.platform = platform
		this.habitRepository = new HabitRepository(platform)
	}

	/**
	 @description Starts refreshing tables when their habit files change. Call once.
	 */
	watchHabitFiles() {
		this.platform.onFolderChanged((folderPath) => this.refreshHabitStore(folderPath))
	}

	/**
	 @param source The text inside a `habits` code block.
	 @param element Where to mount the table.
	 */
	async renderCodeBlock(source: string, element: HTMLElement) {
		const { settings, messages } = SourceSettings.fromSource(source)

		for (const message of messages) this.platform.notify(message)

		if (settings == undefined) return mount(SomethingWentWrongMessage, { target: element })

		this.warnOnCadenceConflict(element, settings)
		this.cadences.set(settings.folderPath, settings.cadence)

		return mount(HabitsTable, {
			target: element,
			context: iconContext((iconElement, icon) => this.platform.setIcon(iconElement, icon)),
			props: {
				updateEntries: (entries: Entry[], status: Status) => this.habitRepository.updateEntries(entries, status),
				editHabit: (habit: Habit) => this.openHabitForm(settings.folderPath, habit),
				createHabit: () => this.openHabitForm(settings.folderPath),
				moveHabit: (habits: Habit[], fromIndex: number, toIndex: number) => this.habitRepository.moveHabit(habits, fromIndex, toIndex),
				loadHabits: (folderPath: string, dateFilter: Set<string>) => this.loadHabitStore(folderPath, dateFilter),
				settings
			}
		})
	}

	/**
	 @description
		The habits of a folder, and the dates they keep, are stored once per folder. Two tables on one folder with
		different cadences would overwrite each other's, so this warns when a table joins one that is still on screen.
	 */
	private warnOnCadenceConflict(element: HTMLElement, { folderPath, cadence }: SourceSettings) {
		for (const other of this.tables.keys()) if (!other.isConnected) this.tables.delete(other)

		const conflict = [...this.tables.values()].find(table => table.folderPath === folderPath && table.cadence !== cadence)
		this.tables.set(element, { folderPath, cadence })

		if (conflict == undefined) return

		this.platform.notify(`Two habit tables on "${folderPath}" use different cadences (${CADENCE_NAMES[conflict.cadence]} and ${CADENCE_NAMES[cadence]}). Use one cadence per folder, or the tables will show the wrong entries.`)
	}

	/**
	 @description
		Opens the habit form for a new habit. The tables are the ones this session has rendered;
		with several, the user picks one in the form.
	 */
	addHabit() {
		return addHabit(this.platform, Object.keys(get(habitStore)), (folderPath) => this.openHabitForm(folderPath))
	}

	/**
	 @description
		The "Add Table" command: asks for the table's name, folder and cadence, creates the folder if it is new,
		and writes the `habits` block into the note being edited.
	 */
	addTable() {
		this.platform.openModal('New table', (container, close) => {
			const form = mount(TableForm, { target: container, props: { folders: this.platform.listFolders(), save: (details: TableDetails) => this.saveTable(details), close } })

			return () => void unmount(form)
		})
	}

	private async saveTable(details: TableDetails) {
		const block = tableBlock(details)

		if (!this.platform.listFolders().includes(details.folderPath)) await this.platform.createFolder(details.folderPath)

		if (this.platform.insertAtCursor(block)) return true

		this.platform.notify('Open a note to add the table to')
		return false
	}

	/**
	 @description Opens the habit form: to edit `habit`, or to create a habit when there is none.
	 @param folderPath The table the form starts on.
	 */
	private openHabitForm(folderPath: string, habit?: Habit) {
		const save = (details: HabitDetails, siblings: Habit[]) => habit == undefined
			? this.habitRepository.createHabit(details, siblings)
			: this.habitRepository.updateHabit(habit, details, siblings)

		this.platform.openModal(habit == undefined ? 'New habit' : 'Edit habit', (container, close) => {
			const form = mount(HabitForm, {
				target: container,
				props: { habit, folderPath, habitsByTable: get(habitStore), cadenceByTable: Object.fromEntries(this.cadences), save, close }
			})

			return () => void unmount(form)
		})
	}

	async loadHabitStore(folderPath: string | undefined, dateFilter?: Set<string>) {
		if (folderPath == undefined) return

		if (dateFilter) this.dateFilters.set(folderPath, dateFilter)

		const filter = dateFilter ?? this.dateFilters.get(folderPath)
		const habits = await this.habitRepository.allHabits(folderPath, filter, this.cadences.get(folderPath))

		habitStore.update(currentStore => ({ ...currentStore, [folderPath]: habits }))
	}

	private refreshHabitStore(folderPath: string) {
		const isHabitFolder = get(habitStore)[folderPath] != undefined

		// This is a guard clause because we only want to react to events on our habit files, not every file.
		if (!isHabitFolder) return

		this.loadHabitStore(folderPath)
	}
}
