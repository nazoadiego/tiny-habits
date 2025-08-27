import { Notice } from 'obsidian'

type TSourceSettings = {
	folderPath: string;
	displayName?: string | undefined;
}

class SourceSettings implements TSourceSettings {
	folderPath: string
	displayName: string | undefined

	private constructor(folderPath: string, displayName: string | undefined) {
		this.folderPath = folderPath
		this.displayName = displayName
	}

	static fromSource(source: string): SourceSettings | undefined {
		try {
			const settings = JSON.parse(source)

			if (!this.validate(settings)) return undefined

			return new SourceSettings(settings.folderPath, settings.displayName)
		}
		catch {
			new Notice('Failed to parse the settings')
			return undefined
		}
	}

	static validate(object: unknown): object is SourceSettings {
		if (!object || typeof object !== 'object') return false

		const isRequiredFieldPresent = 'folderPath' in object

		if (!isRequiredFieldPresent) {
			new Notice('Missing Required Field: folderPath')
			return false
		}

		const allowedKeys = new Set(['folderPath', 'displayName'])
		const objectKeys = Object.keys(object)
		const hasUnknownKeys = objectKeys.some(key => !allowedKeys.has(key))

		const { folderPath } = object

		if (typeof folderPath !== 'string') {
			new Notice('folderPath must be a string')
			return false
		}

		if (folderPath.includes('.') || folderPath.includes('..')) {
			new Notice('Relative paths are not supported. Please write the full path to your folder')
		}

		if (hasUnknownKeys) {
			new Notice('Unknown fields in configuration')
			return false
		}

		return true
	}
}

export default SourceSettings
