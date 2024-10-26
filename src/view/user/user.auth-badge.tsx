import { useAuth } from "@state/user.auth";
import { Anchor } from "@view/anchor";

export function UserAuthBadge() {
	const { user } = useAuth();

	if (user) {
		return (
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{user.email}</span>
            </div>
        );
	}

	return <Anchor href="/login" className="uppercase text-inherit font-inherit">log in</Anchor>;
}