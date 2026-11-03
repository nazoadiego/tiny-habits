import Habit from 'models/Habit'
import { reorder, sortByOrder } from 'models/HabitOrder'

function habit(name: string, order?: number) {
	return new Habit({ id: name, name, path: `habits/${name}.md`, entries: [], order })
}

const names = (habits: Habit[]) => habits.map(habit => habit.name)

describe('HabitOrder', () => {
	describe('sortByOrder', () => {
		it('puts ordered habits first by order, then the others in the order they came', () => {
			const sorted = sortByOrder([habit('A'), habit('B', 1), habit('C'), habit('D', 0)])

			expect(names(sorted)).toEqual(['D', 'B', 'A', 'C'])
		})

		it('keeps the incoming order for habits with the same order', () => {
			expect(names(sortByOrder([habit('A', 1), habit('B', 1)]))).toEqual(['A', 'B'])
		})
	})

	describe('reorder', () => {
		it('numbers every habit on the first move', () => {
			const changes = reorder([habit('A'), habit('B'), habit('C')], 2, 0)

			expect(changes.map(({ habit, order }) => [habit.name, order])).toEqual([['C', 0], ['A', 1], ['B', 2]])
		})

		it('returns only the habits whose position changed', () => {
			const changes = reorder([habit('A', 0), habit('B', 1), habit('C', 2)], 0, 1)

			expect(changes.map(({ habit, order }) => [habit.name, order])).toEqual([['B', 0], ['A', 1]])
		})

		it('returns nothing when the habit stays where it is and was numbered', () => {
			expect(reorder([habit('A', 0), habit('B', 1)], 1, 1)).toEqual([])
		})

		it('refuses an index outside the table', () => {
			expect(() => reorder([habit('A')], 0, 1)).toThrow(RangeError)
			expect(() => reorder([habit('A')], -1, 0)).toThrow(RangeError)
		})
	})
})
