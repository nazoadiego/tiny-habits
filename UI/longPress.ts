type LongPressOptions = {
	/** Called once the press has been held long enough, while the finger is still down. */
	onArm: () => void
	/** Called when the press ends or is cancelled, however it ends. */
	onReset: () => void
	/** How long to hold, in milliseconds. */
	delay?: number
	/** How far the finger may move, in pixels, before the press is taken for a scroll. */
	tolerance?: number
}

/**
 @description
	Tells a press and hold from a tap or a scroll.
	A press is armed after `delay` ms without moving more than `tolerance` px; releasing it then is a long press.
 */
export function createLongPress({ onArm, onReset, delay = 500, tolerance = 10 }: LongPressOptions) {
	let timer: ReturnType<typeof setTimeout> | undefined
	let origin: { x: number, y: number } | undefined
	let isArmed = false

	function reset() {
		clearTimeout(timer)
		timer = undefined
		origin = undefined

		isArmed = false
		onReset()
	}

	return {
		start(x: number, y: number) {
			clearTimeout(timer)
			isArmed = false
			origin = { x, y }
			timer = setTimeout(() => {
				isArmed = true
				onArm()
			}, delay)
		},

		move(x: number, y: number) {
			if (origin == undefined) return
			if (Math.hypot(x - origin.x, y - origin.y) > tolerance) reset()
		},

		/** @returns Whether the press was held long enough to count as a long press. */
		end(): boolean {
			const wasLongPress = isArmed
			reset()

			return wasLongPress
		},

		cancel: reset
	}
}
