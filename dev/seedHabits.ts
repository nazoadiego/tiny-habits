import DateValue from 'models/DateValue'
import type { Status } from 'models/Entry'

const HABITS = ['Drink water', 'Meditate', 'Read', 'Stretch', 'Write']
const DAYS_OF_HISTORY = 28

// A fixed pattern, so the page looks the same on every reload (today is always left unstarted).
const PATTERN: (Status | undefined)[] = ['completed', 'completed', 'failed', 'completed', 'skip', undefined, 'completed', 'failed']

export const HABITS_FOLDER = 'habits'
export const EMPTY_FOLDER = 'empty-habits'

export function seedHabitFiles() {
	const today = new DateValue(new Date().toISOString())

	return HABITS.map((name, habitIndex) => {
		const frontmatter: Record<string, Status> = {}

		for (let daysAgo = 1; daysAgo <= DAYS_OF_HISTORY; daysAgo++) {
			const status = PATTERN[(daysAgo + (habitIndex * 3)) % PATTERN.length]
			if (status) frontmatter[today.subtractDays(daysAgo).toYearMonthDayString()] = status
		}

		return { path: `${HABITS_FOLDER}/${name}.md`, frontmatter }
	})
}
