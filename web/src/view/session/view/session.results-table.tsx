import { spreadRange } from '@control/array.utils';
import { formatDecimal } from '@control/format.helpers';
import { SessionDTO } from '@model/session.model';
import { useAuth } from '@state/auth.hook';
import { Table } from '@view/atoms/table';
import { Typography } from '@view/typography/typography';
import classNames from 'classnames';
import { useCallback, useMemo } from 'react';

type Props = {
	session: SessionDTO;
};

const MAX_SCOREBOARD_ROWS = 5;

export function SessionResultsTable({ session }: Props) {
	const { user } = useAuth();

	const columns = useMemo(() => {
		const cells = [
			{
				title: '#',
				dataKey: 'number',
				render: (value: any) => <Typography>{value}.</Typography>,
				width: 'auto',
			},
			{
				title: 'User',
				dataKey: 'userName',
				render: (value: any, row: any) => (
					<Typography>{row.userId === user?.id ? <b>You</b> : value}</Typography>
				),
				width: 'auto',
			},
		];

		if (session.questions?.length) {
			session.questions.forEach((question, index) => {
				let title = `${question.title}`;

				if (question.hasAnswer) {
					title += ` (${question.answer})`;
				}

				cells.push({
					title: title,
					dataKey: question.id,
					render: (value: any) => {
						if (!value) {
							return <Typography>-</Typography>;
						}

						const bet = formatDecimal(value?.value, 2);
						const prize = formatDecimal(value?.prize, 2);

						return (
							<div className="flex gap-4 items-bottom">
								<Item label="bet" value={bet} />
								<Item label="prize" value={prize} />
								<div className="text-center">
									<Typography
										size="large"
										className={classNames({
											'line-through text-red-400': !value?.isMatch,
										})}
									>
										{value?.answer}
									</Typography>
									<Typography size="small">answer</Typography>
								</div>
							</div>
						);
					},
					width: 'auto',
				});
			});
		}

		cells.push({
			title: 'Total',
			dataKey: 'total',
			render: (value: any, row) => {
				const isLoss = Number(value) < 0;

				return (
					<div className="flex gap-4 items-center">
						<Item
							label="prize"
							value={formatDecimal(row.subtotal, 2)}
							valueProps={{
								size: 'small',
							}}
						/>
						<span>-</span>
						<Item
							label="bets"
							value={formatDecimal(row.totalBets, 2)}
							valueProps={{
								size: 'small',
							}}
						/>
						<span>=</span>
						<Item
							label="total"
							value={`${value > 0 ? '+' : ''}
									${formatDecimal(value || 0, 2)}`}
							valueProps={{
								className: classNames({
									'text-red-400': isLoss,
								}),
							}}
						/>
					</div>
				);
			},
			width: 'auto',
		});

		return cells;
	}, []);

	const summary = useMemo(() => {
		if (!session?.data?.history) {
			return null;
		}

		return Object.entries(session.data.history).reduce((accum, [userId, userHistoryByQuestion]: any) => {
			const record: any = { userId, ...userHistoryByQuestion };

			accum.push(record);

			return accum;
		}, [] as any);
	}, [session.data, session.questions]);

	const calculateRowTruncation = useCallback(
		(rows: any) => {
			const activeUserIndex = rows.findIndex((it: any) => it.userId === user?.id);
			const visibleIndexes = [0];
			const dividerIndexes = [];

			const closestNum = Math.max(MAX_SCOREBOARD_ROWS - 3, 2);
			const offset = Math.max(Math.floor(closestNum / 2), 1);
			const before = activeUserIndex - offset;
			const after = activeUserIndex + offset;

			if (before - 1 > 0) {
				dividerIndexes.push(before - 1);
			}

			if (before > 0 && before < activeUserIndex) {
				visibleIndexes.push(...spreadRange(before, activeUserIndex - 1));
			}

			visibleIndexes.push(activeUserIndex);

			if (after < rows.length - 1 && after > activeUserIndex) {
				visibleIndexes.push(...spreadRange(activeUserIndex + 1, after));
			}

			if (after + 1 < rows.length - 1) {
				dividerIndexes.push(after + 1);
			}

			visibleIndexes.push(rows.length - 1);

			return { visibleIndexes, dividerIndexes };
		},
		[user?.id]
	);

	const data = useMemo(() => {
		if (!session?.questions?.length || !summary?.length) {
			return [];
		}

		let rows = summary
			?.map((user: any) => {
				const row: any = {
					userId: user.userId,
					totalBets: 0,
					subtotal: 0,
					total: 0,
				};

				session.questions?.forEach((q) => {
					const vote = user[q.id];

					if (vote != null) {
						row[q.id] = {
							...vote,
						};

						const prize = Number(vote.prize) || 0;
						const bet = Number(vote.value) || 0;

						row.totalBets += bet;

						row.subtotal += prize;

						row.total = row.subtotal - row.totalBets;
					}
				});

				return row;
			})
			?.sort((a: any, b: any) => {
				return Number(b.total) - Number(a.total);
			});

		const showAllRows = rows?.length <= MAX_SCOREBOARD_ROWS;

		if (!showAllRows) {
			const { visibleIndexes, dividerIndexes } = calculateRowTruncation(rows);

			rows = rows.map((row: any, index: number) => {
				const nextRow = { ...row };
				const visible = visibleIndexes.includes(index) || dividerIndexes.includes(index);
				nextRow.hidden = !visible;
				nextRow.divider = dividerIndexes.includes(index);
				return nextRow;
			});
		}

		return rows.map((it: any, index: number) => {
			return { ...it, userName: `User ${index + 1}`, number: index + 1 };
		});
	}, [summary]);

	return (
		<Table
			columns={columns}
			data={data}
			renderRow={(row: any, index: number, renderer) => {
				if (row.hidden) {
					return null;
				}

				if (row.divider) {
					return (
						<tr key={index} className="border">
							<td colSpan={columns.length} className="text-center p-2">
								...
							</td>
						</tr>
					);
				}

				return renderer();
			}}
			rowProps={(row: any) => {
				return {
					className: classNames({
						'bg-cyan-100': row.userId === user?.id,
					}),
				};
			}}
		/>
	);
}

function Item({ value, label, valueProps }: { label: string; value: string | number; valueProps?: any }) {
	return (
		<div className="text-center">
			<Typography size="large" {...valueProps}>
				{value}
			</Typography>
			<Typography size="small">{label}</Typography>
		</div>
	);
}
