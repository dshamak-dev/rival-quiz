import express from "express";
import { getRequestUser } from "../../user/user.action";
import { getTransactionsForUser, validateTransactionById } from "./action";

const router = express.Router();

router.use(express.json());

router.get("/", async (req: any, res: any) => {
  const user = await getRequestUser(req);

  if (!user) {
    res.statusMessage = "User not found";
    return res.status(404).end();
  }

  const transactions = await getTransactionsForUser(user.id).catch((err) => {
    console.log("Error getting transactions: ", err);
    return [];
  });

  res.status(200).json(transactions);
});

router.post("/:id/validate", async (req: any, res: any) => {
  const user = await getRequestUser(req);

  if (!user) {
    res.statusMessage = "User not found";
    return res.status(404).end();
  }

  const transactionId = req.params.id;

  const updated = await validateTransactionById(transactionId).catch((err) => {
    console.log("Error validating transaction: ", err);
    return null;
  });

  res.status(200).json(updated);
});

router.use(function (request, response, next:any) {
  next();
});

export default router;
