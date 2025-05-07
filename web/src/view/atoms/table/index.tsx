import { useCallback, useMemo } from 'react';
import { Table as TableType } from './type';

type Props<T> = TableType<T> & {
	rowProps?: (row: T) => Record<string, any>;
	renderRow?: (row: T, index: number, renderer: () => React.ReactNode) => React.ReactNode;
};
export function Table(props: Props<any>) {
	const header = useMemo(() => {
		return (
			<thead>
				{props.columns?.map((cell) => {
					return (
						<th key={cell.dataKey} style={{ width: cell.width || undefined }} className="border p-2">
							{cell.title}
						</th>
					);
				})}
			</thead>
		);
	}, [props.columns]);

	const renderRow = useCallback((row: any, index: number) => {
		const rowProps = props.rowProps?.(row);

		return (
			<tr {...rowProps} key={index}>
				{props.columns.map((column) => {
					const value = row[column.dataKey];
					return <td className="border p-2">{column.render ? column.render(value, row) : value}</td>;
				})}
			</tr>
		);
	}, []);

	const body = useMemo(() => {
		if (!props.data?.length) {
			return (
				<tr>
					<td colSpan={props.columns.length} className="border p-2">
						No data available
					</td>
				</tr>
			);
		}

		return (
			<tbody>
				{props.data?.map((row, index) => {
					if (props.renderRow) {
						return props.renderRow(row, index, () => renderRow(row, index));
					}

					return renderRow(row, index);
				})}
			</tbody>
		);
	}, [props.columns, props.data]);

	return (
		<table>
			{header}
			{body}
		</table>
	);
}
