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

		if (hasUnknownKeys) {
			new Notice('Unknown fields in configuration')
			return false
		}

		return true
	}
}

export default SourceSettings
