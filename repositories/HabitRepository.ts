import Habit from 'models/Habit'
import type Entry from 'models/Entry'
import { sortByOrder, reorder, type OrderChange } from 'models/HabitOrder'
import Schedule from 'models/Schedule'
import type { Cadence } from 'models/Cadence'
import type { Status } from 'models/Entry'
import type { FrontmatterUpdate, HabitFile, Platform } from 'platform/Platform'

/** What the habit form edits. `position` is the habit's index in the table it ends up in; without one, the table's own sorting decides. */
export type HabitDetails = {
	name: string
	folderPath: string
	schedule: Schedule
	position?: number
}

export type THabitRepository = {
	allHabits(path: string, dateFilter?: Set<string>, cadence?: Cadence): Promise<Habit[]>
	buildHabit(file: HabitFile, dateFilter?: Set<string>, cadence?: Cadence): Promise<Habit>
	updateEntries(entries: Entry[], status: Status): Promise<void>
	createHabit(details: HabitDetails, siblings: Habit[]): Promise<boolean>
	updateHabit(habit: Habit, details: HabitDetails, siblings: Habit[]): Promise<boolean>
	moveHabit(habits: Habit[], fromIndex: number, toIndex: number): Promise<void>
}

class HabitRepository implements THabitRepository {
	private readonly platform

	constructor(platform: Platform) {
		this.platform = platform
	}

	/** Every habit in the table takes its `cadence`. */
	async allHabits(folderPath: string, dateFilter?: Set<string>, cadence: Cadence = 'day') {
		const files = this.platform.listHabitFiles(folderPath)

		if (files == undefined) {
			this.platform.notify(`Couldn't find the folder "${folderPath}"`)
			return []
		}

		return sortByOrder(await Array.fromAsync(files, (file) => this.buildHabit(file, dateFilter, cadence)))
	}

	async buildHabit(file: HabitFile, dateFilter?: Set<string>, cadence: Cadence = 'day') {
		try {
			const { habit, invalidEntries, hasInvalidSchedule } = Habit.fromFile(file, dateFilter, cadence)

			for (const { date, status } of invalidEntries) {
				this.platform.notify(`Invalid date format or status for entry in Habit file ${file.basename}. Date: ${date}. Status: ${status}`)
			}

			if (hasInvalidSchedule) {
				this.platform.notify(`Invalid schedule in Habit file ${file.basename}. Use a list of weekdays, like [mon, wed, fri]. It applies every day for now`)
			}

			return habit
		}
		catch (error) {
			console.warn(`Failed to build habits for ${file.basename}:`, error)
			return Habit.empty(file, cadence)
		}
	}

	/**
	 @description
		Creates the habit's note in the table's folder (made when missing), saves its schedule in it,
		and puts it at `details.position` among the table's habits. Tells the user if it can't.
	 @param details The name is already checked with Habit.parseName.
	 @param siblings The habits the table already has, in the order it shows them.
	 @returns Whether the note was created.
	 */
	async createHabit(details: HabitDetails, siblings: Habit[]) {
		const { name, folderPath, schedule, position } = details

		try {
			const result = await this.platform.createHabitFile(folderPath, name)

			if (result === 'exists') {
				this.platform.notify(`"${name}" already exists in ${folderPath}`)
				return false
			}
		}
		catch (error) {
			console.error(`Failed to create the habit ${name} in ${folderPath}:`, error)
			this.platform.notify(`Couldn't create ${name}`)
			return false
		}

		const habit = new Habit({ id: name, name, path: `${folderPath}/${name}.md`, entries: [], schedule })

		await this.saveSettings(habit, schedule)
		await this.place(habit, siblings, position)

		return true
	}

	/**
	 @description
		Applies the form to an existing habit: renames and moves its note when the name or table changed,
		saves the schedule when it changed, and puts it at `details.position` among the table's habits.
		Nothing else is touched when the rename fails, and the user is told why.
	 @param habit The habit as the table shows it now.
	 @param details What the form was saved with.
	 @param siblings The habits of the destination table without this one, in the order it shows them.
	 @returns Whether the note could be renamed or moved, which is always true when it didn't need to be.
	 */
	async updateHabit(habit: Habit, details: HabitDetails, siblings: Habit[]) {
		const { name, folderPath, schedule, position } = details
		const newPath = `${folderPath}/${name}.md`
		let current = habit

		if (newPath !== habit.path) {
			const result = await this.renameNote(habit, newPath)

			if (result !== 'renamed') {
				this.platform.notify(result === 'exists' ? `"${name}" already exists in ${folderPath}` : `Couldn't update ${habit.name}`)
				return false
			}

			current = new Habit({ ...habit, id: name, name, path: newPath })
		}

		await this.saveSettings(current, schedule, habit)
		await this.place(current, siblings, position)

		return true
	}

