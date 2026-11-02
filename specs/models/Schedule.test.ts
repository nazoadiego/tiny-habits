import Schedule from 'models/Schedule'
import DateValue from 'models/DateValue'

// 2026-11-02 is a Monday.
const monday = new DateValue('2026-11-02')
const wednesday = new DateValue('2026-11-04')
const sunday = new DateValue('2026-11-08')

describe('Schedule', () => {
	describe('appliesOn', () => {
		it('applies on every day by default', () => {
			const schedule = Schedule.unscheduled()

			expect([monday, wednesday, sunday].every(date => schedule.appliesOn(date))).toBe(true)
		})

		it('applies only on the scheduled weekdays', () => {
			const schedule = Schedule.of(['wed', 'sun'])

			expect(schedule.appliesOn(wednesday)).toBe(true)
			expect(schedule.appliesOn(sunday)).toBe(true)
			expect(schedule.appliesOn(monday)).toBe(false)
		})
	})

	describe('of', () => {
		it('keeps the days in week order without duplicates', () => {
			expect(Schedule.of(['fri', 'mon', 'fri']).days).toEqual(['mon', 'fri'])
		})

		it('applies every day when no day is chosen', () => {
			const schedule = Schedule.of([])

			expect(schedule.isUnscheduled).toBe(true)
			expect([monday, wednesday, sunday].every(date => schedule.appliesOn(date))).toBe(true)
		})
	})

	describe('toggle', () => {
		it('adds and removes a day', () => {
			const schedule = Schedule.of(['wed'])

			expect(schedule.toggle('fri').days).toEqual(['wed', 'fri'])
			expect(schedule.toggle('fri').toggle('fri').days).toEqual(['wed'])
		})

		it('leaves the habit unscheduled when the last day is removed', () => {
			expect(Schedule.of(['wed']).toggle('wed').isUnscheduled).toBe(true)
		})
	})

	describe('fromFrontmatter', () => {
		it('means every day when the property is missing', () => {
			const { schedule, isValid } = Schedule.fromFrontmatter(undefined)

			expect(isValid).toBe(true)
			expect(schedule.isEveryDay).toBe(true)
		})

		it('reads a list of weekdays', () => {
			const { schedule, isValid } = Schedule.fromFrontmatter(['mon', 'wed', 'fri'])

			expect(isValid).toBe(true)
			expect(schedule.days).toEqual(['mon', 'wed', 'fri'])
		})

		it('means no schedule for an empty list', () => {
			const { schedule, isValid } = Schedule.fromFrontmatter([])

			expect(isValid).toBe(true)
			expect(schedule.isUnscheduled).toBe(true)
		})

		it.each([
			['a string', 'wed'],
			['an unknown weekday', ['mon', 'someday']],
			['a number', 3]
		])('falls back to every day for %s', (_name, value) => {
			const { schedule, isValid } = Schedule.fromFrontmatter(value)

			expect(isValid).toBe(false)
			expect(schedule.isUnscheduled).toBe(true)
		})
	})

	describe('toFrontmatter', () => {
		it('is absent when unscheduled', () => {
			expect(Schedule.unscheduled().toFrontmatter()).toBeUndefined()
		})

		it('lists the scheduled days', () => {
			expect(Schedule.of(['mon', 'wed']).toFrontmatter()).toEqual(['mon', 'wed'])
		})
	})

	describe('summary', () => {
		it.each([
			[[], 'Every day'],
			[['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], 'Every day'],
			[['mon', 'tue', 'wed', 'thu', 'fri'], 'Weekdays'],
			[['mon', 'wed', 'fri'], 'Mon Wed Fri'],
			[['wed'], 'Wed']
		] as const)('summarizes %j as %s', (days, expected) => {
			expect(Schedule.of([...days]).summary()).toBe(expected)
		})
	})
})
