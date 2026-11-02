import Habit from 'models/Habit'
import type Entry from 'models/Entry'
import type Schedule from 'models/Schedule'
import type { Status } from 'models/Entry'
import type { HabitFile, Platform } from 'platform/Platform'

export type THabitRepository = {
	allHabits(path: string, dateFilter?: Set<string>): Promise<Habit[]>
	buildHabit(file: HabitFile, dateFilter?: Set<string>): Promise<Habit>
	updateEntries(entries: Entry[], status: Status): Promise<void>
	updateSchedule(habit: Habit, schedule: Schedule): Promise<void>
	createHabit(folderPath: string, name: string): Promise<boolean>
}

class HabitRepository implements THabitRepository {
	private readonly platform

	constructor(platform: Platform) {
		this.platform = platform
	}

	async allHabits(folderPath: string, dateFilter?: Set<string>) {
		const files = this.platform.listHabitFiles(folderPath)

		if (files == undefined) {
			this.platform.notify(`Couldn't find the folder "${folderPath}"`)
			return []
		}

		return Array.fromAsync(files, (file) => this.buildHabit(file, dateFilter))
	}

	async buildHabit(file: HabitFile, dateFilter?: Set<string>) {
		try {
			const { habit, invalidEntries, hasInvalidSchedule } = Habit.fromFile(file, dateFilter)

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
			return Habit.empty(file)
		}
	}

	/**
	 @description
		Creates an empty note for the habit in the table's folder, and tells the user if it can't.
	 @param folderPath The table's folder.
	 @param name Already checked with HabitName.parse.
	 @returns Whether the note was created.
	 */
	async createHabit(folderPath: string, name: string) {
		try {
			const result = await this.platform.createHabitFile(folderPath, name)

			if (result === 'exists') this.platform.notify(`"${name}" already exists in ${folderPath}`)
			if (result === 'missing-folder') this.platform.notify(`Couldn't find the folder "${folderPath}"`)

			return result === 'created'
		}
		catch (error) {
			console.error(`Failed to create the habit ${name} in ${folderPath}:`, error)
			this.platform.notify(`Couldn't create ${name}`)
			return false
		}
	}

	/**
	 @description
		Saves the schedule in the habit's own note, as the `schedule` property.
		A schedule of every day removes the property, since that is what a habit without one means.
	 */
	async updateSchedule(habit: Habit, schedule: Schedule) {
		try {
			const wasUpdated = await this.platform.updateFrontmatter(habit.path, { [Habit.SCHEDULE_KEY]: schedule.toFrontmatter() })

			if (!wasUpdated) this.platform.notify(`Couldn't update ${habit.name}`)
		}
		catch (error) {
			console.error(`Failed to update the schedule in ${habit.path}:`, error)
			this.platform.notify(`Couldn't update ${habit.name}`)
		}
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
