import { getContext } from 'svelte'
import type { IconRenderer } from './Platform'

const ICON_RENDERER_KEY = Symbol('iconRenderer')

export function iconContext(setIcon: IconRenderer): Map<symbol, IconRenderer> {
	return new Map([[ICON_RENDERER_KEY, setIcon]])
}

export function getIconRenderer(): IconRenderer {
	const setIcon = getContext<IconRenderer | undefined>(ICON_RENDERER_KEY)

	if (setIcon == undefined) throw new Error('No icon renderer in context. Mount components with iconContext(platform.setIcon).')

	return setIcon
}
