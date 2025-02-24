import { Request, Response, Router } from "express";
import { getRequestUser } from "./user.action";
import { getUserHistory } from "./api";

export function appendUserRoutes(router: Router) {
	router.get('/history', async (request: Request, response: Response) => {
		const user = await getRequestUser(request);

		if (!user) {
            response.statusMessage = 'Unauthorized';
            response.status(401).end();
			return;
        }

		const userId = user.id;
		const history = await getUserHistory(userId);

		response.json(history);
	})
}
