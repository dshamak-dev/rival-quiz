import { BroadcastEntityEnum, broadcastManager } from "../broadcast/model";
import { create, findByIdAndUpdate, findOne, findById } from "./api";

export async function createWallet(userId, payload = {}) {
  if (!userId) {
    return Promise.reject("Invalid user ID");
  }

  return create({
    ...payload,
    userId,
  });
}

export async function getUserWallet(userId) {
  return findOne({
    userId,
  });
}

export async function getWalletById(id) {
  return findById(id);
}

export async function addWalletBalanceByUserId(userId, value) {
  const wallet = await getUserWallet(userId);

  if (!wallet) {
    return Promise.reject("User wallet not found");
  }

  return addWalletBalance(wallet.id, value);
}

export async function lockWalletBalanceByUserId(userId, value: number) {
  const wallet = await getUserWallet(userId);

  if (!wallet) {
    return Promise.reject("User wallet not found");
  }

  if (Number.isNaN(value)) {
    return Promise.reject("Invalid balance amount");
  }

  let nextBalance = Number(wallet.balance || 0) - value;

  nextBalance = Number(nextBalance.toFixed(2));

  return findByIdAndUpdate(wallet.id, {
    $set: { balance: nextBalance },
    $inc: { locked: value },
  }).then((wallet) => {
    broadcastManager.send({
      entity: BroadcastEntityEnum.WALLET,
      payload: {
        id: wallet.id,
        userId: wallet.userId,
        balance: wallet.balance,
      },
      message: { text: `User wallet balance updated: ${wallet.balance}` },
    });

    return wallet;
  });
}

export async function addWalletBalance(id, value) {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return Promise.reject("Invalid balance amount");
  }

  return findByIdAndUpdate(id, {
    $inc: { balance: amount },
  }).then((wallet) => {
    broadcastManager.send({
      entity: BroadcastEntityEnum.WALLET,
      payload: {
        id: wallet.id,
        userId: wallet.userId,
        balance: wallet.balance,
      },
      message: { text: `User wallet balance updated: ${wallet.balance}` },
    });

    return wallet;
  });
}
