import Habit from 'models/Habit'
import Entry, { type Status } from 'models/Entry'
import type { HabitFile, Platform } from 'platform/Platform'

export type THabitRepository = {
	allHabits(path: string, dateFilter?: Set<string>): Promise<Habit[]>
	buildHabit(file: HabitFile, dateFilter?: Set<string>): Promise<Habit>
	updateEntry(entry: Entry, status: Status): Entry
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
			const { habit, invalidEntries } = Habit.fromFile(file, dateFilter)

			for (const { date, status } of invalidEntries) {
				this.platform.notify(`Invalid date format or status for entry in Habit file ${file.basename}. Date: ${date}. Status: ${status}`)
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
		Writes the new status to the habit's file and returns the updated entry right away.
		The write finishes in the background; if the file is gone or the write fails, the user gets a notice.
	 */
	updateEntry(entry: Entry, status: Status) {
		const updatedEntry = new Entry({ ...entry, status })

		this.platform.updateFrontmatter(entry.habitPath, { [entry.frontMatterDate()]: updatedEntry.status })
			.then((isUpdated) => {
				if (!isUpdated) this.platform.notify('Couldn\'t update the habit entry!')
			})
			.catch((error: unknown) => {
				console.error(`Failed to update the habit entry in ${entry.habitPath}:`, error)
				this.platform.notify('Couldn\'t update the habit entry!')
			})

		return updatedEntry
	}
}

export default HabitRepository
