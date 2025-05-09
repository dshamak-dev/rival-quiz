import { useAPI } from '@api/api.hook';
import { uploadFile } from '@api/upload.api';
import { Icon } from '@view/icon';
import { Image } from '@view/image/image';
import classNames from 'classnames';
import { useRef } from 'react';

type Props = {
	id: string;
	initialValue?: string;
	onChange?: (value: string) => void;
	disabled?: boolean;
	className?: string;
};

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export function ImageInput(props: Props) {
	const inputRef = useRef<HTMLInputElement>(null);
	const { loading, dispatch, data } = useAPI({
		request: (file: File) => {
			return uploadFile(file);
		},
	});

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target?.files?.[0];

		if (file && file?.size > MAX_SIZE) {
			alert('File size exceeds the maximum limit of 2MB.');
			return;
		}

		const uploadUrl = await dispatch(file).catch((err) => null);

		if (!uploadUrl) {
			return;
		}

		props.onChange?.(uploadUrl);

		// const reader = new FileReader();
		// reader.onload = function (e) {
		// 	const base64String = e?.target?.result;

		// 	if (!base64String) {
		// 		return;
		// 	}

		// 	props.onChange?.(base64String as string);
		// };

		// reader.onerror = function (e) {
		// 	console.log(e);
		// };

		// if (file) {
		// 	reader.readAsDataURL(file);
		// }
	};

	const handleClick = () => {
		if (props.disabled) {
			return;
		}

		inputRef.current?.click();
	};

	return (
		<div className={classNames('relative', props.className)}>
			{loading && (
				<div className="absolute top-0 left-0 w-full h-full bg-gray-100 opacity-50 flex items-center justify-center">
					<Icon name="ArrowClockwise" size={14} className={classNames('relative animate-spin')} />
				</div>
			)}
			<Image
				src={props.initialValue || '/logo'}
				className={classNames('w-full h-full object-contain', {
					'cursor-pointer': !props.disabled,
				})}
				onClick={handleClick}
			/>
			<input
				id={props.id}
				ref={inputRef}
				disabled={props.disabled}
				type="file"
				accept="image/*"
				style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, opacity: 0 }}
				onChange={handleChange}
			/>
		</div>
	);
}
