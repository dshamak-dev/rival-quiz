import { QuestionDTO } from '@model/question.model';
import { Button } from '@view/button/button';
import { TextInput } from '@view/form/form.text-input';
import { Icon } from '@view/icon';
import { Typography } from '@view/typography/typography';
import classNames from 'classnames';

export type QuestionOptionsFormProps = {
	options?: QuestionDTO['options'];
	disabled?: boolean;
	onChange?: (options: QuestionDTO['options']) => void;
	answer?: QuestionDTO['answer'];
};

export function QuestionOptionsForm({ answer, options = [], disabled, onChange }: QuestionOptionsFormProps) {
	const handleAddOption = () => {
		if (onChange) {
			onChange(options.concat(['']));
		}
	};

	const handleRemoveOption = (index: number) => {
		if (onChange) {
			onChange(options.slice(0, index).concat(options.slice(index + 1)));
		}
	};

	const handleOptionChange = (index: number, value: string) => {
		if (onChange) {
			onChange([...options.slice(0, index), value, ...options.slice(index + 1)]);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			{options?.length ? (
				options.map((value, index) => {
					const isAnswer = answer === value;

					return (
						<div key={index} className="grid grid-cols-[18px_1fr_auto] gap-2">
							<div className="mt-6 p-1">
								<Icon name="CaretRight" size={12} />
							</div>
							<TextInput
								label={
									<Typography tag="span" size="small" className="inline-flex items-center gap-2">
										Option {index + 1}
									</Typography>
								}
								postfix={
									isAnswer && (
										<Typography
											tag="span"
											size="custom"
											className="ml-2 uppercase font-bold text-xs"
										>
											(Answer)
										</Typography>
									)
								}
								required
								value={value}
								disabled={disabled}
								className={classNames({
									'text-black': isAnswer,
								})}
								onChange={(e) => handleOptionChange(index, e.target.value)}
							/>
							{disabled ? null : (
								<div
									onClick={() => handleRemoveOption(index)}
									className="flex items-center h-full pt-4 cursor-pointer hover:text-amber-600"
								>
									<Icon name="Trash" />
								</div>
							)}
						</div>
					);
				})
			) : (
				<Typography className="text-xs text-gray-400">No options</Typography>
			)}
			{disabled ? null : (
				<Button
					disabled={disabled}
					onClick={handleAddOption}
					className="flex gap-1 items-center w-fit"
					size="small"
				>
					<Icon name="PlusCircle" /> Add Option
				</Button>
			)}
		</div>
	);
}
