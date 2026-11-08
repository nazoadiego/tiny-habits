import { CADENCES, isCadence, type Cadence } from './Cadence'

type TSourceSettings = {
	folderPath: string;
	displayName?: string | undefined;
	cadence?: Cadence | undefined;
}

/**
 @description
	The outcome of reading a `habits` code block.
	`settings` is undefined when the block can't be used; `messages` holds what to tell the user either way.
 */
export type SourceSettingsResult = {
	settings: SourceSettings | undefined;
	messages: string[];
}

class SourceSettings implements TSourceSettings {
	folderPath: string
	displayName: string | undefined
	/** What one column of the table is: a day, a week or a month. Every habit in the table follows it. */
	cadence: Cadence

	private constructor(folderPath: string, displayName: string | undefined, cadence: Cadence) {
		this.folderPath = folderPath
		this.displayName = displayName
		this.cadence = cadence
	}

	static fromSource(source: string): SourceSettingsResult {
		let settings: unknown

		try {
			settings = JSON.parse(source)
		}
		catch {
			return { settings: undefined, messages: ['Failed to parse the settings'] }
		}

		const messages: string[] = []

		if (!this.validate(settings, messages)) return { settings: undefined, messages }

		return { settings: new SourceSettings(settings.folderPath, settings.displayName, settings.cadence ?? 'day'), messages }
	}

	/**
	 @param object The parsed code block.
	 @param messages Collects what's wrong (or worth a warning) about the object.
	 */
	static validate(object: unknown, messages: string[] = []): object is SourceSettings {
		if (!object || typeof object !== 'object') return false

		const isRequiredFieldPresent = 'folderPath' in object

		if (!isRequiredFieldPresent) {
			messages.push('Missing Required Field: folderPath')
			return false
		}

		const allowedKeys = new Set(['folderPath', 'displayName', 'cadence'])
		const objectKeys = Object.keys(object)
		const hasUnknownKeys = objectKeys.some(key => !allowedKeys.has(key))

		const { folderPath } = object

		if (typeof folderPath !== 'string') {
			messages.push('folderPath must be a string')
			return false
		}

		if ('cadence' in object && !isCadence(object.cadence)) {
			messages.push(`cadence must be one of: ${CADENCES.join(', ')}`)
			return false
		}

		// A warning only: the settings are still used.
		if (folderPath.includes('.') || folderPath.includes('..')) {
			messages.push('Relative paths are not supported. Please write the full path to your folder')
		}

		if (hasUnknownKeys) {
			messages.push('Unknown fields in configuration')
			return false
		}

		return true
	}
}

export default SourceSettings
