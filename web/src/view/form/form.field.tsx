import { useMemo } from 'react';
import { TextInput, TextInputProps } from './form.text-input';

export type FormFieldProps = TextInputProps;

export function FormField(props: FormFieldProps) {
	const input = useMemo(() => {
		return <TextInput {...props} />;
	}, [props.type, props]);

	return input;
}
