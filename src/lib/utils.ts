export function strictFromEntries<K extends PropertyKey, V>(
	entries: Iterable<readonly [K, V]>
): Record<K, V> {
	return Object.fromEntries(entries) as Record<K, V>;
}

export function strictObjectEntries<K extends string, V>(
	record: Record<K, V>
): [key: K, value: V][] {
	return Object.entries(record) as [key: K, value: V][];
}

export function wrapIndex(index: number, length: number): number {
	return ((index % length) + length) % length;
}

/** Splits items into consecutive chunks of `size`; the last
chunk may be shorter. */
export function chunk<T>(items: readonly T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < items.length; i += size) {
		chunks.push(items.slice(i, i + size));
	}
	return chunks;
}
