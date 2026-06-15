/**
 * Перемешивание массива на месте алгоритмом Fisher–Yates.
 *
 * @type {(items: unknown[]) => void}
 */
function shuffleArray(items) {
	for (let index = items.length - 1; index > 0; index--) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		const temp = items[index];
		items[index] = items[swapIndex];
		items[swapIndex] = temp;
	}
}

export { shuffleArray };
