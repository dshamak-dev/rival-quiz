import { faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { NavLink } from "src/components/atoms/link";
import { getSessionStageLabel } from "src/support/session.utils";

export const SessionList = ({
  items = [],
  loading = false,
  onItemRender = null,
}) => {
  if (loading) {
    return (
      <div>
        <FontAwesomeIcon icon={faSync} className="animate-spin" />
      </div>
    );
  }

  return !items?.length ? (
    <div>nothing found</div>
  ) : (
    <div className="flex flex-col gap-4 mb-4">
      {items.map((item) => (
        <SessionListItem key={item.id} item={item}>
          {onItemRender ? onItemRender(item) : null}
        </SessionListItem>
      ))}
    </div>
  );
};

export const SessionListItem = ({ item = null, children = null }) => {
  if (!item) {
    return null;
  }

  const { tag, title, capacity = 0, users = 0, stage } = item;
  return (
    <div className="grid grid-cols-[1fr_auto] gap-4 items-center px-4 py-2 border">
      <div className="flex gap-4 items-center">
        <NavLink to={`/play/${tag}`} className="border-b border-black">{title}</NavLink>
        <span>
          {users} / {capacity}
        </span>
        <span>{getSessionStageLabel(stage)}</span>
      </div>
      <div>{children}</div>
    </div>
  );
};
