import { useNavigate } from '@remix-run/react';
import { ButtonProps, Button } from '@view/button/button';

export type LinkButtonProps = ButtonProps & {
	href: string;
};

export function LinkButton({ href, ...props }: LinkButtonProps) {
	const navigate = useNavigate();
	const handleNavigate = () => {
		navigate(href);
	};

	return <Button {...props} onClick={handleNavigate} />;
}
