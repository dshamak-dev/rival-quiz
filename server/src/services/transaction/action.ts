import { addWalletBalanceByUserId } from "../wallet/actions";
import { create, findById, findByIdAndUpdate, model } from "./api";
import { TransactionStatusEnum } from "./model";

export async function createTransaction(from, to, payload) {
  if (!from || !to || from.id === to.id) {
    return Promise.reject("Invalid recipient or sender");
  }

  const amount = payload?.amount;

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return Promise.reject("Invalid transaction amount");
  }

  const transaction = await create({
    senderId: from.id,
    receiverId: to.id,
    type: payload?.type || "income",
    amount: payload.amount,
    data: {
      from,
      to,
      ...payload?.data,
    },
    reference: payload?.reference || "",
    details: payload?.details || "",
  });

  if (transaction.status === TransactionStatusEnum.Pending) {
    return validateTransactionById(transaction.id);
  }

  return transaction;
}

export async function getTransactionsForUser(userId) {
  return model
    .find({
      $or: [
        {
          senderId: userId,
        },
        {
          receiverId: userId,
        },
      ],
    })
    .sort({ created: -1 })
    .then((res) => res.map((it: any) => it.json));
}

export async function validateTransactionById(id) {
  const transaction = await findById(id);

  if (!transaction) {
    return Promise.reject("Transaction not found");
  }

  return validateTransaction(transaction);
}

export async function validateTransaction(transaction) {
  if (transaction.status === TransactionStatusEnum.Completed) {
    return Promise.reject("Transaction already completed");
  }

  if (transaction.status === TransactionStatusEnum.Failed) {
    return Promise.reject("Transaction failed");
  }

  if (transaction.senderId === transaction.receiverId) {
    return Promise.reject("Transaction cannot be sent to yourself");
  }

  // TODO: Add funds to wallet
  const [ok, walletError] = await addWalletBalanceByUserId(
    transaction.receiverId,
    transaction.amount
  )
    .then((res) => [res != null, null])
    .catch((error) => [null, error]);

  if (!ok || walletError != null) {
    return Promise.reject(walletError || "Failed to add funds to wallet");
  }

  return updateTransactionStatus(
    transaction.id,
    TransactionStatusEnum.Completed
  );
}

export async function updateTransactionStatus(id, status) {
  return findByIdAndUpdate(id, { status });
}
