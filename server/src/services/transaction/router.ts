import express from "express";
import { getRequestUser } from "../../user/user.action";
import {
  TransactionCreateDTO,
  TransactionStatusEnum,
} from "@shared/transaction/type";
import {
  createTransaction,
  findTransaction,
  findTransactionById,
  getTransactionsForUser,
  updateTransaction,
  validateTransactionById,
} from "./action";

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

router.post("/", async (req: any, res: any) => {
  const user = await getRequestUser(req);

  if (!user) {
    res.statusMessage = "Unauthorized";
    return res.status(403).end();
  }

  const {
    senderId,
    senderType,
    receiverId,
    receiverType,
    ...payload
  }: TransactionCreateDTO = req.body;

  const from = {
    id: senderId,
    type: senderType,
  };

  const to = {
    id: receiverId,
    type: receiverType,
  };

  const transaction = await createTransaction(from, to, payload);

  res.status(201).json(transaction);
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

router.patch("/:id/resolve", async (req: any, res: any) => {
  const user = await getRequestUser(req);

  if (!user) {
    res.statusMessage = "Unauthorized";
    return res.status(403).end();
  }

  const { paymentDetails } = req.body;

  const transaction = await findTransactionById(req.params.id);

  if (!transaction || transaction.status !== TransactionStatusEnum.Pending) {
    res.statusMessage = "Failed to resolve transaction";
    return res.status(400).end();
  }

  const { id, data } = transaction;

  const updated = await updateTransaction(id, {
    status: TransactionStatusEnum.Completed,
    data: { ...data, paymentDetails },
  });

  res.status(200).json(updated);
});

router.use(function (request, response, next: any) {
  next();
});

export default router;
