/**
 @description
	What the user types when adding a habit. It becomes the habit's note name, so it must be a valid file name in Obsidian.
 */
export type HabitNameResult =
	| { name: string, message?: undefined }
	| { name?: undefined, message: string }

// Characters Obsidian refuses in file names (\ / : * ? " < > |), plus the ones its links can't hold (# ^ [ ]).
const FORBIDDEN_CHARACTERS = /[\\/:*?"<>|#^[\]]/

const HabitName = {
	/**
	 @returns The trimmed name, or a message saying what to fix.
	 */
	parse(input: string): HabitNameResult {
		const name = input.trim()

		if (name === '') return { message: 'Give the habit a name' }

		const forbidden = FORBIDDEN_CHARACTERS.exec(name)?.[0]
		if (forbidden != undefined) return { message: `A habit name can't contain "${forbidden}"` }

		if (name.startsWith('.')) return { message: 'A habit name can\'t start with "."' }

		return { name }
	}
}

export default HabitName
