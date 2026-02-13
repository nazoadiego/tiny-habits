export type collapseState = 'init' | 'collapsed' | 'expanded'

const STATUS_TOGGLE: Record<string, collapseState> = {
	init: 'collapsed',
	collapsed: 'expanded',
	expanded: 'collapsed'
}

export class CollapseStatus {
	static COLLAPSE_STATES = { init: 'init', collapsed: 'collapsed', expanded: 'expanded' } as const

	private folderPath
	private localStorageStatus
	private isFirstLoad
	value: collapseState

	constructor(folderPath: string, value: collapseState = this.getInitialState()) {
		this.folderPath = folderPath
		this.localStorageStatus = localStorage.getItem(folderPath)
		this.isFirstLoad = true
		this.value = value
	}


	private isValidCollapseStatus(value: string | null): value is collapseState {
		return typeof value === 'string' && value in CollapseStatus.COLLAPSE_STATES
	}

	private getInitialState() {
		if(!this.isValidCollapseStatus(this.localStorageStatus)) return CollapseStatus.COLLAPSE_STATES.init
		if(this.localStorageStatus === 'expanded' && this.isFirstLoad) return CollapseStatus.COLLAPSE_STATES.init

		return this.localStorageStatus
	}

	toggle() {
		const nextStatus = STATUS_TOGGLE[this.value]
		localStorage.setItem(this.folderPath, nextStatus)
		return new CollapseStatus(this.folderPath, nextStatus)
	}
}
