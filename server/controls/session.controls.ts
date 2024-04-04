export function parseSession(session, targetUser = null) {
  const {
    _id,
    users,
    capacity,
    transactions,
    ownerId,
    config,
    state,
    ...other
  } = session;

  const payload = {
    ...other,
    options: config?.options || [],
    id: _id,
    users: users?.length || 0,
    capacity: capacity || "∞",
  };

  if (targetUser) {
    payload.user = targetUser;
    payload.state = state?.users ? state.users[targetUser._id] : null;
  }

  return payload;
}
