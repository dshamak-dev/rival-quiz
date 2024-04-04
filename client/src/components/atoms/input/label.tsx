import React from "react";

export function Label({ id, hint = null, text = null, children = null, required = false }: any) {
  if (!children && !text) {
    return null;
  }

  return (
    <label
      htmlFor={id}
      title={hint || undefined}
      className="flex gap-1 items-end capitalize font-thin text-xs"
    >
      {children || text}
      {required ? (
        <span className="text-lg leading-3 text-red-500">*</span>
      ) : null}
    </label>
  );
}
