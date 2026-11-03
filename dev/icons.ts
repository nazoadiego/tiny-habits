// Lucide icons (ISC license, https://lucide.dev) for the icons the tables use; Obsidian ships these itself.
const ICON_PATHS: Record<string, string> = {
	'lucide-check': '<path d="M20 6 9 17l-5-5"/>',
	'lucide-circle-minus': '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>',
	'lucide-circle-x': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
	'lucide-timer-reset': '<path d="M10 2h4"/><path d="M12 14v-4"/><path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6"/><path d="M9 17H4v5"/>',
	'lucide-grip-vertical': '<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>',
	'lucide-calendar-days': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
	'lucide-chevron-left': '<path d="m15 18-6-6 6-6"/>',
	'lucide-chevron-right': '<path d="m9 18 6-6-6-6"/>'
}

export function setIcon(element: HTMLElement, icon: string) {
	const paths = ICON_PATHS[icon]

	if (paths == undefined) {
		console.warn(`Unknown icon "${icon}", add it to dev/icons.ts`)
		return
	}

	element.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="svg-icon ${icon}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
}
