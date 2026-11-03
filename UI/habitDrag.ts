/**
 @description
	The slot a dragged habit would drop into: 0 is above the first row and `rects.length` is below the last.
	The pointer is past a row once it is below the row's middle.
 @param rects The habit rows, top to bottom.
 */
export function dropSlot(rects: { top: number, bottom: number }[], pointerY: number): number {
	return rects.filter(({ top, bottom }) => pointerY > (top + bottom) / 2).length
}

/**
 @description Where the habit ends up when it leaves `fromIndex` and drops into `slot`, counted without the habit itself.
 */
export function destinationOf(fromIndex: number, slot: number): number {
	return slot > fromIndex ? slot - 1 : slot
}
