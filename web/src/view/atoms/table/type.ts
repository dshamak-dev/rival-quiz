export type Table<T> = {
	columns: TableColumn[];
	data: T[];
};

export type TableColumn = {
	title: string;
	dataKey: string;
	width?: number | string;
	render?: (value: any, row: any) => React.ReactNode;
};
