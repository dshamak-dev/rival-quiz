import { useNavigate } from '@remix-run/react';
import { ButtonProps, Button } from '@view/button/button';

export type LinkButtonProps = ButtonProps & {
	href: string;
};

export function LinkButton({ href, ...props }: LinkButtonProps) {
	const navigate = useNavigate();
	const handleNavigate = () => {
		const { pathname } = new URL(href);

		navigate(pathname || href, { replace: true });
	};

	return <Button {...props} onClick={handleNavigate} />;
}
