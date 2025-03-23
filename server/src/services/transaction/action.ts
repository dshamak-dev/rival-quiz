import { expandResponse } from "@shared/async/helpers";
import { addWalletBalanceByUserId } from "../wallet/actions";
import { create, findById, findByIdAndUpdate, model } from "./api";
import { TransactionStatusEnum } from "./model";
import { TransactionParty, TransactionPayload } from "./type";
import { addLog } from "../logger/api";
import { TransactionDTO, TransactionTypeEnum } from "@shared/transaction/type";

export async function createTransaction(
  from: TransactionParty,
  to: TransactionParty,
  payload: TransactionPayload
) {
  if (!from || !to || from.id === to.id) {
    return Promise.reject("Invalid recipient or sender");
  }

  const amount = Number(payload?.amount);

  if (Number.isNaN(amount) || amount <= 0) {
    return Promise.reject("Invalid transaction amount");
  }

  const canCreate = await canCreateTransaction(from, to, payload);

  if (!canCreate) {
    return Promise.reject("Failed to create transaction");
  }

  if (from.type === "user") {
    const [ok, walletError] = await expandResponse(
      addWalletBalanceByUserId(from.id, -amount)
    );

    if (!ok || walletError) {
      addLog({
        source: "create-transaction",
        message: walletError,
        data: {
          from,
          to,
          payload,
        },
      });
      return Promise.reject(walletError || "Failed to create transaction");
    }
  }

  const transaction = await create({
    senderId: from.id,
    senderType: from.type,
    receiverId: to.id,
    receiverType: to.type,
    type: payload?.type || "income",
    amount: payload.amount,
    data: {
      from,
      to,
      ...payload?.data,
    },
    reference: payload?.reference || "",
    details: payload?.details || "",
  }).catch(async (error) => {
    if (from.type === "user") {
      // Return to sender's wallet balance
      await addWalletBalanceByUserId(from.id, amount);
    }

    addLog({
      source: "create-transaction",
      message: error,
      data: {
        from,
        to,
        payload,
      },
    });

    return null;
  });

  // // TODO: unfreeze receiver balance
  // await addWalletBalanceByUserId(to.id, amount);

  if (!transaction) {
    return null;
  }

  const canAttemptResolve = getReolveApproval(transaction);

  if (canAttemptResolve) {
    return validateTransaction(transaction);
  }

  return transaction;
}

export function getReolveApproval(transaction: TransactionDTO) {
  if (!transaction) {
    return false;
  }

  if (![TransactionStatusEnum.Pending].includes(transaction.status)) {
    return false;
  }

  if (
    ![TransactionTypeEnum.Deposit, TransactionTypeEnum.TopUp].includes(
      transaction.type
    )
  ) {
    return false;
  }

  return true;
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

export async function canCreateTransaction(
  from: TransactionParty,
  to: TransactionParty,
  payload: TransactionPayload
): Promise<boolean> {
  if (!payload.unique) {
    return true;
  }

  const samePending = await model.findOne({
    senderId: from.id,
    receiverId: to.id,
    status: TransactionStatusEnum.Pending,
  });

  return samePending != null;
}

export async function findTransaction(query) {
  return model.findOne(query);
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

export async function findTransactionById(id) {
  return findById(id);
}

export async function updateTransactionStatus(id, status) {
  return findByIdAndUpdate(id, { status });
}

export async function updateTransaction(id, payload) {
  return findByIdAndUpdate(id, payload);
}
