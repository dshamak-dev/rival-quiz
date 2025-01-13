import { Icon } from "@view/icon";
import { Typography } from "@view/typography/typography";

export default function ProfileIntoPage() {
	return (
		<div className="h-full flex flex-col items-center justify-center justify-self-center align-self-center">
			<Icon size={48} name="Person" className="relative -top-6 animate-bounce" />
			<Typography className="text-center relative">TBD 2025</Typography>
		</div>
	);
}
