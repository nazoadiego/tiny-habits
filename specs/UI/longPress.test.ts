import { createLongPress } from 'UI/longPress'

function setup() {
	const onArm = vi.fn()
	const onReset = vi.fn()

	return { onArm, onReset, press: createLongPress({ onArm, onReset }) }
}

describe('createLongPress', () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => vi.useRealTimers())

	it('arms after 500ms of holding', () => {
		const { onArm, press } = setup()

		press.start(0, 0)
		vi.advanceTimersByTime(499)
		expect(onArm).not.toHaveBeenCalled()

		vi.advanceTimersByTime(1)
		expect(onArm).toHaveBeenCalledOnce()
	})

	it('is a long press when released after arming', () => {
		const { onReset, press } = setup()

		press.start(0, 0)
		vi.advanceTimersByTime(500)

		expect(press.end()).toBe(true)
		expect(onReset).toHaveBeenCalledOnce()
	})

	it('is a tap when released early', () => {
		const { onArm, press } = setup()

		press.start(0, 0)
		vi.advanceTimersByTime(200)

		expect(press.end()).toBe(false)
		vi.advanceTimersByTime(1000)
		expect(onArm).not.toHaveBeenCalled()
	})

	it('is cancelled by moving more than 10px, as when scrolling', () => {
		const { onArm, onReset, press } = setup()

		press.start(0, 0)
		press.move(0, 11)

		expect(onReset).toHaveBeenCalledOnce()
		vi.advanceTimersByTime(1000)
		expect(onArm).not.toHaveBeenCalled()
		expect(press.end()).toBe(false)
	})

	it('survives small movement', () => {
		const { onArm, press } = setup()

		press.start(0, 0)
		press.move(4, 4)
		vi.advanceTimersByTime(500)

		expect(onArm).toHaveBeenCalledOnce()
	})

	it('is not a long press once cancelled after arming', () => {
		const { press } = setup()

		press.start(0, 0)
		vi.advanceTimersByTime(500)
		press.cancel()

		expect(press.end()).toBe(false)
	})
})
