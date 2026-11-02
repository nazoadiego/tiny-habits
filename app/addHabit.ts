import Habit from 'models/Habit'
import type { THabitRepository } from 'repositories/HabitRepository'
import type { Platform } from 'platform/Platform'

/**
 @description
	The "Add Habit" command: picks a table folder, asks for a name until it is valid, and creates the habit.
	Nothing is created when the user cancels a question.
 @param platform The host.
 @param repository Where the habit is created.
 @param folderPaths The folders of the tables the user can add to.
 */
export default async function addHabit(platform: Platform, repository: Pick<THabitRepository, 'createHabit'>, folderPaths: string[]) {
	const folderPath = await chooseFolder(platform, folderPaths)
	if (folderPath == undefined) return

	const name = await askName(platform, folderPath)
	if (name == undefined) return

	const wasCreated = await repository.createHabit(folderPath, name)
	if (wasCreated) platform.notify(`Added ${name} to ${folderPath}`)
}

async function chooseFolder(platform: Platform, folderPaths: string[]) {
	if (folderPaths.length === 0) {
		platform.notify('Open a note with a habits table first, then add a habit')
		return undefined
	}

	if (folderPaths.length === 1) return folderPaths[0]

	return platform.askChoice('Add a habit to which table?', folderPaths)
}

// Asks again until the name is valid; undefined means the user cancelled.
async function askName(platform: Platform, folderPath: string) {
	let question = `New habit in ${folderPath}`

	while (true) {
		const input = await platform.askText(question, 'Habit name')
		if (input == undefined) return undefined

		const { name, message } = Habit.parseName(input)
		if (name != undefined) return name

		question = message
	}
}
