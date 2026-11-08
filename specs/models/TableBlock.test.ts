import { tableBlock, suggestFolder } from 'models/TableBlock'
import SourceSettings from 'models/SourceSettings'

describe('tableBlock', () => {
	it('writes a daily table without a cadence', () => {
		expect(tableBlock({ folderPath: 'habits', displayName: 'My Habits', cadence: 'day' }))
			.toBe('```habits\n{\n\t"folderPath": "habits",\n\t"displayName": "My Habits"\n}\n```')
	})

	it('writes the cadence of a weekly or monthly table and leaves out a blank name', () => {
		const block = tableBlock({ folderPath: 'reading', displayName: '  ', cadence: 'month' })

		expect(block).toBe('```habits\n{\n\t"folderPath": "reading",\n\t"cadence": "month"\n}\n```')
	})

	it('writes settings that the code block reads back', () => {
		const source = tableBlock({ folderPath: 'a "quoted" folder', displayName: 'Read', cadence: 'week' }).split('\n').slice(1, -1).join('\n')
		const { settings } = SourceSettings.fromSource(source)

		expect(settings).toMatchObject({ folderPath: 'a "quoted" folder', displayName: 'Read', cadence: 'week' })
	})
})

describe('suggestFolder', () => {
	it('uses the name', () => {
		expect(suggestFolder(' Morning routine ')).toBe('Morning routine')
	})

	it('keeps the name from adding folder levels or invalid characters', () => {
		expect(suggestFolder('a/b: c')).toBe('a-b- c')
	})
})
