import DateValue from 'models/DateValue'
import { shiftPeriod, periodStart, type Cadence } from 'models/Cadence'
import type { Status } from 'models/Entry'

const HABITS = ['Drink water', 'Meditate', 'Walk', 'Read', 'Journal', 'Stretch', 'Write']
const DAYS_OF_HISTORY = 28

// Habits that don't apply every day.
const SCHEDULES: Record<string, string[]> = { Write: ['wed'], Stretch: ['mon', 'wed', 'fri'] }

// A fixed pattern, so the page looks the same on every reload (today is always left unstarted).
const PATTERN: (Status | undefined)[] = ['completed', 'completed', 'failed', 'completed', 'skip', undefined, 'completed', 'failed']

export const HABITS_FOLDER = 'habits'
export const WEEKLY_FOLDER = 'weekly-habits'
export const MONTHLY_FOLDER = 'monthly-habits'
export const EMPTY_FOLDER = 'empty-habits'

const PERIODS_OF_HISTORY = 8

/** The notes of a table whose columns are weeks or months. Entries are stored under the first day of the period. */
function periodHabitFiles(folder: string, names: string[], cadence: Cadence) {
	const current = periodStart(new DateValue(new Date().toISOString()), cadence)

	return names.map((name, habitIndex) => {
		const frontmatter: Record<string, Status> = {}

		for (let periodsAgo = 1; periodsAgo <= PERIODS_OF_HISTORY; periodsAgo++) {
			const status = PATTERN[(periodsAgo + (habitIndex * 3)) % PATTERN.length]
			if (status) frontmatter[shiftPeriod(current, cadence, -periodsAgo).toYearMonthDayString()] = status
		}

		return { path: `${folder}/${name}.md`, frontmatter }
	})
}

export function seedHabitFiles() {
	const today = new DateValue(new Date().toISOString())

	const dailyFiles = HABITS.map((name, habitIndex) => {
		const frontmatter: Record<string, Status | string | string[]> = {}
		if (SCHEDULES[name]) frontmatter.schedule = SCHEDULES[name]

		for (let daysAgo = 1; daysAgo <= DAYS_OF_HISTORY; daysAgo++) {
			const status = PATTERN[(daysAgo + (habitIndex * 3)) % PATTERN.length]
			if (status) frontmatter[today.subtractDays(daysAgo).toYearMonthDayString()] = status
		}

		return { path: `${HABITS_FOLDER}/${name}.md`, frontmatter }
	})

	return [
		...dailyFiles,
		...periodHabitFiles(WEEKLY_FOLDER, ['Long run', 'Meal prep', 'Laundry'], 'week'),
		...periodHabitFiles(MONTHLY_FOLDER, ['Review budget', 'Deep clean', 'Call family'], 'month')
	]
}
