import SourceSettings from 'models/SourceSettings'

describe('SourceSettings.fromSource', () => {
	it('reads valid settings with no messages', () => {
		const { settings, messages } = SourceSettings.fromSource('{ "folderPath": "habits", "displayName": "My Habits" }')

		expect(settings?.folderPath).toBe('habits')
		expect(settings?.displayName).toBe('My Habits')
		expect(messages).toEqual([])
	})

	it('reports unparseable JSON', () => {
		expect(SourceSettings.fromSource('{ nope')).toEqual({ settings: undefined, messages: ['Failed to parse the settings'] })
	})

	it('reports a missing folderPath', () => {
		expect(SourceSettings.fromSource('{ "folder": "habits" }')).toEqual({ settings: undefined, messages: ['Missing Required Field: folderPath'] })
	})

	it('reports unknown fields', () => {
		expect(SourceSettings.fromSource('{ "folderPath": "habits", "color": "red" }')).toEqual({ settings: undefined, messages: ['Unknown fields in configuration'] })
	})

	it('warns about relative paths but still uses the settings', () => {
		const { settings, messages } = SourceSettings.fromSource('{ "folderPath": "./habits" }')

		expect(settings?.folderPath).toBe('./habits')
		expect(messages).toEqual(['Relative paths are not supported. Please write the full path to your folder'])
	})
})
