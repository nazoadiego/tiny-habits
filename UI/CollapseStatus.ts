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
	state: collapseState

	constructor(folderPath: string) {
		this.folderPath = folderPath
		this.localStorageStatus = localStorage.getItem(folderPath)
		this.isFirstLoad = true
		this.state = this.getInitialState()
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
		const nextStatus = STATUS_TOGGLE[this.state]
		localStorage.setItem(this.folderPath, nextStatus)
		this.state = nextStatus
		return this.state
	}
}
