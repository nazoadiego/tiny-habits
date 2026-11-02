import { createEntryKeydownHandler, type EntryKeyActions } from 'UI/entryKeybindings'

type Modifier = 'Shift' | 'Meta' | 'Control' | 'Alt'

// The tests run without a DOM, so this mimics the parts of a KeyboardEvent that tinykeys reads.
function keydown(key: string, { code = key, modifiers = [] as Modifier[], repeat = false } = {}) {
	return {
		key,
		code,
		repeat,
		isComposing: false,
		getModifierState: (modifier: string) => modifiers.includes(modifier as Modifier),
		preventDefault: vi.fn()
	} as unknown as KeyboardEvent & { preventDefault: ReturnType<typeof vi.fn> }
}

function setup() {
	const actions = { move: vi.fn(), setStatus: vi.fn(), clearSelection: vi.fn() } satisfies EntryKeyActions
	return { actions, handleKeydown: createEntryKeydownHandler(actions) }
}

describe('createEntryKeydownHandler', () => {
	it.each([
		['ArrowUp', 'up'], ['k', 'up'],
		['ArrowDown', 'down'], ['j', 'down'],
		['ArrowLeft', 'left'], ['h', 'left'],
		['ArrowRight', 'right'], ['l', 'right']
	])('moves %s without extending the selection', (key, direction) => {
		const { actions, handleKeydown } = setup()
		const event = keydown(key)

		handleKeydown(event)

		expect(actions.move).toHaveBeenCalledExactlyOnceWith(event, direction, false)
		expect(event.preventDefault).toHaveBeenCalled()
	})

	it.each([['ArrowDown', 'ArrowDown'], ['J', 'KeyJ']])('extends the selection with Shift+%s', (key, code) => {
		const { actions, handleKeydown } = setup()
		const event = keydown(key, { code, modifiers: ['Shift'] })

		handleKeydown(event)

		expect(actions.move).toHaveBeenCalledExactlyOnceWith(event, 'down', true)
	})

	it('keeps moving while a key is held down', () => {
		const { actions, handleKeydown } = setup()

		handleKeydown(keydown('j', { code: 'KeyJ', repeat: true }))

		expect(actions.move).toHaveBeenCalledOnce()
	})

	it.each([['1', 'completed'], ['2', 'failed'], ['3', 'skip'], ['4', 'unstarted']])('sets the status with %s', (key, status) => {
		const { actions, handleKeydown } = setup()
		const event = keydown(key, { code: `Digit${key}` })

		handleKeydown(event)

		expect(actions.setStatus).toHaveBeenCalledExactlyOnceWith(event, status)
	})

	it.each([['Enter', 'Enter'], [' ', 'Space']])('cycles the status with %j', (key, code) => {
		const { actions, handleKeydown } = setup()
		const event = keydown(key, { code })

		handleKeydown(event)

		expect(actions.setStatus).toHaveBeenCalledExactlyOnceWith(event)
	})

	it('clears the selection with Escape', () => {
		const { actions, handleKeydown } = setup()

		handleKeydown(keydown('Escape'))

		expect(actions.clearSelection).toHaveBeenCalledOnce()
	})

	it.each([
		['1', 'Digit1', 'Meta'],
		['1', 'Digit1', 'Control'],
		['ArrowLeft', 'ArrowLeft', 'Meta'],
		['Enter', 'Enter', 'Alt']
	] as const)('leaves %s with %s held to the host', (key, code, modifier) => {
		const { actions, handleKeydown } = setup()
		const event = keydown(key, { code, modifiers: [modifier] })

		handleKeydown(event)

		expect(actions.move).not.toHaveBeenCalled()
		expect(actions.setStatus).not.toHaveBeenCalled()
		expect(event.preventDefault).not.toHaveBeenCalled()
	})
})
