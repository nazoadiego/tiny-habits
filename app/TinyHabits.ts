import { mount } from 'svelte'
import { get } from 'svelte/store'
import HabitRepository from 'repositories/HabitRepository'
import { habitStore } from 'stores/store'
import HabitsTable from 'components/HabitsTable.svelte'
import SomethingWentWrongMessage from 'components/SomethingWentWrongMessage.svelte'
import addHabit from 'app/addHabit'
import SourceSettings from 'models/SourceSettings'
import DateRange from 'models/DateRange'
import type { Status } from 'models/Entry'
import type Entry from 'models/Entry'
import type Habit from 'models/Habit'
import type Schedule from 'models/Schedule'
import type { Platform } from 'platform/Platform'
import { iconContext } from 'platform/iconContext'

const NUMBER_OF_DAYS = 7

function buildDateFilter(offset: number = 0): Set<string> {
	return new Set(
		DateRange.fromToday(NUMBER_OF_DAYS - 1, offset)
			.getDates()
			.map(date => date.toYearMonthDayString())
	)
}

/**
 @description
	Renders habit tables and keeps them in sync with the habit files.
	Host-agnostic: the Obsidian plugin and the localhost dev page both drive it through a Platform.
 */
export default class TinyHabits {
	private readonly platform
	private readonly habitRepository
	private readonly dateFilters: Map<string, Set<string>> = new Map()

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

		await this.loadHabitStore(settings.folderPath, buildDateFilter())

		return mount(HabitsTable, {
			target: element,
			context: iconContext((iconElement, icon) => this.platform.setIcon(iconElement, icon)),
			props: {
				updateEntries: (entries: Entry[], status: Status) => this.habitRepository.updateEntries(entries, status),
				updateSchedule: (habit: Habit, schedule: Schedule) => this.habitRepository.updateSchedule(habit, schedule),
				loadHabits: (folderPath: string, dateFilter: Set<string>) => this.loadHabitStore(folderPath, dateFilter),
				settings
			}
		})
	}

	/**
	 @description
		Asks for a name and creates the habit in a table's folder.
		The tables are the ones this session has rendered; with several, the user picks one.
	 */
	addHabit() {
		return addHabit(this.platform, this.habitRepository, Object.keys(get(habitStore)))
	}

	async loadHabitStore(folderPath: string | undefined, dateFilter?: Set<string>) {
		if (folderPath == undefined) return

		if (dateFilter) this.dateFilters.set(folderPath, dateFilter)

		const filter = dateFilter ?? this.dateFilters.get(folderPath)
		const habits = await this.habitRepository.allHabits(folderPath, filter)

		habitStore.update(currentStore => ({ ...currentStore, [folderPath]: habits }))
	}

	private refreshHabitStore(folderPath: string) {
		const isHabitFolder = get(habitStore)[folderPath] != undefined

		// This is a guard clause because we only want to react to events on our habit files, not every file.
		if (!isHabitFolder) return

		this.loadHabitStore(folderPath)
	}
}
