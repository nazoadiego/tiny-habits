import type { Cadence } from './Cadence'

export type TableDetails = {
	folderPath: string;
	displayName?: string | undefined;
	cadence: Cadence;
}

/**
 @description The `habits` code block for a table, as written into a note. The default cadence (day) is left out.
 */
export function tableBlock({ folderPath, displayName, cadence }: TableDetails): string {
	const settings: Record<string, string> = { folderPath }

	if (displayName != undefined && displayName.trim() !== '') settings.displayName = displayName.trim()
	if (cadence !== 'day') settings.cadence = cadence

	return `\`\`\`habits\n${JSON.stringify(settings, undefined, '\t')}\n\`\`\``
}

/**
 @description A folder name for a new table named `name`: slashes and characters that can't be in a path become dashes.
 */
export function suggestFolder(name: string): string {
	return name.trim().replaceAll(/[\\/:*?"<>|]/g, '-')
}
