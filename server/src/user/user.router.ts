import { Request, Response, Router } from "express";
import { getRequestUser } from "./user.action";
import { getUserHistory } from "./api";
import {
  getUserWallet,
  lockWalletBalanceByUserId,
} from "@/services/wallet/actions";
import { expandResponse } from "@shared/async/helpers";
import { getErrorMessage } from "@shared/common/error.helper";

export function appendUserRoutes(router: Router) {
  router.get("/history", async (request: Request, response: Response) => {
    const user = await getRequestUser(request);

    if (!user) {
      response.statusMessage = "Unauthorized";
      response.status(401).end();
      return;
    }

    const userId = user.id;
    const history = await getUserHistory(userId);

    response.json(history);
  });

  router.post(
    "/:id/balance-lock",
    async (request: Request, response: Response) => {
      const user = await getRequestUser(request);

      if (!user) {
        response.statusMessage = "Unauthorized";
        response.status(401).end();
        return;
      }

      const userId = request.params.id;
      const value = request.body.amount;

      const [wallet, error] = await expandResponse(
        lockWalletBalanceByUserId(userId, value)
      );

      if (error) {
        response.statusMessage =
          getErrorMessage(error) || "Failed to lock balance";
        response.status(400).end();
        return;
      }

      response.status(200).end();
    }
  );
}
