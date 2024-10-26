export function getStoreArray<T>(storeKey: string): T[] {
	return JSON.parse(localStorage.getItem(storeKey) || '[]') || [];
}

export function setStore(storeKey: string, payload: any) {
	localStorage.setItem(storeKey, payload);
}

export function pushStoreItem<T>(storeKey: string, item: T): T[] {
	const arr: T[] = getStoreArray<T>(storeKey);

	arr.push(item);

	localStorage.setItem(storeKey, JSON.stringify(arr));

	return arr;
}
