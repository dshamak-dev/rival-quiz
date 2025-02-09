export function getFormFields<T>(data: FormData, fields: string[] = []): T {
	if (!fields?.length) {
		const values: Record<string, any> = {};
		const entries = data.entries();

		const getNextField = () => {
			const field = entries.next();
			const entrie: [string, any] | undefined = field?.value;

			if (entrie && entrie?.length) {
				const key: string = entrie[0];
				values[key] = entrie[1];
			}

			return field;
		};

		let field = getNextField();

		while (!field.done) {
			field = getNextField();
		}

		return values as T;
	}

	return fields.reduce((accum, key) => {
		accum[key] = data.get(key);

		return accum;
	}, {} as Record<string, any>) as T;
}

export function filterKeysByReference(target: Record<string, any>, reference: Record<string, any>) {
	const refKeay = Object.keys(reference);

	return Object.entries(target)
		.filter(([key]) => refKeay.includes(key))
		.reduce((accum, [key, value]) => {
			accum[key] = value;

			return accum;
		}, {} as Record<string, any>);
}
