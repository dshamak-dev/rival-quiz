import React from "react";

export function HiddenInput({ ...props }: any) {
  return (
    <input
      {...props}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", opacity: 0 }}
      onChange={() => {}}
    />
  );
}
