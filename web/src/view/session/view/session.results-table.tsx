import { formatDecimal } from '@control/format.helpers';
import { SessionDTO } from '@model/session.model';
import { useAuth } from '@state/auth.hook';
import { Table } from '@view/atoms/table';
import { Typography } from '@view/typography/typography';
import classNames from 'classnames';
import { useMemo } from 'react';

type Props = {
	session: SessionDTO;
};

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
								<div className="text-center">
									<Typography size="large">{bet}</Typography>
									<Typography size="small">bet</Typography>
								</div>
								<div className="text-center">
									<Typography size="large">{prize}</Typography>
									<Typography size="small">prize</Typography>
								</div>
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
					<div className="flex gap-2 items-center">
						<Typography size="small">{formatDecimal(row.subtotal, 2)}</Typography>
						<span>-</span>
						<Typography
							size="small"
							className={classNames({
								'text-red-400': isLoss,
							})}
						>
							{formatDecimal(row.totalBets, 2)}
						</Typography>
						<span>=</span>
						<Typography
							size="large"
							className={classNames('font-bold', {
								'text-red-400': isLoss,
							})}
						>
							{value > 0 ? '+' : ''}
							{formatDecimal(value || 0, 2)}
						</Typography>
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

	const data = useMemo(() => {
		if (!session?.questions?.length || !summary?.length) {
			return [];
		}

		const rows = summary?.map((user: any, index: number) => {
			const row: any = {
				userName: `User ${index + 1}`,
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
		});

		return rows
			?.sort((a: any, b: any) => {
				return Number(b.total) - Number(a.total);
			})
			.map((it: any, index: number) => {
				return { ...it, number: index + 1 };
			});
	}, [summary]);

	return (
		<Table
			columns={columns}
			data={data}
			rowProps={(row: any) => {
				return {
					className: classNames({
						'bg-gray-100': row.userId === user?.id,
					}),
				};
			}}
		/>
	);
}
