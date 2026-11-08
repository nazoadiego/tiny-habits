import type { Platform } from 'platform/Platform'

/**
 @description
	The "Add Habit" command: opens the habit form straight away, on the first table.
	The form has the table as a field, so the user picks it there when there are several.
 @param platform The host.
 @param folderPaths The folders of the tables the user can add to.
 @param openForm Opens the habit form for a new habit, starting on the table's folder.
 */
export default function addHabit(platform: Platform, folderPaths: string[], openForm: (folderPath: string) => void) {
	if (folderPaths.length === 0) {
		platform.notify('Open a note with a habits table first, then add a habit')
		return
	}

	openForm(folderPaths[0])
}
