import DateValue from 'models/DateValue'
import { periodStart } from 'models/Cadence'
import type { Status } from 'models/Entry'

const HABITS = ['Drink water', 'Meditate', 'Long run', 'Read', 'Review budget', 'Stretch', 'Write']
const DAYS_OF_HISTORY = 28

// Habits that don't apply every day.
const SCHEDULES: Record<string, string[]> = { Write: ['wed'], Stretch: ['mon', 'wed', 'fri'] }

// Habits that come around once a week or once a month, with their entries stored under the start of the period.
const CADENCES: Record<string, 'week' | 'month'> = { 'Long run': 'week', 'Review budget': 'month' }

// A fixed pattern, so the page looks the same on every reload (today is always left unstarted).
const PATTERN: (Status | undefined)[] = ['completed', 'completed', 'failed', 'completed', 'skip', undefined, 'completed', 'failed']

export const HABITS_FOLDER = 'habits'
export const EMPTY_FOLDER = 'empty-habits'

export function seedHabitFiles() {
	const today = new DateValue(new Date().toISOString())

	return HABITS.map((name, habitIndex) => {
		const frontmatter: Record<string, Status | string | string[]> = {}
		const cadence = CADENCES[name]
		if (cadence) frontmatter.every = cadence
		if (SCHEDULES[name]) frontmatter.schedule = SCHEDULES[name]

		for (let daysAgo = 1; daysAgo <= DAYS_OF_HISTORY; daysAgo++) {
			const status = PATTERN[(daysAgo + (habitIndex * 3)) % PATTERN.length]
			if (!status) continue

			const day = today.subtractDays(daysAgo)
			frontmatter[(cadence ? periodStart(day, cadence) : day).toYearMonthDayString()] = status
		}

		return { path: `${HABITS_FOLDER}/${name}.md`, frontmatter }
	})
}
