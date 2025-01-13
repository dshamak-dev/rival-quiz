import { useAuth } from "@state/auth.hook";
import { Anchor } from "@view/anchor";
import { Icon } from "@view/icon";
import { Typography } from "@view/typography/typography";

export function UserAuthBadge() {
	const { user, logOut } = useAuth();

	if (user) {
		return (
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{user.email}</span>
				<Typography onClick={() => {
					logOut();
				}} className="cursor-pointer hover:text-red-500 text-sm font-medium">
                    <Icon name="DoorOpen" />
                </Typography>
            </div>
        );
	}

	return <Anchor href="/login" className="uppercase text-inherit font-inherit">log in</Anchor>;
}