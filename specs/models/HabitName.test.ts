import HabitName from 'models/HabitName'

describe('HabitName', () => {
	it('trims the name', () => {
		expect(HabitName.parse('  Read  ')).toEqual({ name: 'Read' })
	})

	it('asks for a name when it is blank', () => {
		expect(HabitName.parse('   ').message).toBe('Give the habit a name')
	})

	it.each(['a/b', String.raw`a\b`, 'a:b', 'a*b', 'a?b', 'a"b', 'a<b', 'a>b', 'a|b', 'a#b', 'a^b', 'a[b', 'a]b'])('rejects %s', (input) => {
		expect(HabitName.parse(input).name).toBeUndefined()
	})

	it('rejects a leading dot, which would hide the note', () => {
		expect(HabitName.parse('.secret').name).toBeUndefined()
	})

	it('allows spaces, accents and dots inside', () => {
		expect(HabitName.parse('Café 2.0 walk').name).toBe('Café 2.0 walk')
	})
})