	private async renameNote(habit: Habit, newPath: string) {
		try {
			return await this.platform.renameHabitFile(habit.path, newPath)
		}
		catch (error) {
			console.error(`Failed to rename ${habit.path} to ${newPath}:`, error)
			return 'missing'
		}
	}

	/** Writes the schedule. With `before`, only when it differs from that habit's; without it, only when it isn't the default. */
	private async saveSettings(habit: Habit, schedule: Schedule, before?: Habit) {
		if (schedule.days.join(',') === (before?.schedule ?? Schedule.unscheduled()).days.join(',')) return

		const values: FrontmatterUpdate = { [Habit.SCHEDULE_KEY]: schedule.toFrontmatter() }

		try {
			if (!await this.platform.updateFrontmatter(habit.path, values)) this.platform.notify(`Couldn't update ${habit.name}`)
		}
		catch (error) {
			console.error(`Failed to update ${habit.path}:`, error)
			this.platform.notify(`Couldn't update ${habit.name}`)
		}
	}

	/** Puts the habit at `position` among its siblings. Nothing is written without a position, or when it already lands there. */
	private async place(habit: Habit, siblings: Habit[], position: number | undefined) {
		if (position == undefined) return

		const index = Math.min(Math.max(position, 0), siblings.length)
		// Habits without an order come in by name, which is how the table lists them.
		const landsAt = sortByOrder([...siblings, habit].toSorted((first, second) => first.name.localeCompare(second.name))).indexOf(habit)

		if (landsAt === index) return

		await this.writeOrders(reorder(siblings.toSpliced(index, 0, habit), index, index))
	}

	/**
	 @description
		Moves the habit at `fromIndex` to `toIndex` in the table and saves the new order as each habit's `order` property.
		Only the notes whose position changed are written. Failures are reported in one notice.
	 */
	async moveHabit(habits: Habit[], fromIndex: number, toIndex: number) {
		await this.writeOrders(reorder(habits, fromIndex, toIndex))
	}

	private async writeOrders(changes: OrderChange[]) {
		const results = await Promise.allSettled(
			changes.map(({ habit, order }) => this.platform.updateFrontmatter(habit.path, { [Habit.ORDER_KEY]: order }))
		)

		const failedNames = results.flatMap((result, index) => {
			if (result.status === 'fulfilled' && result.value) return []

			if (result.status === 'rejected') console.error(`Failed to update the order in ${changes[index].habit.path}:`, result.reason)

			return [changes[index].habit.name]
		})

		if (failedNames.length > 0) this.platform.notify(`Couldn't reorder ${failedNames.join(', ')}`)
	}

	/**
	 @description
		Writes the status to every entry, one frontmatter write per habit file, and waits for all of them.
		A failed file doesn't stop the others; the user gets one notice naming the habits that weren't updated.
	 */
	async updateEntries(entries: Entry[], status: Status) {
		const valuesByHabitPath = new Map<string, Record<string, string>>()
		const habitIdByPath = new Map<string, string>()

		for (const entry of entries) {
			const values = valuesByHabitPath.get(entry.habitPath) ?? {}
			values[entry.frontMatterDate()] = status
			valuesByHabitPath.set(entry.habitPath, values)
			habitIdByPath.set(entry.habitPath, entry.habitId)
		}

		const habitPaths = [...valuesByHabitPath.keys()]
		const results = await Promise.allSettled(
			habitPaths.map((habitPath) => this.platform.updateFrontmatter(habitPath, valuesByHabitPath.get(habitPath) ?? {}))
		)

		const failedHabitIds = results.flatMap((result, index) => {
			if (result.status === 'fulfilled' && result.value) return []

			const habitPath = habitPaths[index]
			if (result.status === 'rejected') console.error(`Failed to update the habit entries in ${habitPath}:`, result.reason)

			return [habitIdByPath.get(habitPath) ?? habitPath]
		})

		if (failedHabitIds.length > 0) this.platform.notify(`Couldn't update ${failedHabitIds.join(', ')}`)
	}
}

export default HabitRepository
