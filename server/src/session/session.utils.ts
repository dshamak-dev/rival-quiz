import { SessionDTO } from "@shared/session/model";

export async function calculatePrizePool(sessionData, answer) {
  const total = sessionData.pool || sessionData.totalUsers;
  // { userId, rate, value }
  const winnerUsers = [];
  const otherUsers = [];

  return {
    total,
    votesByQuestion: sessionData.votesByQuestion || {},
    totalUsers: sessionData.totalUsers,
    winnerUsers, // TODO: Determine winners based on prize pool
    otherUsers, // TODO: Update remaining users in session data
  };
}

export function normalizeSession(data): SessionDTO {
  return data?.json;
}

export function formatSessionQueryValue(name, query) {
  let value = query ? query.split(",").map((it) => it.trim()) : query;

  if (Array.isArray(value) && value.length === 1) {
    value = value[0];
  }

  switch (name) {
    case "state": {
      if (Array.isArray(value)) {
        return { $in: value.map((it) => Number(it)) };
      }

      return value;
    }
    default: {
      if (Array.isArray(value)) {
        return { $in: value };
      }

      return value;
    }
  }
}
