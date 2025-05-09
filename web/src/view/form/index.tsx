import { ReactNode } from 'react';

type Props = {
	children: ReactNode | ReactNode[];
	onSubmit?: (data: Record<string, any>) => void;
	className?: string;
};
export function ObjectForm({ children, onSubmit, ...props }: Props) {
	const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();

		const formData = new FormData(e.target as HTMLFormElement);
		const data: Record<string, any> = {};

		formData.forEach((value, key) => {
			data[key] = value;
		});

		onSubmit?.(data);
	};

	return (
		<form {...props} onSubmit={handleSubmit}>
			{children}
		</form>
	);
}
